// Node test for the pure media-download helpers (shared/media-download.ts).
// Run after transpiling that file with the repo's TypeScript, e.g.:
//   tsc shared/media-download.ts --module commonjs --target es2022 --outDir /tmp/md-test
//   node --test tests/media-download.test.mjs  (with the compiled module beside it)
// The test file below is written against a compiled module at
// ./media-download.cjs — see FIXES.md for the exact commands used.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFfmpegArgs,
  buildYtDlpArgs,
  classifyMediaDownloadUrl,
  findRefusalReason,
  parseFfmpegProgress,
  parseYtDlpProgress,
  sanitizeDownloadFileName,
} from './media-download.cjs';

test('classify: .m3u8 goes to ffmpeg, other video to yt-dlp', () => {
  assert.equal(classifyMediaDownloadUrl('https://example.com/stream.m3u8'), 'ffmpeg');
  assert.equal(classifyMediaDownloadUrl('https://example.com/watch?v=1'), 'yt-dlp');
});

test('classify: non-http(s) and credential URLs are refused', () => {
  assert.throws(() => classifyMediaDownloadUrl('file:///tmp/x.mp4'), /Only http/);
  assert.throws(() => classifyMediaDownloadUrl('https://user:pass@example.com/v.mp4'), /credentials are refused/);
  assert.throws(() => classifyMediaDownloadUrl('not a url'), /not a valid URL/);
});

test('ffmpeg args never hand-roll segments and allow crypto keys', () => {
  const args = buildFfmpegArgs('https://example.com/s.m3u8', '/tmp/out.mp4');
  assert.ok(args.includes('-c') && args.includes('copy'));
  assert.ok(args.join(' ').includes('crypto'));
  assert.equal(args.at(-1), '/tmp/out.mp4');
});

test('yt-dlp args never pass credentials, cookies, or playlists', () => {
  const args = buildYtDlpArgs('https://example.com/v', '/tmp/%(id)s.%(ext)s');
  assert.ok(args.includes('--no-playlist'));
  assert.ok(!args.some((a) => /cookie|username|password/i.test(a)));
});

test('refusal detection flags DRM, login, paywall, and CAPTCHA output', () => {
  assert.match(findRefusalReason('ERROR: This video is DRM protected') ?? '', /DRM/);
  assert.match(findRefusalReason('ERROR: Sign in to confirm your age') ?? '', /age verification/);
  assert.match(findRefusalReason('please complete the captcha') ?? '', /CAPTCHA/);
  assert.equal(findRefusalReason('ERROR: network timeout'), null);
});

test('progress parsers return bounded percentages', () => {
  const ffmpeg = parseFfmpegProgress('Duration: 00:01:00.00, time=00:00:30.00 bitrate=1');
  assert.equal(ffmpeg, 50);
  assert.equal(parseYtDlpProgress('[download]  42.3% of 10MiB'), 42);
  assert.equal(parseYtDlpProgress('nothing here'), null);
});

test('output filenames are sanitized and job-scoped', () => {
  assert.equal(sanitizeDownloadFileName('https://sub.example.com/v', 'abc123'), 'sub-example-com-abc123.mp4');
});
