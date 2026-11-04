/**
 * Media download host service.
 *
 * Downloads clear, public video only, through the app's bundled tools:
 * - ffmpeg for `.m3u8` HLS playlists (variant selection, key handling and
 *   segment assembly are ffmpeg's own work).
 * - yt-dlp for progressive and site video (single videos only).
 *
 * In a packaged build both tools MUST be bundled (see
 * scripts/download-bundled-media-tools.mjs and the win extraResources in
 * electron-builder.yml); a missing bundled tool is a hard error, not a
 * silent PATH fallback. In dev, a system PATH tool is used when no bundled
 * copy exists, so the feature stays testable without a package step.
 *
 * The service never passes credentials, cookies, or login flags to either
 * tool, never expands playlists, and never attempts CAPTCHA solving.
 * DRM/login/paywall/CAPTCHA-gated content is refused: pre-flight for
 * credential-bearing URLs, and by tool-output classification for everything
 * else (see shared/media-download.ts).
 */
import { app } from 'electron';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { access, mkdir, readdir } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { join } from 'node:path';
import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import {
  buildFfmpegArgs,
  buildYtDlpArgs,
  classifyMediaDownloadUrl,
  findRefusalReason,
  MEDIA_DOWNLOAD_REFUSAL_MESSAGE,
  parseFfmpegProgress,
  parseYtDlpProgress,
  sanitizeDownloadFileName,
  type MediaDownloadJob,
} from '@shared/media-download';

type StoredJob = {
  job: MediaDownloadJob;
  child: ChildProcessWithoutNullStreams | null;
  stderrTail: string;
  outputPath: string | null;
};

let jobCounter = 0;

