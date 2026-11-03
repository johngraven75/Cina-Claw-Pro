/**
 * Persona Page
 *
 * Editable spaces for the three files that shape the main agent:
 *
 * - Soul (SOUL.md) — persona: name, vibe, how it talks.
 * - Memory (MEMORY.md) — durable long-term memory: facts, preferences,
 *   decisions. OpenClaw also reads memory/*.md alongside it.
 * - System Prompt (AGENTS.md) — the instruction file OpenClaw loads for
 *   the agent in this workspace. It is labelled "System Prompt" here
 *   because that is what it functions as; its on-disk name stays
 *   AGENTS.md so nothing about OpenClaw's loading changes.
 *
 * Files live in the chat workspace (default ~/.openclaw/workspace) and
 * are read by OpenClaw when a new session starts, so edits take effect
 * for new sessions. An already-running session keeps the context it
 * started with.
 *
 * Saving uses the files service: writeText for an existing file,
 * createText (refuses to overwrite) for a file that does not exist yet.
 * Nothing here is stored in the renderer or in localStorage.
 */
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { hostApi } from '@/lib/host-api';
import { useSettingsStore } from '@/stores/settings';

type SpaceId = 'soul' | 'memory' | 'system';

const SPACES: Array<{ id: SpaceId; file: string }> = [
  { id: 'soul', file: 'SOUL.md' },
  { id: 'memory', file: 'MEMORY.md' },
  { id: 'system', file: 'AGENTS.md' },
];

type LoadState = 'loading' | 'ready' | 'error';

export function Persona() {
  const { t } = useTranslation('persona');
  const chatWorkspacePath = useSettingsStore((state) => state.chatWorkspacePath);

  const [activeSpace, setActiveSpace] = useState<SpaceId>('soul');
  const [draft, setDraft] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [exists, setExists] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const space = SPACES.find((candidate) => candidate.id === activeSpace) ?? SPACES[0];
  const filePath = `${chatWorkspacePath.replace(/\/$/, '')}/${space.file}`;
  const dirty = draft !== savedContent;

  const load = useCallback(async () => {
    setLoadState('loading');
    setStatus('idle');
    try {
      const result = await hostApi.files.readText(filePath) as {
        ok?: boolean;
        content?: string;
        error?: string;
      };
      if (result?.ok) {
        setDraft(result.content ?? '');
        setSavedContent(result.content ?? '');
        setExists(true);
      } else if (result?.error === 'notFound') {
        setDraft('');
        setSavedContent('');
        setExists(false);
      } else {
        setLoadState('error');
        return;
      }
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [filePath]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const save = exists
        ? await hostApi.files.writeText(filePath, draft)
        : await hostApi.files.createText(filePath, draft);
      let result = save as { ok?: boolean; error?: string } | undefined;
      // A file created between load and save must not fail the edit.
      if (!result?.ok && result?.error === 'alreadyExists') {
        result = await hostApi.files.writeText(filePath, draft) as { ok?: boolean; error?: string };
      }
      if (!result?.ok) {
        setStatus('error');
        return;
      }
      setSavedContent(draft);
      setExists(true);
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="persona-page" className="mx-auto flex h-full max-w-4xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-3xl font-serif font-normal tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="flex gap-2" role="tablist" aria-label={t('title')}>
        {SPACES.map((candidate) => (
          <Button
            key={candidate.id}
            data-testid={`persona-tab-${candidate.id}`}
            variant={candidate.id === activeSpace ? 'secondary' : 'ghost'}
            onClick={() => setActiveSpace(candidate.id)}
          >
            {t(`spaces.${candidate.id}.tab`)}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="font-medium">{t(`spaces.${space.id}.tab`)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t(`spaces.${space.id}.description`)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t(`spaces.${space.id}.usedFor`)}</p>
        <p data-testid="persona-path" className="mt-2 font-mono text-xs text-muted-foreground">
          {t('path', { path: filePath })}
        </p>

        {loadState === 'loading' ? (
          <div className="flex items-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('loading')}
          </div>
        ) : loadState === 'error' ? (
          <p className="flex items-center gap-2 py-6 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {t('loadFailed')}
          </p>
        ) : (
          <>
            {!exists && (
              <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                {t('notCreated')}
              </p>
            )}
            <Textarea
              data-testid="persona-editor"
              className="mt-3 min-h-[420px] font-mono text-sm"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setStatus('idle');
              }}
              spellCheck={false}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {dirty && <span>{t('dirty')}</span>}
                {status === 'saved' && (
                  <span data-testid="persona-status" className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('saved')}
                  </span>
                )}
                {status === 'error' && (
                  <span data-testid="persona-status" className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {t('saveFailed')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => void load()} disabled={saving}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('reload')}
                </Button>
                <Button
                  data-testid="persona-save"
                  onClick={() => void handleSave()}
                  disabled={saving || (!dirty && exists)}
                  className={cn(!dirty && exists && 'opacity-60')}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Persona;
