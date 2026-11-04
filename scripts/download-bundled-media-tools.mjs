#!/usr/bin/env zx
/**
 * Download bundled media-download tools for Windows packaging.
 *
 * ffmpeg (gyan.dev release-essentials zip, Windows x64) and yt-dlp
 * (latest GitHub release, yt-dlp.exe) are placed under
 * resources/bin/win32-x64/, which electron-builder.yml copies to the
 * installer's `bin/` directory on Windows. The media-download host service
 * runs those bundled copies in packaged builds — it does not depend on the
 * user's PATH. Binaries live under resources/bin/ and are git-ignored;
 * `pnpm run prep:win-binaries` must run before `pnpm run package:win`.
 *
 * Windows arm64 has no gyan.dev essentials build, so only win32-x64 is
 * supported here; an arm64 Windows build must supply its own ffmpeg.
 */
import 'zx/globals';

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'resources', 'bin', 'win32-x64');
const FFMPEG_URL = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';

async function fetchLatestYtDlpUrl() {
  const response = await fetch('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest', {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'cina-claw-pro-media-tools' },
  });
  if (!response.ok) throw new Error(`yt-dlp release lookup failed: ${response.status}`);
  const release = await response.json();
  const asset = (release.assets || []).find((entry) => entry.name === 'yt-dlp.exe');
  if (!asset) throw new Error('yt-dlp.exe not found in the latest yt-dlp release');
  return asset.browser_download_url;
}

async function downloadTo(url, targetPath) {
  echo`⬇️ Downloading: ${url}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  await fs.writeFile(targetPath, Buffer.from(await response.arrayBuffer()));
}

async function extractZip(archivePath, destDir) {
  if (os.platform() === 'win32') {
    const { execFileSync } = await import('child_process');
    const psCommand = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${archivePath.replace(/'/g, "''")}', '${destDir.replace(/'/g, "''")}')`;
    execFileSync('powershell.exe', ['-NoProfile', '-Command', psCommand], { stdio: 'inherit' });
  } else {
    await $`unzip -o -q ${archivePath} -d ${destDir}`;
  }
}

async function main() {
  const platform = argv.platform || (argv.all ? 'all' : 'win');
  if (platform !== 'win' && platform !== 'all') {
    echo(chalk.yellow`⚠️ Media tools are currently packaged for Windows only (win32-x64). Skipping ${platform}.`);
    return;
  }
  await fs.ensureDir(OUTPUT_DIR);
  const tempDir = path.join(ROOT_DIR, 'temp_media_tools_extract');
  await fs.remove(tempDir);
  await fs.ensureDir(tempDir);

  // yt-dlp (single exe, no extraction needed)
  const ytDlpUrl = await fetchLatestYtDlpUrl();
  await downloadTo(ytDlpUrl, path.join(OUTPUT_DIR, 'yt-dlp.exe'));

  // ffmpeg (essentials zip contains ffmpeg-*-essentials_build/bin/ffmpeg.exe)
  const archivePath = path.join(ROOT_DIR, 'ffmpeg-release-essentials.zip');
  await downloadTo(FFMPEG_URL, archivePath);
  await extractZip(archivePath, tempDir);
  const binDirs = await fs.readdir(tempDir);
  const ffmpegDir = binDirs.find((name) => name.startsWith('ffmpeg-') && name.endsWith('essentials_build'));
  const ffmpegExe = ffmpegDir
    ? path.join(tempDir, ffmpegDir, 'bin', 'ffmpeg.exe')
    : null;
  if (!ffmpegExe || !(await fs.pathExists(ffmpegExe))) {
    throw new Error('ffmpeg.exe not found inside the downloaded essentials zip');
  }
  await fs.copy(ffmpegExe, path.join(OUTPUT_DIR, 'ffmpeg.exe'));
  await fs.remove(archivePath);
  await fs.remove(tempDir);
  echo(chalk.green('✅ Bundled media tools ready in ' + OUTPUT_DIR + ' (ffmpeg.exe, yt-dlp.exe)'));
}

await main();
