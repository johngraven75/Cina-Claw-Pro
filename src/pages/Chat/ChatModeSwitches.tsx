/**
 * Chat mode switches panel (draft).
 *
 * Rendered next to the model picker in ChatInput. Every row is a real
 * control: it writes to the per-session chat-mode store, and the send
 * path in Chat/index.tsx turns that mode into a directive block (plus
 * renderer-side gating for files/skills/exec). Rows whose enforcement is
 * instruction-only say so in their hint text; nothing here claims a
 * runtime tool allow/deny, a native effort parameter, a live viewport,
 * or a sandbox that does not exist.
 */
import { useEffect, useState } from 'react';
import { Globe, SlidersHorizontal, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAcpChatSessionStore } from '@/stores/acp-chat-session';
import {
  DEFAULT_CHAT_MODE,
  useChatModeStore,
  type AutonomyLevel,
  type ChatMode,
  type ReasoningEffort,
} from '@/stores/chat-mode';
import { extractBrowserActivity } from '@/lib/chat-mode-directives';
import { useHarnessStore } from '@/stores/harness';
import type { HarnessEngineId } from '@/lib/harness';
import { hostApi } from '@/lib/host-api';

export type ModelReadiness =
  | 'not-applicable'
  | 'ready'
  | 'needs-ollama'
  | 'needs-pull'
  | 'checking'
  | 'unknown';

export type ChatModeSwitchesProps = {
  sessionKey: string | null;
  /** Effective model id (e.g. qwen3-vl:8b-instruct), for the readiness note. */
  modelId?: string | null;
  modelReadiness: ModelReadiness;
  onRecheckModel?: () => void;
  sending?: boolean;
  onStop?: () => void;
};

