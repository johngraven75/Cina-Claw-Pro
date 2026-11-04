/**
 * Main-process Ollama health + model inventory + autoconfig actions
 * (v1.0.7: chat pre-attachment autoconfig).
 *
 * Renderer must never fetch Ollama directly; it calls hostApi.ollama.*
 * and this service probes/starts/pulls from the main process.
 *
 * Scope guards:
 *   - Only loopback base URLs are accepted (127.0.0.1, ::1, localhost).
 *     Anything else is rejected without a request, so a crafted renderer
 *     payload cannot turn this probe into an SSRF fetch.
 *   - `pull` accepts ONLY the pre-attached catalog-v2 model IDs (the
 *     Qwen3-VL 8B/4B/2B Instruct builds, with or without the `-instruct`
 *     suffix). A renderer payload cannot pull an arbitrary model.
 *   - `start` runs only the local `ollama serve` binary with no arguments
 *     from the renderer, detached, and only when the probe is down.
 *
 * What this proves — and what it does not:
 *   - status "up" proves GET /api/tags answered on the loopback server.
 *   - models lists the tags the server reported (e.g. "qwen3-vl:8b-instruct").
 *     Chat compares the selected model against this list before claiming
 *     it is pulled; a model absent from the list is shown as "needs pull",
 *     never as ready.
 *   - status "down" proves nothing about why Ollama is down, only that the
 *     probe failed or timed out.
 *   - `start` cannot install Ollama: if the binary is absent it reports
 *     that plainly (install Ollama, then retry) instead of pretending.
 *   - `autoconfig` never silently substitutes an unrelated installed model:
 *     it reports a pulled pre-attached fallback as `selectedModelRef`
 *     (published fallback list only) and any other pulled model only as
 *     `installedFallbackModelId`, which Chat offers as an explicit
 *     one-click choice, never as a silent switch.
 */
import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import { execFile, spawn } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';

export type OllamaHealthResult = {
  status: 'up' | 'down';
  baseUrl: string;
  models: string[];
  checkedAt: string;
  error?: string;
};

/** Pre-attached catalog-v2 Ollama models that `pull` may fetch. */
export const OLLAMA_PULL_ALLOWLIST: readonly string[] = [
  'qwen3-vl:8b-instruct',
  'qwen3-vl:8b',
  'qwen3-vl:4b-instruct',
  'qwen3-vl:4b',
  'qwen3-vl:2b-instruct',
  'qwen3-vl:2b',
];

/** Priority order for autoconfig selection (published fallback list). */
export const OLLAMA_AUTOCONFIG_PRIORITY: readonly string[] = [
  'qwen3-vl:8b-instruct',
  'qwen3-vl:8b',
  'qwen3-vl:4b-instruct',
  'qwen3-vl:4b',
  'qwen3-vl:2b-instruct',
  'qwen3-vl:2b',
];

export function normalizeOllamaModelId(raw: string | undefined): string | null {
  const value = (raw || '').trim().toLowerCase().replace(/:latest$/, '');
  if (!value) return null;
  return OLLAMA_PULL_ALLOWLIST.includes(value) ? value : null;
}

function modelIdMatchesTag(modelId: string, tag: string): boolean {
  const normalized = tag.toLowerCase().replace(/:latest$/, '');
  return normalized === modelId || normalized === `${modelId}:latest`;
}

export const DEFAULT_OLLAMA_HEALTH_BASE_URL = 'http://127.0.0.1:11434';

function normalizeLoopbackBaseUrl(raw: string | undefined): string | null {
  const candidate = (raw || DEFAULT_OLLAMA_HEALTH_BASE_URL).replace(/\/$/, '');
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!['127.0.0.1', '::1', 'localhost'].includes(url.hostname)) return null;
  return `${url.protocol}//${url.host}`;
}

/** Hard cap for the Ollama /api/tags body (CodeAnt CRITICAL, v1.0.7): the tag list is small; anything larger is refused, never buffered unbounded. */
const OLLAMA_TAGS_MAX_BYTES = 1_048_576;

