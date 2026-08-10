import { EventEmitter } from 'node:events';
import { Buffer } from 'node:buffer';
import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { describe, expect, it, vi } from 'vitest';
import {
  WINDOWS_LISTEN_SCRIPT,
  WINDOWS_SPEAK_SCRIPT,
  createVoiceApi,
  encodePowerShellCommand,
} from '../../electron/services/voice-api';

function mockProcess(stdoutText: string, exitCode = 0): ChildProcess {
  const process = new EventEmitter() as ChildProcess;
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  Object.assign(process, {
    stdout,
    stderr,
    killed: false,
    kill: vi.fn(() => true),
  });
  queueMicrotask(() => {
    if (stdoutText) stdout.emit('data', Buffer.from(stdoutText));
    process.emit('close', exitCode);
  });
  return process;
}

describe('Windows native voice host API', () => {
  it('encodes PowerShell as UTF-16LE', () => {
    expect(Buffer.from(encodePowerShellCommand('Write-Output "ready"'), 'base64').toString('utf16le'))
      .toBe('Write-Output "ready"');
  });

  it('passes speech text as base64 environment data without shell interpolation', async () => {
    const spawnProcess = vi.fn((_command: string, _args: readonly string[], _options: SpawnOptions) => (
      mockProcess('{"success":true}\n')
    ));
    const api = createVoiceApi({ platform: 'win32', spawnProcess });
    const privateText = 'Hello; $(Get-Secret) "quoted"';

    await expect(api.speak({ text: privateText, profileId: 'atlas', speed: 1, depth: 80 }))
      .resolves.toEqual({ success: true });

    const [, args, options] = spawnProcess.mock.calls[0] ?? [];
    expect(args?.join(' ')).not.toContain(privateText);
    expect(WINDOWS_SPEAK_SCRIPT).not.toContain(privateText);
    const encodedText = (options?.env as NodeJS.ProcessEnv | undefined)?.CINA_VOICE_TEXT_B64 ?? '';
    expect(Buffer.from(encodedText, 'base64').toString('utf8')).toBe(privateText);
  });

  it('returns a compact Windows dictation result', async () => {
    const spawnProcess = vi.fn(() => mockProcess('{"success":true,"text":"send the report","confidence":0.91}\n'));
    const api = createVoiceApi({ platform: 'win32', spawnProcess });

    await expect(api.listen({ locale: 'en-US', timeoutMs: 5_000 })).resolves.toEqual({
      success: true,
      text: 'send the report',
      confidence: 0.91,
    });
    expect(Buffer.from(spawnProcess.mock.calls[0]?.[1]?.at(-1) ?? '', 'base64').toString('utf16le'))
      .toBe(WINDOWS_LISTEN_SCRIPT);
  });

  it('fails closed outside the Windows build without spawning a process', async () => {
    const spawnProcess = vi.fn();
    const api = createVoiceApi({ platform: 'linux', spawnProcess });
    await expect(api.listen()).resolves.toMatchObject({ success: false });
    await expect(api.speak({ text: 'hello', profileId: 'aurora', speed: 1, depth: 50 }))
      .resolves.toMatchObject({ success: false });
    expect(spawnProcess).not.toHaveBeenCalled();
  });
});
