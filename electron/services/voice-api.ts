import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { Buffer } from 'node:buffer';
import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import { getVoiceProfile, getVoiceTuning, toSpeakableText } from '@shared/voice';
import { isRecord } from './payload-utils';

export const WINDOWS_SPEAK_SCRIPT = String.raw`
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
try {
  $requestedGender = [System.Enum]::Parse([System.Speech.Synthesis.VoiceGender], $env:CINA_VOICE_GENDER)
  $candidate = $synth.GetInstalledVoices() |
    Where-Object { $_.Enabled -and $_.VoiceInfo.Gender -eq $requestedGender } |
    Select-Object -First 1
  if ($null -ne $candidate) { $synth.SelectVoice($candidate.VoiceInfo.Name) }
  $text = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($env:CINA_VOICE_TEXT_B64))
  $escaped = [System.Security.SecurityElement]::Escape($text)
  $pitch = [int]$env:CINA_VOICE_PITCH
  $rate = [int]$env:CINA_VOICE_RATE
  $pitchValue = if ($pitch -ge 0) { "+$pitch%" } else { "$pitch%" }
  $rateValue = if ($rate -ge 0) { "+$rate%" } else { "$rate%" }
  $cultureName = $synth.Voice.Culture.Name
  $ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='$cultureName'><prosody pitch='$pitchValue' rate='$rateValue'>$escaped</prosody></speak>"
  try { $synth.SpeakSsml($ssml) } catch { $synth.Speak($text) }
  Write-Output '{"success":true}'
} finally {
  $synth.Dispose()
}
`;

export const WINDOWS_LISTEN_SCRIPT = String.raw`
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$recognizer = $null
try {
  try {
    $culture = [System.Globalization.CultureInfo]::GetCultureInfo($env:CINA_VOICE_LOCALE)
    $recognizer = [System.Speech.Recognition.SpeechRecognitionEngine]::new($culture)
  } catch {
    $recognizer = [System.Speech.Recognition.SpeechRecognitionEngine]::new()
  }
  $recognizer.LoadGrammar([System.Speech.Recognition.DictationGrammar]::new())
  $recognizer.SetInputToDefaultAudioDevice()
  $result = $recognizer.Recognize([TimeSpan]::FromMilliseconds([int]$env:CINA_VOICE_TIMEOUT_MS))
  if ($null -eq $result) {
    @{ success = $false; error = 'No speech was detected.' } | ConvertTo-Json -Compress
  } else {
    @{ success = $true; text = $result.Text; confidence = $result.Confidence } | ConvertTo-Json -Compress
  }
} finally {
  if ($null -ne $recognizer) { $recognizer.Dispose() }
}
`;

type SpawnVoiceProcess = (
  command: string,
  args: readonly string[],
  options: SpawnOptions,
) => ChildProcess;

export type VoiceApiDependencies = {
  platform?: NodeJS.Platform;
  spawnProcess?: SpawnVoiceProcess;
};

type ActiveProcess = { child: ChildProcess; cancelled: boolean; timedOut: boolean };
type ProcessResult = { exitCode: number | null; stdout: string; stderr: string; cancelled: boolean; timedOut: boolean };

export function encodePowerShellCommand(script: string): string {
  return Buffer.from(script, 'utf16le').toString('base64');
}

function normalizeLocale(locale: unknown): string {
  const candidate = typeof locale === 'string' ? locale.trim() : '';
  return /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(candidate) ? candidate : 'en-US';
}

function parseLastJsonObject(stdout: string): Record<string, unknown> | null {
  const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(lines[index] ?? '');
      if (isRecord(parsed)) return parsed;
    } catch {
      // PowerShell can emit informational lines before the compact JSON result.
    }
  }
  return null;
}

