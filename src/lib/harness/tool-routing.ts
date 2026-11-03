/**
 * Cina harness layer — tool routing (pure logic, no store, no host-api).
 *
 * Maps a session's ChatMode switches to a per-category routing status.
 * The statuses are deliberately honest about enforcement:
 *
 * - 'allowed' means the switch is on AND nothing else is known to block
 *   the category in this draft. For exec, 'allowed' still means the
 *   existing allowlist + ask-on-miss approvals apply — it never means
 *   "approved without asking".
 * - 'denied-globally' is the web_search case: the switch can be on,
 *   but openclaw.json tools.deny still denies web_search globally, so
 *   the harness routes search steps to web_fetch of explicit URLs and
 *   says so. Deep research inherits the same limit.
 * - 'directive-only' covers memory and image generation: the switch
 *   produces a session instruction, and there is no additional
 *   renderer-side enforcement beyond what the agent path already does.
 *   The note says so; nothing here claims a gate that does not exist.
 */
import type { ChatMode } from '@/stores/chat-mode';
import type {
  HarnessToolCategory,
  HarnessToolRouting,
  HarnessToolRoutingEntry,
} from './types';

export const HARNESS_TOOL_CATEGORIES: HarnessToolCategory[] = [
  'skills',
  'browser',
  'webSearch',
  'deepResearch',
  'files',
  'exec',
  'memory',
  'imageGeneration',
  'voiceMultimodal',
];

export function toolRoutingForMode(mode: ChatMode): HarnessToolRouting {
  const entry = (
    category: HarnessToolCategory,
    status: HarnessToolRoutingEntry['status'],
    note: string,
  ): HarnessToolRoutingEntry => ({ category, status, note });
  return {
    skills: mode.skills
      ? entry('skills', 'allowed', 'Skill picker and /skill tokens allowed for this session.')
      : entry('skills', 'denied-by-switch', 'Skills off: skill tokens are stripped before sending.'),
    browser: mode.useBrowser
      ? entry('browser', 'allowed', 'Managed browser and web_fetch allowed; visited pages are logged. No live viewport exists.')
      : entry('browser', 'denied-by-switch', 'Browser off for this session.'),
    webSearch: !mode.webSearch
      ? entry('webSearch', 'denied-by-switch', 'Web search off for this session.')
      : entry(
        'webSearch',
        'denied-globally',
        'Switch on, but web_search is denied in the global runtime config: search steps fall back to web_fetch of explicit URLs.',
      ),
    deepResearch: !mode.deepResearch
      ? entry('deepResearch', 'denied-by-switch', 'Deep research off for this session.')
      : entry(
        'deepResearch',
        'denied-globally',
        'Switch on, but its search steps inherit the global web_search deny: fetch explicit URLs and list only sources actually fetched.',
      ),
    files: mode.filesWorkspace
      ? entry('files', 'allowed', 'Workspace file access and attachments allowed for this session.')
      : entry('files', 'denied-by-switch', 'Files off: attachments are dropped before sending.'),
    exec: mode.codeExecution
      ? entry('exec', 'allowed', 'Execution allowed under the existing allowlist and ask-on-miss approvals; approvals are never auto-granted.')
      : entry('exec', 'denied-by-switch', 'Code execution off: exec-like permission requests are auto-declined.'),
    memory: mode.memory
      ? entry('memory', 'directive-only', 'Memory on: session instruction allows long-term memory search (FTS by default). No extra renderer gate.')
      : entry('memory', 'denied-by-switch', 'Memory off: session instruction says not to search long-term memory.'),
    imageGeneration: mode.imageGeneration
      ? entry('imageGeneration', 'directive-only', 'Image generation on: uses the agent\'s existing image path. No new image service is added here.')
      : entry('imageGeneration', 'denied-by-switch', 'Image generation off: session instruction says not to generate images.'),
    voiceMultimodal: mode.voiceMultimodal
      ? entry('voiceMultimodal', 'allowed', 'Voice dictation and file/image upload controls shown.')
      : entry('voiceMultimodal', 'denied-by-switch', 'Voice/multimodal off: controls hidden, attachments dropped before sending.'),
  };
}

export function isToolCategoryAllowed(
  mode: ChatMode,
  category: HarnessToolCategory,
): boolean {
  return toolRoutingForMode(mode)[category].status === 'allowed';
}
