import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const viteEntry = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const megabytes = 1024 * 1024;

// Vite’s dependency graph can exceed Node’s default ~2 GiB old-space limit on
// macOS ARM runners. Size only this child process from the runner’s memory;
// never export a global NODE_OPTIONS override to the rest of the workflow.
const availableMemoryMb = Math.floor((os.totalmem() / megabytes) * 0.6);
const requestedHeapMb = Number.parseInt(process.env.BUILD_VITE_MAX_OLD_SPACE_MB || '', 10);
const maxOldSpaceMb = Number.isFinite(requestedHeapMb) && requestedHeapMb >= 1024
  ? requestedHeapMb
  : Math.max(3072, Math.min(6144, availableMemoryMb));

console.log(`[build-vite] launching Vite build with max-old-space-size=${maxOldSpaceMb} MB`);
const viteArgs = process.argv.slice(2);
if (!viteArgs.includes('build')) viteArgs.unshift('build');
execFileSync(process.execPath, [`--max-old-space-size=${maxOldSpaceMb}`, viteEntry, ...viteArgs], {
  cwd: process.cwd(),
  stdio: 'inherit',
});
