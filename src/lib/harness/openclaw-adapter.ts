/**
 * Cina harness layer — OpenClaw engine adapter (the active engine).
 *
 * This adapter is fully implemented, and it deliberately contains no
 * transport of its own: it delegates every send to the ACP transport
 * injected by the caller (in the app, hostApi.chat.sendAcpPrompt via
 * the ACP chat session store). That preserves the host-api boundary
 * and leaves sessions, channels, cron, skills execution, and the
 * plugin runtime exactly where they already are — inside OpenClaw.
 *
 * What this adapter adds over a raw ACP send:
 * - route resolution through the harness (pre-attached defaults, dead
 *   models refused) instead of ad-hoc picker logic;
 * - the turn plan: session mode directives + tool routing, computed
 *   once per turn from the session's ChatMode;
 * - a capability declaration that is honest about what OpenClaw
 *   provides here (agent sessions, streaming, tools, channels, cron,
 *   ACP sessions) versus what the harness adds on top.
 */
import { buildModeDirectives } from '@/lib/chat-mode-directives';
import type { ChatMode } from '@/stores/chat-mode';
import type { ConfiguredModelOption } from '@/lib/model-options';
import { resolveHarnessModelRoute } from './model-routing';
import { toolRoutingForMode } from './tool-routing';
import type {
  EngineAdapter,
  HarnessAcpTransport,
  HarnessRoute,
  HarnessTurnPlan,
} from './types';

export const OPENCLAW_ENGINE_CAPABILITIES: EngineAdapter['capabilities'] = {
  agentSessions: true,
  streaming: true,
  toolCalls: true,
  channels: true,
  cron: true,
  acpSessions: true,
  simpleChat: true,
};

export const openclawAdapter: EngineAdapter = {
  id: 'openclaw',
  labelKey: 'harness.engineOpenclaw',
  available: true,
  unavailableReason: null,
  capabilities: OPENCLAW_ENGINE_CAPABILITIES,

  resolveRoute(input: {
    sessionKey: string;
    preferredModelRef: string | null | undefined;
    defaultModelRef: string | null | undefined;
    modelOptions: ConfiguredModelOption[];
  }): HarnessRoute {
    return resolveHarnessModelRoute({
      engineId: 'openclaw',
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
 * Send one harness turn through the OpenClaw engine. The caller owns
 * the transport (and therefore the host-api boundary); this function
 * only attaches the plan's mode directives to the payload the caller
 * already sends. It returns the transport's success flag unchanged —
 * the harness never rewrites a transport result into a success.
 */
export async function sendOpenclawTurn(
  transport: HarnessAcpTransport,
  plan: HarnessTurnPlan,
  payload: { cwd: string; message?: string; messageId?: string },
): Promise<boolean> {
  return transport.sendPrompt({
    sessionKey: plan.sessionKey,
    cwd: payload.cwd,
    message: payload.message,
    messageId: payload.messageId,
    ...(plan.modeDirectives ? { modeDirectives: plan.modeDirectives } : {}),
  });
}
