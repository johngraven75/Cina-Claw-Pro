/**
 * Chat mode directives + activity extraction (draft: chat selector switches).
 *
 * buildModeDirectives turns a per-session ChatMode into the directive
 * block sent with a prompt (AcpChatPromptPayload.modeDirectives). The
 * block is prepended by the main process as its own ACP text block; it is
 * never edited into the user's message and never rendered as user text.
 *
 * Honesty contract for every line below: a directive is an instruction
 * to the agent, not a runtime enforcement. Where enforcement exists
 * (attachment dropping, skill-token stripping, exec auto-decline) it lives
 * in the renderer, not in this text. Where it does not exist, the text
 * says so — most importantly for web_search, which stays denied in the
 * global runtime config (openclaw.json tools.deny) no matter what these
 * switches say. Nothing here invents a source, a tool result, or a
 * capability the runtime does not have.
 */
import type { ChatMode, ReasoningEffort } from '@/stores/chat-mode';
import type { AcpTimelineSnapshot, ToolCallItem } from '@/lib/acp/timeline-types';

const EFFORT_LINES: Record<Exclude<ReasoningEffort, 'default'>, string> = {
  low: 'Keep reasoning brief and focused; answer directly once you have enough to be correct.',
  high: 'Reason thoroughly before answering; check your working before you conclude.',
  max: 'Reason as thoroughly as you can within the context limit before answering; do not shortcut hard steps.',
};

const AUTONOMY_LINES: Record<ChatMode['autonomy'], string> = {
  off: 'Autonomy: Off — complete only the single requested step, then stop and report. Do not start follow-up steps on your own.',
  supervised:
    'Autonomy: Supervised — proceed step by step and pause for approval on any dangerous action.',
  full:
    'Autonomy: Full (bounded) — continue this multi-step task unattended within these hard boundaries, which you must never cross: '
    + 'never delete files outside the workspace, never rewrite history, never commit, store, or expose secrets, keys, or signing material, '
    + 'never bypass or defeat an approval, sign-in, or deletion protection, never send a message, email, or payment, and never publish or release anything '
    + 'without explicit user approval, and never expand the scope beyond the task the user gave. '
    + 'Log every tool call, file change, and browser action as you go. '
    + 'On a genuine blocker — a failed workflow, a merge conflict, a missing secret, an expired code, a provider outage, or a tool/model failure you cannot '
    + 'recover from safely — stop and report it. Do not work around it, do not hide it, and do not present partial work as complete.',
};

export function isDefaultChatMode(mode: ChatMode): boolean {
  return (
    mode.reasoning === true
    && mode.reasoningEffort === 'default'
    && mode.skills === true
    && mode.deepResearch === false
    && mode.webSearch === false
    && mode.useBrowser === false
    && mode.codeExecution === true
    && mode.filesWorkspace === true
    && mode.memory === true
    && mode.imageGeneration === true
    && mode.voiceMultimodal === true
    && mode.showUncensored === false
    && mode.autonomy === 'supervised'
  );
}

/**
 * Build the session-mode directive block, or null when the mode is
 * exactly the default (so default sessions send no extra block at all).
 */
export function buildModeDirectives(mode: ChatMode): string | null {
  if (isDefaultChatMode(mode)) return null;
  const lines: string[] = [
    '[Session mode — follow these session settings for this turn only. They do not change global configuration.]',
  ];
  if (!mode.reasoning) {
    lines.push(
      'Reasoning is off for this session: answer directly without extended internal reasoning. '
      + '(Thought blocks, if any, appear only when the runtime streams them; this switch cannot force or suppress a streamed thought block.)',
    );
  } else if (mode.reasoningEffort !== 'default') {
    lines.push(
      `Reasoning effort (${mode.reasoningEffort}) — prompt-scoped instruction, not a provider parameter: `
      + 'this runtime exposes no native effort setting through ACP, so treat this as how thoroughly to reason in your visible working. '
      + EFFORT_LINES[mode.reasoningEffort],
    );
  }
  if (!mode.skills) lines.push('Skills are off for this session: do not invoke any skill.');
  if (!mode.filesWorkspace) {
    lines.push('Workspace file access is off for this session: do not read, open, or attach workspace files, and do not ask for files to be attached.');
  }
  if (!mode.codeExecution) {
    lines.push('Code execution is off for this session: do not run terminal or host commands. Execution permission requests for this session are auto-declined by the UI.');
  }
  if (!mode.memory) lines.push('Memory is off for this session: do not search long-term memory.');
  if (!mode.imageGeneration) lines.push('Image generation is off for this session: do not generate images.');
  if (!mode.voiceMultimodal) lines.push('Voice and file input are off for this session: use text only.');
  if (mode.useBrowser) {
    lines.push(
      'Browser use is on for this session: you may use the managed browser and web_fetch to visit pages the user asks about. '
      + 'List every page you visit (title and URL) in your final answer. There is no live computer-use viewport in this app: '
      + 'do not claim to click, type into, or control a page beyond fetching/navigating to it.',
    );
  }
  if (mode.webSearch) {
    lines.push(
      'Web search is on for this session, scoped to this session only — but note the limit honestly: '
      + 'general web_search is denied in the global runtime config, so where a search tool is unavailable, use web_fetch for explicit URLs instead and say that search was unavailable. '
      + 'Cite every fetched source with its title and URL. Never invent a source, a result, or a citation.',
    );
  }
  if (mode.deepResearch) {
    lines.push(
      'Deep research mode is on for this session: work in multiple steps — gather from several fetched pages, compare what they say, then synthesise. '
      + "End your answer with a 'Sources' list containing only pages actually fetched in this session (title and URL). "
      + 'If a needed search step is unavailable because web_search is denied globally, say that explicitly instead of inventing results.',
    );
  }
  lines.push(AUTONOMY_LINES[mode.autonomy]);
  return lines.join('\n');
}

