/**
 * Media download helpers (pure, no Electron dependency).
 *
 * Cina-Claw Pro downloads clear (unencrypted, unauthenticated) video only:
 * - `.m3u8` HLS playlists via ffmpeg (variant selection, key handling and
 *   segment assembly are all ffmpeg's job — never hand-rolled here).
 * - Progressive and site video via yt-dlp (extraction only; the app never
 *   passes credentials, cookies, or login flags to either tool).
 *
 * DRM-protected, login/paywall-gated and CAPTCHA-gated downloads are
 * refused, never attempted: see `findRefusalReason`, which the main-process
 * service runs against tool output, and the pre-flight checks in
 * `classifyMediaDownloadUrl`. The app has no CAPTCHA-solving, credential,
 * or cookie mechanism of any kind.
 */

export type MediaDownloadEngine = 'ffmpeg' | 'yt-dlp';

export type MediaDownloadStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'refused'
  | 'cancelled';

export interface MediaDownloadJob {
  id: string;
  url: string;
  engine: MediaDownloadEngine;
  status: MediaDownloadStatus;
  /** 0-100 while running, when the tool reports one; otherwise null. */
  progress: number | null;
  outputPath: string | null;
  error: string | null;
  /** Set when status is 'refused': why this download is not attempted. */
  refusalReason: string | null;
  startedAt: number;
  updatedAt: number;
}

export interface MediaDownloadStartPayload {
  url: string;
  outputDir?: string;
}

export interface MediaDownloadToolsResult {
  ffmpeg: boolean;
  ytDlp: boolean;
  /** True when running from a packaged build (tools must be bundled). */
  bundled: boolean;
}

export const MEDIA_DOWNLOAD_REFUSAL_MESSAGE =
  'This download is refused: Cina-Claw Pro downloads only clear, public video. '
  + 'DRM-protected streams, login/paywall-gated content, and anything requiring '
  + 'a CAPTCHA are not supported, and the app never supplies credentials, '
  + 'cookies, or CAPTCHA answers to a download tool.';

/** Tool-output phrases that mean the content is gated, not merely failing. */
const REFUSAL_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /drm|widevine|fairplay|encrypted stream/i, reason: 'The stream appears to be DRM-protected.' },
  // Specific before generic: "Sign in to confirm your age" must not collapse into plain login.
  { pattern: /sign in to confirm your age|age verification/i, reason: 'The content requires age verification via login.' },
  { pattern: /login required|log in|sign in|requires authentication|not logged in/i, reason: 'The content requires a login.' },
  { pattern: /private video|members only|premium members|paywall|subscription required|only available to/i, reason: 'The content is paywall- or membership-gated.' },
  { pattern: /captcha/i, reason: 'The site is asking for a CAPTCHA.' },
];

/** Returns a human-readable refusal reason for tool output, or null. */
export function findRefusalReason(output: string): string | null {
  for (const entry of REFUSAL_PATTERNS) {
    if (entry.pattern.test(output)) return entry.reason;
  }
  return null;
}

/**
 * Validates a user-supplied URL and picks the engine. Throws an Error with a
 * user-facing message for anything that must not be attempted.
 */
export function classifyMediaDownloadUrl(rawUrl: string): MediaDownloadEngine {
  const urlText = rawUrl.trim();
  if (!urlText) throw new Error('Enter a video URL to download.');
  let parsed: URL;
  try {
    parsed = new URL(urlText);
  } catch {
    throw new Error('That is not a valid URL. Enter an http(s) video or playlist URL.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http(s) video URLs are supported.');
  }
  if (parsed.username || parsed.password) {
    throw new Error(
      'URLs containing credentials are refused: Cina-Claw Pro never downloads login-gated content.',
    );
  }
  // HLS playlists go to ffmpeg; everything else goes to yt-dlp's extractor.
  if (/\.m3u8($|\?)/i.test(parsed.pathname + parsed.search)) return 'ffmpeg';
  return 'yt-dlp';
}

export function sanitizeDownloadFileName(url: string, jobId: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'video';
  } catch {
    host = 'video';
  }
  return `${host}-${jobId}.mp4`;
}

/** ffmpeg invocation for a clear HLS playlist. ffmpeg selects the best variant. */
export function buildFfmpegArgs(url: string, outputPath: string): string[] {
  return [
    '-hide_banner',
    '-y',
    // httpproxy is required when an HTTP(S) proxy is configured (ffmpeg
    // routes through it as its own protocol); without it, proxied hosts fail.
    '-protocol_whitelist', 'file,http,https,httpproxy,tcp,tls,crypto',
    '-i', url,
    '-c', 'copy',
    '-movflags', '+faststart',
    outputPath,
  ];
}

/**
 * yt-dlp invocation for progressive/site video. Deliberately no cookies,
 * username, password, or playlist expansion: single public videos only.
 */
export function buildYtDlpArgs(url: string, outputTemplate: string): string[] {
  return [
    '--no-playlist',
    '--no-warnings',
    '--restrict-filenames',
    '--format', 'bestvideo+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--output', outputTemplate,
    url,
  ];
}

/** Parses ffmpeg stderr for a 0-100 progress value, or null when unknown. */
export function parseFfmpegProgress(stderrText: string): number | null {
  const durationMatch = stderrText.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const timeMatches = [...stderrText.matchAll(/time=(\d+):(\d+):([\d.]+)/g)];
  if (!durationMatch || timeMatches.length === 0) return null;
  const toSeconds = (h: string, m: string, s: string): number =>
    Number(h) * 3600 + Number(m) * 60 + Number(s);
  const duration = toSeconds(durationMatch[1], durationMatch[2], durationMatch[3]);
  const last = timeMatches[timeMatches.length - 1];
  const elapsed = toSeconds(last[1], last[2], last[3]);
  if (duration <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((elapsed / duration) * 100)));
}

/** Parses a yt-dlp progress line such as "[download]  42.3% of ...". */
export function parseYtDlpProgress(line: string): number | null {
  const match = line.match(/\[download\]\s+([\d.]+)%/);
  if (!match) return null;
  return Math.max(0, Math.min(100, Math.round(Number(match[1]))));
}
