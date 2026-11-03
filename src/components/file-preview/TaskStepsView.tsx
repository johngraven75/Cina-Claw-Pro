import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, ListChecks, Loader2, Terminal, XCircle } from 'lucide-react';
import { useAcpChatSessionStore } from '@/stores/acp-chat-session';
import { cn } from '@/lib/utils';

function entryText(entry: unknown, fallback: string): string {
  const record = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
  for (const key of ['content', 'title', 'description', 'text', 'message']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
}

function planStatusKey(status: unknown): string | null {
  if (status === 'in_progress') return 'acp.running';
  if (status === 'pending') return 'acp.pending';
  if (status === 'completed') return 'acp.completed';
  if (status === 'failed') return 'acp.failed';
  if (status === 'cancelled') return 'acp.cancelled';
  return null;
}

function toolStatusKey(status: string): string | null {
  if (status === 'running' || status === 'pending') return 'acp.running';
  if (status === 'completed') return 'acp.completed';
  if (status === 'failed') return 'acp.failed';
  return null;
}

export function TaskStepsView() {
  const { t } = useTranslation('chat');
  const timeline = useAcpChatSessionStore((s) => s.timeline);

  const steps = useMemo(() => {
    const items: Array<{ id: string; label: string; statusKey: string | null; kind: string }> = [];
    for (const id of timeline.itemOrder) {
      const item = timeline.itemsById[id];
      if (!item) continue;
      if (item.kind === 'plan') {
        for (const [index, entry] of item.entries.entries()) {
          const record = entry as unknown as Record<string, unknown>;
          items.push({
            id: `${id}:plan:${index}`,
            label: entryText(entry, t('artifactPanel.steps.plan')),
            statusKey: planStatusKey(record.status),
            kind: 'plan',
          });
        }
      } else if (item.kind === 'tool-call') {
        items.push({
          id,
          label: item.title || t('artifactPanel.steps.toolCall'),
          statusKey: toolStatusKey(item.status),
          kind: 'tool',
        });
      } else if (item.kind === 'permission') {
        items.push({
          id,
          label: item.title || t('artifactPanel.steps.permission'),
          statusKey: item.status === 'pending' ? 'acp.pending' : null,
          kind: 'permission',
        });
      }
    }
    return items;
  }, [timeline, t]);

  const completed = steps.filter((step) => step.statusKey === 'acp.completed').length;

  return (
    <div data-testid="task-steps-view" className="flex h-full min-h-0 flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center gap-2 text-foreground/70">
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">
          {t('artifactPanel.steps.heading', { completed, total: steps.length })}
        </span>
      </div>
      {steps.length === 0 ? (
        <p className="text-sm text-foreground/60">{t('artifactPanel.steps.empty')}</p>
      ) : (
        <ol className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.id}
              className="flex min-w-0 items-start gap-2 rounded-xl border border-black/10 bg-surface-modal px-3 py-2 dark:border-white/10"
            >
              {step.statusKey === 'acp.completed' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700 dark:text-green-400" aria-hidden="true" />
              ) : step.statusKey === 'acp.running' ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-700 dark:text-blue-400" aria-hidden="true" />
              ) : step.statusKey === 'acp.failed' ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
              ) : step.kind === 'tool' ? (
                <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-foreground/50" aria-hidden="true" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1 break-words text-sm text-foreground">{step.label}</span>
              {step.statusKey && (
                <span
                  className={cn(
                    'shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide dark:bg-white/10',
                    step.statusKey === 'acp.completed' && 'text-green-700 dark:text-green-400',
                    step.statusKey === 'acp.running' && 'text-blue-700 dark:text-blue-400',
                    step.statusKey === 'acp.failed' && 'text-red-700 dark:text-red-400',
                  )}
                >
                  {t(step.statusKey)}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-xs leading-5 text-foreground/50">{t('artifactPanel.steps.note')}</p>
    </div>
  );
}