function fetchTags(baseUrl: string, timeoutMs: number): Promise<{ models: string[] }> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(`${baseUrl}/api/tags`);
    } catch (error) {
      reject(error);
      return;
    }
    const request = (url.protocol === 'https:' ? https : http).get(
      url,
      { timeout: timeoutMs },
      (response) => {
        const chunks: Buffer[] = [];
        let totalBytes = 0;
        response.on('data', (chunk: Buffer | string) => {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          totalBytes += buffer.length;
          if (totalBytes > OLLAMA_TAGS_MAX_BYTES) {
            request.destroy(new Error('Ollama /api/tags response exceeded the 1 MB cap'));
            return;
          }
          chunks.push(buffer);
        });
        response.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
              models?: Array<{ name?: unknown }>;
            };
            const models = Array.isArray(parsed.models)
              ? parsed.models
                .map((entry) => (typeof entry.name === 'string' ? entry.name : ''))
                .filter(Boolean)
              : [];
            resolve({ models });
          } catch {
            // Any HTTP answer proves the server is up, even if the body is
            // not the expected tags JSON; report up with an empty list
            // rather than failing the whole probe.
            resolve({ models: [] });
          }
        });
      },
    );
    request.on('timeout', () => {
      request.destroy(new Error('Ollama probe timed out'));
    });
    request.on('error', reject);
  });
}

