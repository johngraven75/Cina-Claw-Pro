/**
 * Per-session Chat mode store (draft: chat selector switches).
 *
 * One mode object per ACP session key. Nothing here is shared across
 * sessions: a switch flipped in session A is invisible to session B, and a
 * session that has never been opened starts from DEFAULT_CHAT_MODE.
 *
 * Deliberately in-memory only (no disk persistence). That is a safety
 * choice, not an oversight: Full Autonomy and the uncensored opt-in must
 * always be explicit opt-ins for the current run. Restarting the app resets
 * autonomy to "supervised" and hides uncensored models again, so neither
 * can be silently carried over from an earlier session.
 *
 * Enforcement model (see src/lib/chat-mode-directives.ts): the ACP path in
 * this app has no per-session model/tool/reasoning parameter — see
 * electron/services/acp-chat-service.ts, whose newSession/prompt calls
 * carry only cwd, mcpServers and _meta. So a switch is enforced by:
 *   (a) a session-scoped directive block sent with the prompt
 *       (AcpChatPromptPayload.modeDirectives, prepended as its own ACP text
 *       block by the main process — never mixed into the user's message
 *       text, and never shown in the optimistic user segment), and
 *   (b) renderer-side gating where gating is real: files/attachments are
 *       dropped before send when Files is off, skill tokens are stripped
 *       when Skills is off, the attach/mic/skill pickers are disabled, and
 *       exec permission requests are auto-declined when Code Execution is
 *       off (see applyPermissionRequest in acp-chat-session.ts).
 * Nothing here mutates the global runtime config (openclaw.json
 * tools.deny, tools.exec allowlist/ask policy). In particular, turning
 * Web Search or Deep Research on does NOT remove the global
 * tools.deny entry for web_search.
 */
import { create } from 'zustand';

export type ReasoningEffort = 'default' | 'low' | 'high' | 'max';

/**
 * Autonomy levels. "supervised" is the default. "full" is bounded
 * autonomy: it never auto-approves anything (see the directive text in
 * chat-mode-directives.ts) and dangerous actions still surface as
 * permission cards that pause for the user.
 */
export type AutonomyLevel = 'off' | 'supervised' | 'full';

export type ChatMode = {
  /** Reasoning on/off. Default on. Thought blocks still only appear when the runtime streams them. */
  reasoning: boolean;
  /** Prompt-scoped reasoning effort. There is no native ACP effort parameter in this app, so this is a reasoning instruction, not a provider setting — the UI says so. */
  reasoningEffort: ReasoningEffort;
  /** Skill use on/off for this session (skill picker + /skill tokens). */
  skills: boolean;
  /** Multi-step fetch + synthesis with a Sources list. Search itself is limited by the global web_search deny — see directives. */
  deepResearch: boolean;
  /** Single search + fetch for this session. Same web_search limit as deep research. */
  webSearch: boolean;
  /** Managed browser + web_fetch use for this session. No live computer-use viewport exists in this draft. */
  useBrowser: boolean;
  /** Terminal/host execution. Off auto-declines exec permission requests. On keeps the existing allowlist + ask-on-miss policy unchanged. */
  codeExecution: boolean;
  /** Workspace file access + attachments for this session. */
  filesWorkspace: boolean;
  /** Long-term memory search (OpenClaw memory_search, FTS by default) for this session. */
  memory: boolean;
  /** Image generation for this session, via the agent's existing image-generation path. */
  imageGeneration: boolean;
  /** Voice dictation + file/image upload controls in the composer. */
  voiceMultimodal: boolean;
  /** Show uncensored models in this session's model picker. Never a default, never persisted. */
  showUncensored: boolean;
  /** Bounded autonomy level for this session/task. */
  autonomy: AutonomyLevel;
};

export const DEFAULT_CHAT_MODE: ChatMode = {
  reasoning: true,
  reasoningEffort: 'default',
  skills: true,
  deepResearch: false,
  webSearch: false,
  useBrowser: false,
  codeExecution: true,
  filesWorkspace: true,
  memory: true,
  imageGeneration: true,
  voiceMultimodal: true,
  showUncensored: false,
  autonomy: 'supervised',
};

type ChatModeState = {
  modes: Record<string, ChatMode>;
  getMode: (sessionKey: string | null | undefined) => ChatMode;
  setMode: (sessionKey: string, patch: Partial<ChatMode>) => void;
  resetMode: (sessionKey: string) => void;
};

export const useChatModeStore = create<ChatModeState>((set, get) => ({
  modes: {},

  getMode(sessionKey) {
    if (!sessionKey) return DEFAULT_CHAT_MODE;
    return get().modes[sessionKey] ?? DEFAULT_CHAT_MODE;
  },

  setMode(sessionKey, patch) {
    if (!sessionKey) return;
    set((state) => ({
      modes: {
        ...state.modes,
        [sessionKey]: { ...(state.modes[sessionKey] ?? DEFAULT_CHAT_MODE), ...patch },
      },
    }));
  },

  resetMode(sessionKey) {
    if (!sessionKey) return;
    set((state) => {
      const { [sessionKey]: _removed, ...rest } = state.modes;
      return { modes: rest };
    });
  },
}));
