import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export type TaskViewStatus = 'working' | 'idle';

export interface TaskViewHeaderProps {
  title: string;
  status: TaskViewStatus;
  fileCount: number;
  onClose: () => void;
}

export function TaskViewHeader({ title, status, fileCount, onClose }: TaskViewHeaderProps) {
  const { t } = useTranslation('chat');
  return (
    <div
      data-testid="task-view-header"
      className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-surface-modal px-4 py-2 dark:border-white/10"
    >
      <span
        className={
          status === 'working'
            ? 'h-2 w-2 shrink-0 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400'
            : 'h-2 w-2 shrink-0 rounded-full bg-green-600 dark:bg-green-400'
        }
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-foreground/60">
          {t(status === 'working' ? 'taskView.working' : 'taskView.idle')} ·{' '}
          {t('taskView.fileChanges', { count: fileCount })}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-testid="task-view-close"
        onClick={onClose}
        aria-label={t('taskView.close')}
      >
        <X className="h-4 w-4" />
        <span>{t('taskView.close')}</span>
      </Button>
    </div>
  );
}
