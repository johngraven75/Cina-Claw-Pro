/**
 * Downloads page — the renderer surface for the media-download host service.
 * All backend work goes through hostApi.mediaDownloads (never direct IPC);
 * all display text goes through the `downloads` i18n namespace.
 */
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FolderOpen, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { hostApi } from '@/lib/host-api';
import type { MediaDownloadJob } from '@shared/media-download';
import type { MediaDownloadToolsResult } from '@shared/host-api/contract';

export function DownloadsPage() {
  const { t } = useTranslation('downloads');
  const [url, setUrl] = useState('');
  const [outputDir, setOutputDir] = useState('');
  const [jobs, setJobs] = useState<MediaDownloadJob[]>([]);
  const [tools, setTools] = useState<MediaDownloadToolsResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [jobList, toolStatus] = await Promise.all([
        hostApi.mediaDownloads.list(),
        hostApi.mediaDownloads.tools(),
      ]);
      setJobs(jobList);
      setTools(toolStatus);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const handleStart = async () => {
    setFormError(null);
    setStarting(true);
    try {
      const job = await hostApi.mediaDownloads.start({
        url,
        outputDir: outputDir.trim() ? outputDir.trim() : undefined,
      });
      setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
      if (job.status === 'refused') setFormError(job.error);
      else setUrl('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error));
    } finally {
      setStarting(false);
    }
  };

  const toolsReady = Boolean(tools?.ffmpeg && tools?.ytDlp);

  return (
    <div data-testid="downloads-page" className="flex flex-col gap-6 p-6">
      <div>
        <h1 data-testid="downloads-page-title" className="text-2xl font-serif font-normal tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="downloads-url">{t('urlLabel')}</Label>
          <Input
            id="downloads-url"
            data-testid="downloads-url-input"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={t('urlPlaceholder')}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="downloads-output-dir">{t('outputDirLabel')}</Label>
          <Input
            id="downloads-output-dir"
            data-testid="downloads-output-dir-input"
            value={outputDir}
            onChange={(event) => setOutputDir(event.target.value)}
            placeholder={t('outputDirPlaceholder')}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="downloads-start-button"
            onClick={() => void handleStart()}
            disabled={starting || !url.trim()}
          >
            <Download className="h-4 w-4" />
            {t('start')}
          </Button>
          <Button variant="ghost" data-testid="downloads-refresh-button" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4" />
            {t('refresh')}
          </Button>
          <span data-testid="downloads-tools-status" className="text-xs text-muted-foreground">
            {t('tools')}: {tools ? (toolsReady ? t('toolsAvailable') : t('toolsMissing')) : '…'}
          </span>
        </div>
        {formError && (
          <p data-testid="downloads-form-error" className="text-sm text-red-700 dark:text-red-400">
            {formError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('supportedNote')}</p>
        <p className="text-xs text-muted-foreground">{t('unsupportedNote')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {jobs.length === 0 && (
          <p data-testid="downloads-empty" className="text-sm text-muted-foreground">{t('empty')}</p>
        )}
        {jobs.map((job) => (
          <div key={job.id} data-testid="downloads-job" className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Badge>{t(`status.${job.status}`)}</Badge>
              <Badge variant="outline">{t(`engine.${job.engine}`)}</Badge>
              <span className="truncate text-sm">{job.url}</span>
            </div>
            {job.progress !== null && job.status === 'running' && (
              <Progress value={job.progress} />
            )}
            {job.outputPath && (
              <p className="truncate text-xs text-muted-foreground">{job.outputPath}</p>
            )}
            {job.error && (
              <p data-testid="downloads-job-error" className="text-sm text-red-700 dark:text-red-400">
                {job.error}
              </p>
            )}
            <div className="flex items-center gap-2">
              {(job.status === 'running' || job.status === 'queued') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void hostApi.mediaDownloads.cancel(job.id).then(() => void refresh())}
                >
                  <X className="h-4 w-4" />
                  {t('cancel')}
                </Button>
              )}
              {job.outputPath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void hostApi.shell.showItemInFolder(job.outputPath!)}
                >
                  <FolderOpen className="h-4 w-4" />
                  {t('showInFolder')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DownloadsPage;