/**
 * Remove composer skill tokens (`/name␣␣`) from text. Used when Skills is
 * off at send time. v1.0.7 (CodeAnt MAJOR): the old pattern matched any
 * slash-run (`/[^\s]+`) and then collapsed every double space in the
 * message, so a path or URL-adjacent double space was mangled (e.g. text
 * containing "/api/v1  docs" lost the path). Tokens are now only
 * slash + a bare skill name (letters, digits, `_`, `-`) followed by the
 * two-space delimiter, and no other spacing in the message is touched.
 */
export function stripSkillTokens(text: string): string {
  return text.replace(/(^|\s)\/[A-Za-z0-9_-]+ {2}/g, '$1');
}

/**
 * Best-effort uncensored marker check for a model ref.
 *
 * This is only the FALLBACK for accounts attached before the catalog
 * pre-attach plan started recording metadata.uncensoredModels: Chat
 * filters on that explicit flag first, and this check catches flagged
 * rows whose account predates the flag. Any uncensored model whose ref
 * carries none of these markers AND whose account has no flag is still
 * not hidden by this check — which is why the flag, not this list, is
 * the primary mechanism.
 * Markers below match the current catalog's uncensored rows
 * (abliterated / uncensored builds, Huihui and Dolphin publishers).
 * Standard catalog rows carry none of them.
 */
const UNCENSORED_MODEL_REF_MARKERS = ['abliterated', 'uncensored', 'huihui', 'dolphin'];

export function isKnownUncensoredModelRef(modelRef: string | null | undefined): boolean {
  const value = (modelRef || '').toLowerCase();
  if (!value) return false;
  return UNCENSORED_MODEL_REF_MARKERS.some((marker) => value.includes(marker));
}

export type BrowserActivityEntry = {
  url: string;
  title: string;
  status: ToolCallItem['status'];
};

const URL_PATTERN = /https?:\/\/[^\s"'<>\])]+/g;

function urlsFromValue(value: unknown, into: string[]): void {
  if (typeof value === 'string') {
    for (const match of value.matchAll(URL_PATTERN)) into.push(match[0].replace(/[.,;]+$/, ''));
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) urlsFromValue(entry, into);
    return;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) urlsFromValue(entry, into);
  }
}

function markdownText(parts: ToolCallItem['outputParts']): string {
  return parts
    .filter((part) => part.kind === 'markdown')
    .map((part) => (part.kind === 'markdown' ? part.text : ''))
    .join('\n');
}

/**
 * Browser / fetch activity for a session, derived only from the live
 * timeline's tool calls — never invented. A URL appears here only if a
 * tool call in this session actually mentioned it (title, input, output,
 * or ACP location). This is the session's visited-pages / sources list;
 * it is not a live viewport and it cannot show pages the agent did not
 * actually touch.
 */
export function extractBrowserActivity(timeline: AcpTimelineSnapshot): BrowserActivityEntry[] {
  const seen = new Set<string>();
  const entries: BrowserActivityEntry[] = [];
  for (const itemId of timeline.itemOrder) {
    const item = timeline.itemsById[itemId];
    if (!item || item.kind !== 'tool-call') continue;
    const candidates: string[] = [];
    urlsFromValue(item.title, candidates);
    urlsFromValue(item.input, candidates);
    urlsFromValue(item.output, candidates);
    urlsFromValue(markdownText(item.outputParts), candidates);
    for (const location of item.locations ?? []) {
      const loc = location as unknown as { uri?: unknown; path?: unknown };
      if (typeof loc.uri === 'string') {
        urlsFromValue(loc.uri, candidates);
      }
      if (typeof loc.path === 'string') {
        urlsFromValue(loc.path, candidates);
      }
    }
    for (const url of candidates) {
      if (seen.has(url)) continue;
      seen.add(url);
      entries.push({ url, title: item.title || url, status: item.status });
    }
  }
  return entries;
}

/** True when a permission request looks like terminal/host execution (title-based; the ACP request carries no tool name in this app). */
export function isExecLikePermissionTitle(title: string | null | undefined): boolean {
  const value = (title || '').toLowerCase();
  return /\b(exec|shell|terminal|command|run command|bash|powershell)\b/.test(value);
}