export function createVoiceApi(
  dependencies: VoiceApiDependencies = {},
): CompleteHostServiceRegistry['voice'] {
  const platform = dependencies.platform ?? process.platform;
  const spawnProcess = dependencies.spawnProcess ?? spawn;
  let activeSpeech: ActiveProcess | null = null;
  let activeListening: ActiveProcess | null = null;

  const cancel = (active: ActiveProcess | null): void => {
    if (!active) return;
    active.cancelled = true;
    if (!active.child.killed) active.child.kill();
  };

  const runPowerShell = (
    script: string,
    environment: Record<string, string>,
    maximumMs: number,
    assign: (active: ActiveProcess) => void,
    clear: (active: ActiveProcess) => void,
  ): Promise<ProcessResult> => new Promise((resolve) => {
    const child = spawnProcess(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodePowerShellCommand(script)],
      {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, ...environment },
      },
    );
    const active: ActiveProcess = { child, cancelled: false, timedOut: false };
    assign(active);
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clear(active);
      resolve({ exitCode, stdout, stderr, cancelled: active.cancelled, timedOut: active.timedOut });
    };
    child.stdout?.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr?.on('data', (chunk) => { stderr += String(chunk); });
    child.once('error', (error) => {
      stderr += error.message;
      finish(null);
    });
    child.once('close', (code) => finish(code));
    const timer = setTimeout(() => {
      stderr += '\nWindows speech operation timed out.';
      active.timedOut = true;
      if (!active.child.killed) active.child.kill();
    }, maximumMs);
  });

  return {
    speak: async (payload) => {
      if (platform !== 'win32') {
        return { success: false, error: 'Windows native speech is available in the Windows app.' };
      }
      const body: Record<string, unknown> = isRecord(payload) ? payload : {};
      const text = toSpeakableText(typeof body.text === 'string' ? body.text : '');
      if (!text) return { success: false, error: 'There is no readable text.' };
      const profile = getVoiceProfile(typeof body.profileId === 'string' ? body.profileId : undefined);
      const speed = typeof body.speed === 'number' ? body.speed : 1;
      const depth = typeof body.depth === 'number' ? body.depth : profile.defaultDepth;
      const tuning = getVoiceTuning(profile, speed, depth);
      cancel(activeSpeech);
      const result = await runPowerShell(
        WINDOWS_SPEAK_SCRIPT,
        {
          CINA_VOICE_TEXT_B64: Buffer.from(text, 'utf8').toString('base64'),
          CINA_VOICE_GENDER: profile.gender === 'female' ? 'Female' : 'Male',
          CINA_VOICE_PITCH: String(tuning.pitchPercent),
          CINA_VOICE_RATE: String(tuning.ratePercent),
        },
        10 * 60_000,
        (active) => { activeSpeech = active; },
        (active) => { if (activeSpeech === active) activeSpeech = null; },
      );
      if (result.timedOut) return { success: false, error: 'Windows speech synthesis timed out.' };
      if (result.cancelled) return { success: true, cancelled: true };
      if (result.exitCode !== 0) {
        return { success: false, error: result.stderr.trim() || 'Windows speech synthesis failed.' };
      }
      return { success: true };
    },
    stopSpeaking: () => {
      cancel(activeSpeech);
      activeSpeech = null;
      return { success: true };
    },
    listen: async (payload) => {
      if (platform !== 'win32') {
        return { success: false, error: 'Windows native dictation is available in the Windows app.' };
      }
      const body: Record<string, unknown> = isRecord(payload) ? payload : {};
      const requestedTimeout = typeof body.timeoutMs === 'number' ? body.timeoutMs : 15_000;
      const timeoutMs = Math.round(Math.min(30_000, Math.max(3_000, requestedTimeout)));
      cancel(activeListening);
      const result = await runPowerShell(
        WINDOWS_LISTEN_SCRIPT,
        {
          CINA_VOICE_LOCALE: normalizeLocale(body.locale),
          CINA_VOICE_TIMEOUT_MS: String(timeoutMs),
        },
        timeoutMs + 8_000,
        (active) => { activeListening = active; },
        (active) => { if (activeListening === active) activeListening = null; },
      );
      if (result.timedOut) return { success: false, error: 'Windows speech recognition timed out.' };
      if (result.cancelled) return { success: true, cancelled: true };
      if (result.exitCode !== 0) {
        return { success: false, error: result.stderr.trim() || 'Windows speech recognition failed.' };
      }
      const output = parseLastJsonObject(result.stdout);
      if (!output || output.success !== true || typeof output.text !== 'string') {
        return {
          success: false,
          error: typeof output?.error === 'string' ? output.error : 'No speech was detected.',
        };
      }
      return {
        success: true,
        text: output.text.trim(),
        ...(typeof output.confidence === 'number' ? { confidence: output.confidence } : {}),
      };
    },
    cancelListening: () => {
      cancel(activeListening);
      activeListening = null;
      return { success: true };
    },
  };
}
