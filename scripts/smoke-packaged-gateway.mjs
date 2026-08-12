#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const STARTUP_MARKER = '[metric] gateway.startup';
const FAILURE_MARKERS = [
  'Gateway startup failed fatally',
];
const timeoutMs = Number.parseInt(process.env.CLAWX_GATEWAY_SMOKE_TIMEOUT_MS || '120000', 10);
const executable = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve('release', 'win-unpacked', 'Cina-Claw Pro.exe');

if (process.platform !== 'win32') {
  console.log('[gateway-smoke] Skipped: the packaged gateway smoke test requires Windows.');
  process.exit(0);
}

async function findLogFiles(root) {
  const matches = [];
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
      } else if (/^(clawx-.*\.log|gateway\.log)$/i.test(entry.name)) {
        matches.push(fullPath);
      }
    }
  }
  return matches;
}

async function readLogs(root) {
  const files = await findLogFiles(root);
  const logs = [];
  for (const file of files) {
    try {
      logs.push({ file, content: await readFile(file, 'utf8') });
    } catch {
      // A live logger may briefly hold a file; retry on the next poll.
    }
  }
  return logs;
}

async function terminateProcessTree(pid) {
  if (!pid) return;
  spawnSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
    windowsHide: true,
    stdio: 'ignore',
  });
}

function isGatewayPortListening() {
  const result = spawnSync('netstat.exe', ['-ano', '-p', 'tcp'], {
    windowsHide: true,
    encoding: 'utf8',
  });
  return String(result.stdout || '')
    .split(/\r?\n/)
    .some((line) => /:18789\s+.*\s+LISTENING\s+\d+\s*$/i.test(line));
}

const profileRoot = await mkdtemp(path.join(tmpdir(), 'cina-claw-gateway-smoke-'));
const roamingRoot = path.join(profileRoot, 'AppData', 'Roaming');
const localRoot = path.join(profileRoot, 'AppData', 'Local');
const child = spawn(executable, [], {
  detached: false,
  windowsHide: true,
  stdio: 'ignore',
  env: {
    ...process.env,
    APPDATA: roamingRoot,
    LOCALAPPDATA: localRoot,
    USERPROFILE: profileRoot,
    HOME: profileRoot,
    CLAWX_GATEWAY_STARTUP_TRACE: '1',
  },
});

let exitCode = null;
let spawnError = null;
child.once('exit', (code) => {
  exitCode = code;
});
child.once('error', (error) => {
  spawnError = error;
});

const deadline = Date.now() + timeoutMs;
let latestLogs = [];
let failure = null;

try {
  while (Date.now() < deadline) {
    latestLogs = await readLogs(profileRoot);
    const combined = latestLogs.map(({ content }) => content).join('\n');
    if (combined.includes(STARTUP_MARKER)) {
      console.log(`[gateway-smoke] PASS: packaged gateway connected (${STARTUP_MARKER}).`);
      process.exitCode = 0;
      break;
    }

    const fatalMarker = FAILURE_MARKERS.find((marker) => combined.includes(marker));
    if (fatalMarker) {
      failure = `Packaged gateway emitted fatal startup marker: ${fatalMarker}`;
      break;
    }
    if (exitCode !== null) {
      failure = `Packaged application exited before gateway readiness (code=${String(exitCode)}).`;
      break;
    }
    if (spawnError) {
      failure = `Could not launch packaged application: ${spawnError.message}`;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (process.exitCode !== 0) {
    failure ||= `Timed out after ${timeoutMs}ms waiting for ${STARTUP_MARKER}.`;
    console.error(`[gateway-smoke] FAIL: ${failure}`);
    for (const { file, content } of latestLogs) {
      console.error(`\n[gateway-smoke] ${file}\n${content.slice(-24000)}`);
    }
    process.exitCode = 1;
  }
} finally {
  await terminateProcessTree(child.pid);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (isGatewayPortListening()) {
    console.error('[gateway-smoke] FAIL: port 18789 is still listening after process-tree cleanup.');
    process.exitCode = 1;
  }
  await rm(profileRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}