async function probe(baseUrl: string): Promise<{ status: 'up' | 'down'; models: string[]; error?: string }> {
  try {
    const { models } = await fetchTags(baseUrl, 2000);
    return { status: 'up', models };
  } catch (error) {
    return {
      status: 'down',
      models: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function waitForUp(baseUrl: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await probe(baseUrl);
    if (result.status === 'up') return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

export function createOllamaApi(): CompleteHostServiceRegistry['ollama'] {
  return {
    async health(payload) {
      const baseUrl = normalizeLoopbackBaseUrl(payload?.baseUrl);
      const checkedAt = new Date().toISOString();
      if (!baseUrl) {
        return {
          status: 'down',
          baseUrl: payload?.baseUrl ?? DEFAULT_OLLAMA_HEALTH_BASE_URL,
          models: [],
          checkedAt,
          error: 'Only loopback Ollama base URLs are allowed',
        };
      }
      const result = await probe(baseUrl);
      return { status: result.status, baseUrl, models: result.models, checkedAt, error: result.error };
    },
    async start(payload) {
      const baseUrl = normalizeLoopbackBaseUrl(payload?.baseUrl);
      const checkedAt = new Date().toISOString();
      if (!baseUrl) {
        return {
          started: false,
          alreadyRunning: false,
          status: 'down',
          baseUrl: payload?.baseUrl ?? DEFAULT_OLLAMA_HEALTH_BASE_URL,
          models: [],
          checkedAt,
          error: 'Only loopback Ollama base URLs are allowed',
        };
      }
      const current = await probe(baseUrl);
      if (current.status === 'up') {
        return { started: false, alreadyRunning: true, status: 'up', baseUrl, models: current.models, checkedAt };
      }
      let spawnError: string | undefined;
      try {
        const child = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore' });
        child.unref();
        await new Promise((resolve) => {
          child.once('error', (error: Error) => {
            spawnError = error.message;
            resolve(undefined);
          });
          // Give a successful spawn a tick to surface an immediate error.
          setTimeout(resolve, 250);
        });
      } catch (error) {
        spawnError = error instanceof Error ? error.message : String(error);
      }
      if (spawnError) {
        return {
          started: false,
          alreadyRunning: false,
          status: 'down',
          baseUrl,
          models: [],
          checkedAt,
          error: `Ollama is not installed or could not be started (${spawnError}). Install Ollama, then retry.`,
        };
      }
      const up = await waitForUp(baseUrl, 10_000);
      const after = await probe(baseUrl);
      return {
        started: up,
        alreadyRunning: false,
        status: after.status,
        baseUrl,
        models: after.models,
        checkedAt,
        error: up ? undefined : 'Ollama did not come up within 10 seconds. Start it manually, then recheck.',
      };
    },
    async pull(payload) {
      const baseUrl = normalizeLoopbackBaseUrl(payload?.baseUrl);
      const checkedAt = new Date().toISOString();
      const model = normalizeOllamaModelId(payload?.model);
      if (!baseUrl) {
        return {
          pulled: false,
          model: payload?.model ?? '',
          status: 'down',
          baseUrl: payload?.baseUrl ?? DEFAULT_OLLAMA_HEALTH_BASE_URL,
          models: [],
          checkedAt,
          error: 'Only loopback Ollama base URLs are allowed',
        };
      }
      if (!model) {
        return {
          pulled: false,
          model: payload?.model ?? '',
          status: 'down',
          baseUrl,
          models: [],
          checkedAt,
          error: 'Only the pre-attached Qwen3-VL 8B/4B/2B models can be pulled from the app.',
        };
      }
      const current = await probe(baseUrl);
      if (current.status === 'down') {
        return {
          pulled: false,
          model,
          status: 'down',
          baseUrl,
          models: [],
          checkedAt,
          error: 'Ollama is not running. Start Ollama first, then pull.',
        };
      }
      if (current.models.some((tag) => modelIdMatchesTag(model, tag))) {
        return { pulled: true, model, status: 'up', baseUrl, models: current.models, checkedAt, alreadyPulled: true };
      }
      const pullError: string | undefined = await new Promise((resolve) => {
        // execFile buffers stdout/stderr: raise maxBuffer above the 1 MB
        // default so a long pull log cannot fail the pull spuriously, and
        // still cap it (10 MB) rather than leaving it unbounded.
        execFile('ollama', ['pull', model], { timeout: 600_000, maxBuffer: 10 * 1024 * 1024 }, (error) => {
          resolve(error ? (error.message || String(error)) : undefined);
        });
      });
      const after = await probe(baseUrl);
      if (pullError) {
        return { pulled: false, model, status: after.status, baseUrl, models: after.models, checkedAt, error: pullError };
      }
      const pulled = after.models.some((tag) => modelIdMatchesTag(model, tag));
      return {
        pulled,
        model,
        status: after.status,
        baseUrl,
        models: after.models,
        checkedAt,
        error: pulled ? undefined : `Pull finished but ${model} was not reported by Ollama. Recheck, then retry.`,
      };
    },
    async autoconfig(payload) {
      const baseUrl = normalizeLoopbackBaseUrl(payload?.baseUrl);
      const checkedAt = new Date().toISOString();
      if (!baseUrl) {
        return {
          status: 'down',
          baseUrl: payload?.baseUrl ?? DEFAULT_OLLAMA_HEALTH_BASE_URL,
          models: [],
          selectedModelId: null,
          selectedModelRef: null,
          fromPreattachedFallback: false,
          installedFallbackModelId: null,
          startedOllama: false,
          checkedAt,
          error: 'Only loopback Ollama base URLs are allowed',
        };
      }
      let startedOllama = false;
      let current = await probe(baseUrl);
      if (current.status === 'down') {
        // Best-effort auto-start: a fresh install should not dead-end on a
        // stopped server. If the binary is missing this fails fast and the
        // caller shows the install guidance instead of spinning.
        const started = await this.start({ baseUrl });
        startedOllama = started.started;
        current = { status: started.status, models: started.models };
      }
      if (current.status === 'down') {
        return {
          status: 'down',
          baseUrl,
          models: [],
          selectedModelId: null,
          selectedModelRef: null,
          fromPreattachedFallback: false,
          installedFallbackModelId: null,
          startedOllama,
          checkedAt,
          error: 'Ollama is not running and could not be started. Install/start Ollama, then retry.',
        };
      }
      const pulled = current.models.map((tag) => tag.toLowerCase().replace(/:latest$/, ''));
      const selectedPreattached = OLLAMA_AUTOCONFIG_PRIORITY.find((id) => pulled.some((tag) => tag === id));
      if (selectedPreattached) {
        return {
          status: 'up',
          baseUrl,
          models: current.models,
          selectedModelId: selectedPreattached,
          selectedModelRef: `ollama/${selectedPreattached}`,
          fromPreattachedFallback: selectedPreattached !== OLLAMA_AUTOCONFIG_PRIORITY[0]
            && selectedPreattached !== OLLAMA_AUTOCONFIG_PRIORITY[1],
          installedFallbackModelId: null,
          startedOllama,
          checkedAt,
        };
      }
      // No pre-attached model pulled: surface the first other installed
      // model as an explicit offer only — never an automatic switch.
      const installed = [...new Set(pulled)].sort()[0] ?? null;
      return {
        status: 'up',
        baseUrl,
        models: current.models,
        selectedModelId: null,
        selectedModelRef: null,
        fromPreattachedFallback: false,
        installedFallbackModelId: installed,
        startedOllama,
        checkedAt,
        error: installed
          ? undefined
          : 'No pre-attached model is pulled yet. Pull Qwen3-VL 8B (or 4B/2B) from the chat status, or use an installed model.',
      };
    },
  };
}