function binName(tool: 'ffmpeg' | 'yt-dlp'): string {
  if (process.platform !== 'win32') return tool;
  return tool === 'ffmpeg' ? 'ffmpeg.exe' : 'yt-dlp.exe';
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a download tool. Packaged builds use the bundled copy only;
 * dev builds prefer a bundled copy and fall back to the system PATH.
 */
export async function resolveMediaTool(tool: 'ffmpeg' | 'yt-dlp'): Promise<{
  bin: string;
  bundled: boolean;
}> {
  const name = binName(tool);
  if (app.isPackaged) {
    const bundled = join(process.resourcesPath, 'bin', name);
    if (await exists(bundled)) return { bin: bundled, bundled: true };
    throw new Error(
      `Bundled ${tool} is missing from this install. Reinstall Cina-Claw Pro; `
      + 'the Windows installer must include ffmpeg and yt-dlp (see prep:win-binaries).',
    );
  }
  const devBundled = join(
    process.cwd(), 'resources', 'bin', `${process.platform}-${process.arch}`, name,
  );
  if (await exists(devBundled)) return { bin: devBundled, bundled: true };
  return { bin: name, bundled: false };
}

function now(): number {
  return Date.now();
}

function snapshot(stored: StoredJob): MediaDownloadJob {
  return { ...stored.job };
}

export function createMediaDownloadApi(): CompleteHostServiceRegistry['mediaDownloads'] {
  const jobs = new Map<string, StoredJob>();

  async function defaultOutputDir(): Promise<string> {
    const dir = join(app.getPath('downloads'), 'Cina-Claw Downloads');
    await mkdir(dir, { recursive: true });
    return dir;
  }

  function finish(stored: StoredJob, status: MediaDownloadJob['status'], error: string | null): void {
    stored.job.status = status;
    stored.job.error = error;
    stored.job.updatedAt = now();
    stored.child = null;
  }

  return {
    tools: async () => {
      const [ffmpeg, ytDlp] = await Promise.all([
        resolveMediaTool('ffmpeg').then(() => true).catch(() => false),
        resolveMediaTool('yt-dlp').then(() => true).catch(() => false),
      ]);
      return { ffmpeg, ytDlp, bundled: app.isPackaged };
    },

    start: async (payload) => {
      const url = typeof payload?.url === 'string' ? payload.url : '';
      const requestedDir = typeof payload?.outputDir === 'string' && payload.outputDir.trim()
        ? payload.outputDir.trim()
        : undefined;
      const id = `${now().toString(36)}-${(jobCounter += 1).toString(36)}`;
      const outputDir = requestedDir ?? await defaultOutputDir();
      await mkdir(outputDir, { recursive: true });

      let engine: MediaDownloadJob['engine'];
      try {
        engine = classifyMediaDownloadUrl(url);
      } catch (error) {
        // Invalid / credential-bearing URLs are refused, not queued.
        const job: MediaDownloadJob = {
          id, url, engine: 'yt-dlp', status: 'refused', progress: null,
          outputPath: null, error: error instanceof Error ? error.message : String(error),
          refusalReason: error instanceof Error ? error.message : null,
          startedAt: now(), updatedAt: now(),
        };
        jobs.set(id, { job, child: null, stderrTail: '', outputPath: null });
        return snapshot(jobs.get(id)!);
      }

      const job: MediaDownloadJob = {
        id, url, engine, status: 'queued', progress: null, outputPath: null,
        error: null, refusalReason: null, startedAt: now(), updatedAt: now(),
      };
      const stored: StoredJob = { job, child: null, stderrTail: '', outputPath: null };
      jobs.set(id, stored);

      try {
        const tool = await resolveMediaTool(engine);
        let outputPath: string | null = null;
        let args: string[];
        if (engine === 'ffmpeg') {
          outputPath = join(outputDir, sanitizeDownloadFileName(url, id));
          args = buildFfmpegArgs(url.trim(), outputPath);
        } else {
          args = buildYtDlpArgs(url.trim(), join(outputDir, `${id}.%(ext)s`));
        }
        stored.outputPath = outputPath;

        const child = spawn(tool.bin, args, { windowsHide: true });
        stored.child = child;
        job.status = 'running';
        job.updatedAt = now();

        child.stderr.on('data', (chunk: Buffer) => {
          const text = chunk.toString('utf8');
          stored.stderrTail = `${stored.stderrTail}${text}`.slice(-8000);
          const progress = engine === 'ffmpeg'
            ? parseFfmpegProgress(stored.stderrTail)
            : parseYtDlpProgress(text);
          if (progress !== null) {
            job.progress = progress;
            job.updatedAt = now();
          }
        });
        child.on('error', (error) => {
          finish(stored, 'failed', `Could not run ${engine}: ${error.message}`);
        });
        child.on('close', async (code) => {
          if (stored.child === null && job.status !== 'running') return; // already cancelled
          stored.child = null;
          const refusal = findRefusalReason(stored.stderrTail);
          if (refusal) {
            finish(stored, 'refused', `${refusal} ${MEDIA_DOWNLOAD_REFUSAL_MESSAGE}`);
            return;
          }
          if (code !== 0) {
            const detail = stored.stderrTail.trim().split('\n').slice(-3).join(' ').trim();
            finish(stored, 'failed', detail
              ? `${engine} exited with code ${code}: ${detail}`
              : `${engine} exited with code ${code}.`);
            return;
          }
          if (engine === 'ffmpeg') {
            job.outputPath = outputPath;
          } else {
            // yt-dlp names the file from the job id template; find it.
            try {
              const files = await readdir(outputDir);
              const match = files.find((file) => file.startsWith(`${id}.`));
              job.outputPath = match ? join(outputDir, match) : null;
            } catch {
              job.outputPath = null;
            }
          }
          if (!job.outputPath) {
            finish(stored, 'failed', 'The download finished but no output file was found.');
            return;
          }
          finish(stored, 'completed', null);
          job.progress = 100;
        });
      } catch (error) {
        finish(stored, 'failed', error instanceof Error ? error.message : String(error));
      }
      return snapshot(stored);
    },

    get: async (payload) => {
      const stored = typeof payload?.id === 'string' ? jobs.get(payload.id) : undefined;
      return stored ? snapshot(stored) : null;
    },

    list: async () => [...jobs.values()]
      .map((stored) => snapshot(stored))
      .sort((a, b) => b.startedAt - a.startedAt),

    cancel: async (payload) => {
      const stored = typeof payload?.id === 'string' ? jobs.get(payload.id) : undefined;
      if (!stored) return { success: false, error: 'Download job not found.' };
      if (stored.child) {
        stored.child.kill();
        stored.child = null;
      }
      if (stored.job.status === 'running' || stored.job.status === 'queued') {
        stored.job.status = 'cancelled';
        stored.job.updatedAt = now();
      }
      return { success: true };
    },
  };
}
