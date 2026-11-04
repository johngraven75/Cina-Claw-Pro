/**
 * Cina harness layer — core types (draft).
 *
 * The harness layer is Cina-Claw's own session/switch/tool/approval
 * orchestration. It sits ABOVE the engine: the Chat UI, the mode
 * switches, and TaskView talk to the harness, and the harness talks to
 * exactly one engine through the EngineAdapter interface below.
 *
 * What the harness owns (this draft):
 * - session orchestration: which harness session maps to which chat
 *   session key, and which engine serves it;
 * - provider/model routing: the catalog-v2 pre-attached default and
 *   fallbacks, with dead models refused (see model-routing.ts);
 * - switch state: the per-session ChatMode is the harness's switch
 *   state — the harness reads it, it does not duplicate it;
 * - tool routing: which tool categories a session's switches allow,
 *   and which limits still apply (see tool-routing.ts);
 * - approval queue: a mirror of ACP permission requests and their
 *   outcomes, so approvals are auditable in one place;
 * - activity log: timestamped, metadata-only entries (never prompt
 *   text, never tool input/output — those may contain pasted secrets).
 *
 * What the harness does NOT own (still OpenClaw's):
 * - the gateway process, ACP sessions, channels, cron, skills
 *   execution, and the plugin runtime. The OpenClaw adapter delegates
 *   transport to the existing ACP path; it does not reimplement it.
 * - global runtime configuration (openclaw.json tools.deny, the exec
 *   allowlist, ask-on-miss policy). Switches are session instructions
 *   plus renderer gating, never a rewrite of global config.
 *
 * Engine swappability: a future engine only has to implement
 * EngineAdapter. The UI, the switches, the catalog pre-attachment, and
 * the activity/approval stores never import an engine directly — they
 * go through getEngineAdapter() in index.ts.
 */
import type { ChatMode } from '@/stores/chat-mode';
import type { ConfiguredModelOption } from '@/lib/model-options';

export type HarnessEngineId = 'openclaw' | 'direct';

/**
 * Tool categories the harness routes. These are harness-level names,
 * not runtime tool names: the runtime's tool inventory is larger and
 * engine-specific, and the ACP permission envelope in this app carries
 * no tool name (title-based matching only).
 */
export type HarnessToolCategory =
  | 'skills'
  | 'browser'
  | 'webSearch'
  | 'deepResearch'
  | 'files'
  | 'exec'
  | 'memory'
  | 'imageGeneration'
  | 'voiceMultimodal';

export type HarnessToolStatus =
  /** Switch on and no global limit blocks it. */
  | 'allowed'
  /** Switch off for this session. */
  | 'denied-by-switch'
  /** Switch on, but a global runtime limit still blocks it. */
  | 'denied-globally'
  /** Only a session instruction exists; no runtime enforcement. */
  | 'directive-only';

export interface HarnessToolRoutingEntry {
  category: HarnessToolCategory;
  status: HarnessToolStatus;
  /** Honest one-line note for UI/logs; never claims enforcement that does not exist. */
  note: string;
}

export type HarnessToolRouting = Record<HarnessToolCategory, HarnessToolRoutingEntry>;

/** What an engine can and cannot do, declared up front — never inferred. */
export interface HarnessEngineCapabilities {
  /** Multi-turn agent sessions with tool calls. */
  agentSessions: boolean;
  /** Streaming assistant output. */
  streaming: boolean;
  /** Tool calls routed through the engine. */
  toolCalls: boolean;
  /** Channels (chat apps, messaging integrations). */
  channels: boolean;
  /** Scheduled automations / cron. */
  cron: boolean;
  /** ACP session history, timeline, and permission cards. */
  acpSessions: boolean;
  /** Simple single-turn chat only (the DirectAdapter's eventual scope). */
  simpleChat: boolean;
}

/** A resolved route for one turn: engine + model + switches + routing. */
export interface HarnessRoute {
  engineId: HarnessEngineId;
  /** Model ref (providerKey/modelId) or null when nothing usable resolved. */
  modelRef: string | null;
  /** True when the resolved model came from the pre-attached default/fallback lists. */
  fromPreattachedDefault: boolean;
  /** Why routing failed, when modelRef is null. */
  failureReason: string | null;
}

/** A turn plan: everything the harness decides before transport runs. */
export interface HarnessTurnPlan {
  sessionKey: string;
  route: HarnessRoute;
  /** Session directive block, or null for the exact default mode. */
  modeDirectives: string | null;
  toolRouting: HarnessToolRouting;
  mode: ChatMode;
}

/** Timestamped, metadata-only activity entry. Never prompt/tool text. */
export interface HarnessActivityEntry {
  id: string;
  at: string;
  sessionKey: string;
  engineId: HarnessEngineId;
  kind:
    | 'turn-started'
    | 'turn-finished'
    | 'turn-failed'
    | 'approval-requested'
    | 'approval-resolved'
    | 'approval-auto-declined'
    | 'engine-selected'
    | 'route-resolved';
  /** Short metadata summary, e.g. model ref or approval title. No secrets. */
  summary: string;
  detail?: string;
}

/** One approval-queue entry, mirrored from the ACP permission flow. */
export interface HarnessApprovalEntry {
  requestId: string;
  sessionKey: string;
  /** Permission card title as shown to the user (title-based: the ACP request carries no tool name). */
  title: string;
  status: 'pending' | 'approved' | 'declined' | 'auto-declined';
  requestedAt: string;
  resolvedAt: string | null;
  /** Why an auto-decline happened (e.g. Code Execution off), when applicable. */
  autoDeclineReason: string | null;
}

/** Transport injected by the caller — the adapter never calls host-api itself. */
export interface HarnessAcpTransport {
  sendPrompt: (payload: {
    sessionKey: string;
    cwd: string;
    message?: string;
    messageId?: string;
    modeDirectives?: string;
  }) => Promise<boolean>;
}

/**
 * The engine-adapter interface. A future engine implements this and
 * registers in HARNESS_ENGINES; the UI, switches, and catalog code do
 * not change. `available` is false for engines that cannot run yet
 * (the DirectAdapter stub): callers must check it and must never fall
 * through to a different engine silently — an unavailable engine is a
 * visible "not available" state, not a quiet substitution.
 */
export interface EngineAdapter {
  id: HarnessEngineId;
  /** User-facing engine name (i18n label key lives in chat.json harness.*). */
  labelKey: string;
  available: boolean;
  /** Why this engine is unavailable, when available is false. */
  unavailableReason: string | null;
  capabilities: HarnessEngineCapabilities;
  /** Resolve engine + model for a session before a turn is sent. */
  resolveRoute: (input: {
    sessionKey: string;
    preferredModelRef: string | null | undefined;
    defaultModelRef: string | null | undefined;
    modelOptions: ConfiguredModelOption[];
  }) => HarnessRoute;
  /** Build the turn plan (directives + tool routing) for a session mode. */
  buildTurnPlan: (input: {
    sessionKey: string;
    route: HarnessRoute;
    mode: ChatMode;
  }) => HarnessTurnPlan;
}

/** OpenAI-compatible chat message (DirectAdapter's eventual transport). */
export interface DirectChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
}

export interface DirectChatRequest {
  model: string;
  messages: DirectChatMessage[];
  stream: boolean;
}

export type DirectChatResult =
  | { ok: true; model: string; message: DirectChatMessage }
  | { ok: false; error: string };
