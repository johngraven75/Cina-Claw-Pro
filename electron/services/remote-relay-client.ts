import { randomBytes, randomUUID } from 'node:crypto';
import type { GatewayManager } from '../gateway/manager';
import { logger } from '../utils/logger';
import { getSetting, setSetting } from '../utils/store';

const DEFAULT_POLL_MS = 15_000;
const REMOTE_TASK_TIMEOUT_MS = 120_000;

export type RemoteRelayStatus = {
  enabled: boolean;
  relayUrl: string;
  gatewayId?: string;
  polling: boolean;
  lastSuccessfulPollAt?: string;
  lastError?: string;
};

export type RemoteRelayDevice = {
  id: string;
  name: string;
  status: 'active' | 'revoked';
  createdAt: string;
  lastSeenAt: string;
  revokedAt?: string;
};

type RelayConfiguration = {
  relayUrl: string;
  enabled: boolean;
  gatewayId: string;
  gatewayToken: string;
};

type LeasedTask = {
  id: string;
  message: string;
  agentId?: string;
  skillId?: string;
  idempotencyKey: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function trimError(value: unknown): string {
  const text = value instanceof Error ? value.message : String(value);
  return text.replace(/\s+/g, ' ').slice(0, 240);
}

function isSafeAgentId(value: string | undefined): value is string {
  return !!value && /^[A-Za-z0-9_-]{1,120}$/.test(value);
}

function normalizeRelayUrl(value: string): string {
  const parsed = new URL(value.trim());
  const localHttp = parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
  if (parsed.protocol !== 'https:' && !localHttp) {
    throw new Error('Remote relay URLs must use HTTPS outside local development.');
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  return parsed.toString().replace(/\/$/, '');
}

function createGatewayId(): string {
  return `gateway_${randomBytes(18).toString('base64url')}`;
}

function createGatewayToken(): string {
  return `gateway_${randomBytes(32).toString('base64url')}`;
}

export function buildRemoteSessionKey(agentId: string | undefined, deviceId: string): string {
  const agent = isSafeAgentId(agentId) ? agentId : 'main';
  return `agent:${agent}:remote:${deviceId}`;
}

export function extractGatewayRunId(value: unknown): string | undefined {
  const record = asRecord(value);
  return asText(record?.runId) ?? asText(record?.id);
}

export class RemoteRelayClient {
  private timer: NodeJS.Timeout | undefined;
  private polling = false;
  private lastSuccessfulPollAt: string | undefined;
  private lastError: string | undefined;

  constructor(private readonly gatewayManager: Pick<GatewayManager, 'getStatus' | 'rpc'>) {}

  async getStatus(): Promise<RemoteRelayStatus> {
    const config = await this.readConfiguration();
    return {
      enabled: config.enabled,
      relayUrl: config.relayUrl,
      gatewayId: config.gatewayId || undefined,
      polling: this.polling,
      lastSuccessfulPollAt: this.lastSuccessfulPollAt,
      lastError: this.lastError,
    };
  }

  async configure(input: { relayUrl: string; enabled: boolean }): Promise<RemoteRelayStatus> {
    const relayUrl = input.relayUrl.trim() ? normalizeRelayUrl(input.relayUrl) : '';
    if (input.enabled && !relayUrl) throw new Error('A remote relay URL is required before enabling remote mobile execution.');
    const current = await this.readConfiguration();
    const gatewayId = current.gatewayId || createGatewayId();
    const gatewayToken = current.gatewayToken || createGatewayToken();
    await Promise.all([
      setSetting('remoteRelayUrl', relayUrl),
      setSetting('remoteRelayEnabled', input.enabled),
      setSetting('remoteRelayGatewayId', gatewayId),
      setSetting('remoteRelayGatewayToken', gatewayToken),
    ]);
    await this.start();
    return this.getStatus();
  }

  async start(): Promise<void> {
    this.stop();
    const config = await this.readConfiguration();
    if (!config.enabled || !config.relayUrl || !config.gatewayId || !config.gatewayToken) return;
    void this.pollOnce();
    this.timer = setInterval(() => void this.pollOnce(), DEFAULT_POLL_MS);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.polling = false;
  }

  async createPairingCode(): Promise<{ code: string; expiresAt: string }> {
    const config = await this.requireEnabledConfiguration();
    await this.claimGateway(config);
    return this.request<{ code: string; expiresAt: string }>(config, '/api/relay/gateways/pairing-code', { method: 'POST' });
  }

  async listDevices(): Promise<RemoteRelayDevice[]> {
    const config = await this.requireEnabledConfiguration();
    const response = await this.request<{ devices?: unknown }>(config, '/api/relay/gateways/devices');
    return Array.isArray(response.devices)
      ? response.devices.flatMap((value) => {
          const item = asRecord(value);
          const id = asText(item?.id);
          const name = asText(item?.name);
          const status = item?.status === 'active' || item?.status === 'revoked' ? item.status : undefined;
          const createdAt = asText(item?.createdAt);
          const lastSeenAt = asText(item?.lastSeenAt);
          if (!id || !name || !status || !createdAt || !lastSeenAt) return [];
          return [{ id, name, status, createdAt, lastSeenAt, ...(asText(item?.revokedAt) ? { revokedAt: asText(item?.revokedAt) } : {}) }];
        })
      : [];
  }

  async revokeDevice(deviceId: string): Promise<void> {
    const config = await this.requireEnabledConfiguration();
    if (!/^device_[A-Za-z0-9_-]+$/.test(deviceId)) throw new Error('Invalid paired device identifier.');
    await this.request(config, `/api/relay/gateways/devices/${encodeURIComponent(deviceId)}`, { method: 'DELETE' });
  }

  private async pollOnce(): Promise<void> {
    if (this.polling || this.gatewayManager.getStatus().state !== 'running') return;
    const config = await this.readConfiguration();
    if (!config.enabled || !config.relayUrl || !config.gatewayId || !config.gatewayToken) return;
    this.polling = true;
    try {
      await this.claimGateway(config);
      const poll = await this.request<{ task?: unknown }>(config, '/api/relay/gateways/poll', { method: 'POST' });
      const task = this.parseLeasedTask(poll.task);
      this.lastSuccessfulPollAt = new Date().toISOString();
      this.lastError = undefined;
      if (task) await this.dispatchTask(config, task);
    } catch (error) {
      this.lastError = trimError(error);
      logger.warn(`[remote-relay] Gateway poll failed: ${this.lastError}`);
    } finally {
      this.polling = false;
    }
  }

  private parseLeasedTask(value: unknown): LeasedTask | null {
    const task = asRecord(value);
    const id = asText(task?.id);
    const message = asText(task?.message);
    const idempotencyKey = asText(task?.idempotencyKey);
    if (!id || !message || !idempotencyKey) return null;
    return { id, message, idempotencyKey, agentId: asText(task?.agentId), skillId: asText(task?.skillId) };
  }

  private async dispatchTask(config: RelayConfiguration, task: LeasedTask): Promise<void> {
    try {
      const managedSkill = task.skillId && /^[A-Za-z0-9_-]{1,120}$/.test(task.skillId)
        ? `\n\n[Managed skill requested: ${task.skillId}]`
        : '';
      const result = await this.gatewayManager.rpc<unknown>('chat.send', {
        sessionKey: buildRemoteSessionKey(task.agentId, config.gatewayId),
        message: `${task.message}${managedSkill}`,
        ...(isSafeAgentId(task.agentId) ? { agentId: task.agentId } : {}),
        idempotencyKey: task.idempotencyKey || randomUUID(),
      }, REMOTE_TASK_TIMEOUT_MS);
      await this.completeTask(config, task.id, { status: 'dispatched', gatewayRunId: extractGatewayRunId(result) });
    } catch (error) {
      await this.completeTask(config, task.id, { status: 'failed', errorMessage: trimError(error) });
    }
  }

  private async completeTask(config: RelayConfiguration, taskId: string, body: { status: 'dispatched' | 'failed'; gatewayRunId?: string; errorMessage?: string }): Promise<void> {
    await this.request(config, `/api/relay/gateways/tasks/${encodeURIComponent(taskId)}/complete`, { method: 'POST', body: JSON.stringify(body) });
  }

  private async claimGateway(config: RelayConfiguration): Promise<void> {
    await this.request(config, '/api/relay/gateways/claim', { method: 'POST', body: JSON.stringify({ gatewayId: config.gatewayId, gatewayToken: config.gatewayToken, name: 'CinaClaw Pro Desktop' }) }, false);
  }

  private async requireEnabledConfiguration(): Promise<RelayConfiguration> {
    const config = await this.readConfiguration();
    if (!config.enabled || !config.relayUrl || !config.gatewayId || !config.gatewayToken) throw new Error('Enable and save a remote relay URL before pairing a mobile device.');
    return config;
  }

  private async readConfiguration(): Promise<RelayConfiguration> {
    const [relayUrl, enabled, gatewayId, gatewayToken] = await Promise.all([
      getSetting('remoteRelayUrl'),
      getSetting('remoteRelayEnabled'),
      getSetting('remoteRelayGatewayId'),
      getSetting('remoteRelayGatewayToken'),
    ]);
    return { relayUrl, enabled, gatewayId, gatewayToken };
  }

  private async request<T = Record<string, never>>(config: RelayConfiguration, pathname: string, init: RequestInit = {}, authenticated = true): Promise<T> {
    const response = await fetch(new URL(pathname, `${config.relayUrl}/`), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(authenticated ? { authorization: `Bearer ${config.gatewayToken}`, 'x-cinaclaw-gateway-id': config.gatewayId } : {}),
        ...(init.headers ?? {}),
      },
    });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(asText(payload.error) ?? `Relay request failed (${response.status}).`);
    return payload as T;
  }
}
