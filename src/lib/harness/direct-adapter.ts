/**
 * Cina harness layer — Direct engine adapter (STUB in this draft).
 *
 * The DirectAdapter is the future second engine: OpenAI-compatible
 * chat against a local Ollama server or OpenRouter, for simple chat,
 * streaming, and tool calls where the target API supports them —
 * without the OpenClaw gateway. It is a stub here, deliberately, for
 * one concrete reason: there is no host route the renderer may use
 * for OpenAI-compatible chat yet, and the renderer must never fetch
 * Ollama (or the gateway) directly. Building that host proxy route
 * is the remaining work; until it exists, a "working" DirectAdapter
 * would have to break the host-api boundary, so it does not exist.
 *
 * What the stub DOES provide, so the future swap is transport-only:
 * - the full EngineAdapter shape, registered in HARNESS_ENGINES;
 * - capability flags that are all false except the declared intent
 *   (simpleChat is the eventual scope, not a current capability);
 * - buildDirectChatRequest(): the pure OpenAI-compatible request body
 *   for a model + messages, so the future host route only has to
 *   carry this body and stream the response back.
 *
 * What it does NOT do — and must not be claimed to do:
 * - replace OpenClaw for channels, cron, or ACP sessions;
 * - run simple chat (sendSimpleChat returns ok:false with the reason);
 * - silently fall back to OpenClaw. An unavailable engine is a visible
 *   "not available" state; the harness store keeps OpenClaw as the
 *   effective engine while Direct is unavailable.
 */
import type { ChatMode } from '@/stores/chat-mode';
import type { ConfiguredModelOption } from '@/lib/model-options';
import { buildModeDirectives } from '@/lib/chat-mode-directives';
import { resolveHarnessModelRoute } from './model-routing';
import { toolRoutingForMode } from './tool-routing';
import type {
  DirectChatMessage,
  DirectChatRequest,
  DirectChatResult,
  EngineAdapter,
  HarnessRoute,
  HarnessTurnPlan,
} from './types';

export const DIRECT_ADAPTER_UNAVAILABLE_REASON =
  'Direct engine is not available yet: no host route exists for OpenAI-compatible chat, and the renderer must not fetch Ollama or the gateway directly. Chat continues through the OpenClaw engine.';

export const directAdapter: EngineAdapter = {
  id: 'direct',
  labelKey: 'harness.engineDirect',
  available: false,
  unavailableReason: DIRECT_ADAPTER_UNAVAILABLE_REASON,
  capabilities: {
    agentSessions: false,
    streaming: false,
    toolCalls: false,
    channels: false,
    cron: false,
    acpSessions: false,
    simpleChat: false,
  },

  resolveRoute(input: {
    sessionKey: string;
    preferredModelRef: string | null | undefined;
    defaultModelRef: string | null | undefined;
    modelOptions: ConfiguredModelOption[];
  }): HarnessRoute {
    // Routing is engine-independent and already works: the route is
    // resolved so the UI can show what Direct WOULD use once its
    // transport exists. Availability, not routing, is what blocks it.
    return resolveHarnessModelRoute({
      engineId: 'direct',
      preferredModelRef: input.preferredModelRef,
      defaultModelRef: input.defaultModelRef,
      modelOptions: input.modelOptions,
    });
  },

  buildTurnPlan(input: {
    sessionKey: string;
    route: HarnessRoute;
    mode: ChatMode;
  }): HarnessTurnPlan {
    // The plan is transport-independent: directives are computed the
    // same way so the UI can preview what Direct would send. Only the
    // send itself is unavailable.
    return {
      sessionKey: input.sessionKey,
      route: input.route,
      modeDirectives: buildModeDirectives(input.mode),
      toolRouting: toolRoutingForMode(input.mode),
      mode: input.mode,
    };
  },
};

/**
 * Pure OpenAI-compatible request builder (no transport). The future
 * host proxy route will accept exactly this shape; nothing about the
 * UI, switches, or catalog needs to change when transport lands.
 */
export function buildDirectChatRequest(
  model: string,
  messages: DirectChatMessage[],
  stream = false,
): DirectChatRequest {
  return { model, messages, stream };
}

/** Stub transport: always reports unavailability, never fakes a reply. */
export async function sendDirectSimpleChat(
  _request: DirectChatRequest,
): Promise<DirectChatResult> {
  return { ok: false, error: DIRECT_ADAPTER_UNAVAILABLE_REASON };
}