function Row({
  label,
  hint,
  testId,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  hint: string;
  testId: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-3 px-1 py-1.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs leading-relaxed text-muted-foreground">{hint}</span>
      </span>
      <Switch
        data-testid={testId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5 shrink-0"
      />
    </label>
  );
}

export function ChatModeSwitches({
  sessionKey,
  modelId,
  modelReadiness,
  onRecheckModel,
  sending,
  onStop,
}: ChatModeSwitchesProps) {
  const { t } = useTranslation('chat');
  const [open, setOpen] = useState(false);
  const mode = useChatModeStore((s) => (sessionKey ? s.modes[sessionKey] ?? DEFAULT_CHAT_MODE : DEFAULT_CHAT_MODE));
  const setMode = useChatModeStore((s) => s.setMode);
  const timeline = useAcpChatSessionStore((s) => s.timeline);
  const activity = extractBrowserActivity(timeline);
  // Cina harness: bind this panel's session to the harness session and
  // expose engine selection. OpenClaw is the only available engine in
  // this draft; Direct is shown disabled with its stub note, never as
  // a working choice.
  const requestedEngineId = useHarnessStore((s) => s.requestedEngineId);
  const setEngineId = useHarnessStore((s) => s.setEngineId);
  const bindSession = useHarnessStore((s) => s.bindSession);
  useEffect(() => {
    bindSession(sessionKey);
  }, [sessionKey, bindSession]);

  const patch = (update: Partial<ChatMode>) => {
    if (sessionKey) setMode(sessionKey, update);
  };

  const readinessNote = (() => {
    switch (modelReadiness) {
      case 'ready':
        return null;
      case 'needs-ollama':
        return t('modelStatus.needsOllama');
      case 'needs-pull':
        return t('modelStatus.needsPull', { model: modelId ?? '' });
      case 'checking':
        return t('modelStatus.checking');
      case 'unknown':
        return t('modelStatus.unknown');
      default:
        return null;
    }
  })();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        data-testid="chat-mode-switches-button"
        aria-expanded={open}
        aria-label={t('modes.title')}
        title={t('modes.title')}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-meta font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50',
          open && 'text-foreground',
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>{t('modes.title')}</span>
        <span
          data-testid="chat-autonomy-badge"
          className="rounded-full border border-black/10 bg-black/[0.03] px-1.5 py-0.5 text-2xs font-medium text-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
        >
          {t(`modes.autonomy${mode.autonomy === 'off' ? 'Off' : mode.autonomy === 'full' ? 'Full' : 'Supervised'}`)}
        </span>
      </button>

      {open && (
        <div
          data-testid="chat-mode-switches-panel"
          className="absolute left-0 bottom-full z-20 mb-2 max-h-[70vh] w-[22rem] overflow-y-auto rounded-2xl border border-black/10 bg-surface-modal p-2 shadow-xl dark:border-white/10"
        >
          {readinessNote && (
            <div
              data-testid="chat-model-readiness-note"
              className="mb-2 rounded-xl border border-amber-500/20 bg-surface-modal px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400"
            >
              <p>{readinessNote}</p>
              {modelReadiness === 'needs-ollama' && <p className="mt-1 opacity-80">{t('modelStatus.ollamaStartHint')}</p>}
              {modelReadiness === 'needs-pull' && <p className="mt-1 opacity-80">{t('modelStatus.pullHint', { model: modelId ?? '' })}</p>}
              {onRecheckModel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onRecheckModel}
                  data-testid="chat-model-recheck"
                >
                  {t('modelStatus.recheck')}
                </Button>
              )}
            </div>
          )}

          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">{t('modes.autonomy')}</p>
            <Select
              data-testid="chat-autonomy-select"
              aria-label={t('modes.autonomy')}
              value={mode.autonomy}
              onChange={(event) => patch({ autonomy: event.target.value as AutonomyLevel })}
              className="mt-1.5 h-9 text-sm"
            >
              <option value="off">{t('modes.autonomyOff')}</option>
              <option value="supervised">{t('modes.autonomySupervised')}</option>
              <option value="full">{t('modes.autonomyFull')}</option>
            </Select>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t('modes.autonomyHint')}</p>
            {mode.autonomy === 'full' && (
              <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400">{t('modes.autonomyFullWarning')}</p>
            )}
          </div>

          <div className="my-1 border-t border-black/5 dark:border-white/10" />

          <div className="px-3 py-2" data-testid="harness-engine-section">
            <p className="text-xs font-medium text-muted-foreground">{t('harness.engineTitle')}</p>
            <Select
              data-testid="harness-engine-select"
              aria-label={t('harness.engineTitle')}
              value={requestedEngineId}
              onChange={(event) => setEngineId(event.target.value as HarnessEngineId)}
              className="mt-1.5 h-9 text-sm"
            >
              <option value="openclaw">{t('harness.engineOpenclaw')}</option>
              <option value="direct" disabled>{t('harness.engineDirect')}</option>
            </Select>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t('harness.engineHint')}</p>
            <p data-testid="harness-engine-stub-note" className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400">{t('harness.engineDirectStub')}</p>
          </div>

          <div className="my-1 border-t border-black/5 dark:border-white/10" />

          <Row
            label={t('modes.reasoning')}
            hint={t('modes.reasoningHint')}
            testId="chat-mode-reasoning"
            checked={mode.reasoning}
            onCheckedChange={(checked) => patch({ reasoning: checked })}
          />
          <div className="px-1 pb-1.5">
            <label className="block px-1 text-xs font-medium text-muted-foreground" htmlFor="chat-mode-effort">
              {t('modes.reasoningEffort')}
            </label>
            <Select
              id="chat-mode-effort"
              data-testid="chat-mode-reasoning-effort"
              value={mode.reasoningEffort}
              disabled={!mode.reasoning}
              onChange={(event) => patch({ reasoningEffort: event.target.value as ReasoningEffort })}
              className="mt-1 h-9 text-sm"
            >
              <option value="default">{t('modes.reasoningEffortDefault')}</option>
              <option value="low">{t('modes.reasoningEffortLow')}</option>
              <option value="high">{t('modes.reasoningEffortHigh')}</option>
              <option value="max">{t('modes.reasoningEffortMax')}</option>
            </Select>
            <p className="px-1 pt-1 text-xs leading-relaxed text-muted-foreground">{t('modes.effortNote')}</p>
          </div>

          <div className="my-1 border-t border-black/5 dark:border-white/10" />

          <Row
            label={t('modes.skills')}
            hint={t('modes.skillsHint')}
            testId="chat-mode-skills"
            checked={mode.skills}
            onCheckedChange={(checked) => patch({ skills: checked })}
          />
          <Row
            label={t('modes.filesWorkspace')}
            hint={t('modes.filesWorkspaceHint')}
            testId="chat-mode-files"
            checked={mode.filesWorkspace}
            onCheckedChange={(checked) => patch({ filesWorkspace: checked })}
          />
          <Row
            label={t('modes.codeExecution')}
            hint={t('modes.codeExecutionHint')}
            testId="chat-mode-code-execution"
            checked={mode.codeExecution}
            onCheckedChange={(checked) => patch({ codeExecution: checked })}
          />
          <Row
            label={t('modes.memory')}
            hint={t('modes.memoryHint')}
            testId="chat-mode-memory"
            checked={mode.memory}
            onCheckedChange={(checked) => patch({ memory: checked })}
          />
          <Row
            label={t('modes.useBrowser')}
            hint={t('modes.useBrowserHint')}
            testId="chat-mode-browser"
            checked={mode.useBrowser}
            onCheckedChange={(checked) => patch({ useBrowser: checked })}
          />
          <Row
            label={t('modes.webSearch')}
            hint={t('modes.webSearchHint')}
            testId="chat-mode-web-search"
            checked={mode.webSearch}
            onCheckedChange={(checked) => patch({ webSearch: checked })}
          />
          <Row
            label={t('modes.deepResearch')}
            hint={t('modes.deepResearchHint')}
            testId="chat-mode-deep-research"
            checked={mode.deepResearch}
            onCheckedChange={(checked) => patch({ deepResearch: checked })}
          />
          <Row
            label={t('modes.imageGeneration')}
            hint={t('modes.imageGenerationHint')}
            testId="chat-mode-image-generation"
            checked={mode.imageGeneration}
            onCheckedChange={(checked) => patch({ imageGeneration: checked })}
          />
          <Row
            label={t('modes.voiceMultimodal')}
            hint={t('modes.voiceMultimodalHint')}
            testId="chat-mode-voice"
            checked={mode.voiceMultimodal}
            onCheckedChange={(checked) => patch({ voiceMultimodal: checked })}
          />
          <Row
            label={t('modes.showUncensored')}
            hint={t('modes.showUncensoredHint')}
            testId="chat-mode-show-uncensored"
            checked={mode.showUncensored}
            onCheckedChange={(checked) => patch({ showUncensored: checked })}
          />

          <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">{t('modes.scopeNote')}</p>
          <p className="px-3 pb-1 text-xs leading-relaxed text-muted-foreground">{t('modes.browserLimit')}</p>
          <p className="px-3 pb-2 text-xs leading-relaxed text-muted-foreground">{t('modes.webSearchLimit')}</p>

          <div className="my-1 border-t border-black/5 dark:border-white/10" />

          <div className="px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              {t('modes.browserActivity')}
            </p>
            {activity.length === 0 ? (
              <p className="pt-1.5 text-xs text-muted-foreground">{t('modes.browserActivityEmpty')}</p>
            ) : (
              <ul className="space-y-1.5 pt-2">
                {activity.map((entry) => (
                  <li key={entry.url} className="min-w-0">
                    <button
                      type="button"
                      data-testid="chat-browser-activity-link"
                      title={entry.url}
                      onClick={() => void hostApi.shell.openExternal(entry.url)}
                      className="block w-full truncate text-left text-xs text-primary hover:underline"
                    >
                      {entry.title}
                    </button>
                    <span className="block truncate text-2xs text-muted-foreground">{entry.url}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {sending && onStop && (
            <div className="border-t border-black/5 p-2 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onStop}
                data-testid="chat-mode-stop"
              >
                <Square className="mr-2 h-3.5 w-3.5" fill="currentColor" />
                {t('modes.stop')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
