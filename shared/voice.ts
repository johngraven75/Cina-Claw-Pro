export type VoiceGender = 'female' | 'male';

export type VoiceProfile = {
  id: string;
  gender: VoiceGender;
  style: 'warm' | 'bright' | 'calm' | 'crisp' | 'confident' | 'deep' | 'balanced' | 'gentle' | 'precise' | 'energetic';
  basePitch: number;
  baseRate: number;
  defaultDepth: number;
};

/** Ten offline Windows voice styles: exactly five female and five male. */
export const VOICE_PROFILES: readonly VoiceProfile[] = [
  { id: 'aurora', gender: 'female', style: 'warm', basePitch: 4, baseRate: -2, defaultDepth: 44 },
  { id: 'nova', gender: 'female', style: 'bright', basePitch: 10, baseRate: 7, defaultDepth: 30 },
  { id: 'selene', gender: 'female', style: 'calm', basePitch: -5, baseRate: -9, defaultDepth: 72 },
  { id: 'iris', gender: 'female', style: 'crisp', basePitch: 2, baseRate: 3, defaultDepth: 50 },
  { id: 'ember', gender: 'female', style: 'confident', basePitch: -1, baseRate: 1, defaultDepth: 62 },
  { id: 'atlas', gender: 'male', style: 'deep', basePitch: -15, baseRate: -8, defaultDepth: 86 },
  { id: 'orion', gender: 'male', style: 'balanced', basePitch: -7, baseRate: 0, defaultDepth: 62 },
  { id: 'rowan', gender: 'male', style: 'gentle', basePitch: -4, baseRate: -5, defaultDepth: 54 },
  { id: 'sterling', gender: 'male', style: 'precise', basePitch: -9, baseRate: 3, defaultDepth: 70 },
  { id: 'echo', gender: 'male', style: 'energetic', basePitch: -2, baseRate: 10, defaultDepth: 42 },
] as const;

export const DEFAULT_VOICE_PROFILE_ID = 'aurora';

export function getVoiceProfile(profileId: string | null | undefined): VoiceProfile {
  return VOICE_PROFILES.find((profile) => profile.id === profileId)
    ?? VOICE_PROFILES.find((profile) => profile.id === DEFAULT_VOICE_PROFILE_ID)
    ?? VOICE_PROFILES[0];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getVoiceTuning(
  profile: VoiceProfile,
  speed = 1,
  depth = profile.defaultDepth,
): { pitchPercent: number; ratePercent: number } {
  const safeSpeed = clamp(Number.isFinite(speed) ? speed : 1, 0.6, 1.4);
  const safeDepth = clamp(Number.isFinite(depth) ? depth : profile.defaultDepth, 0, 100);
  return {
    pitchPercent: Math.round(clamp(profile.basePitch + ((50 - safeDepth) * 0.28), -30, 30)),
    ratePercent: Math.round(clamp(profile.baseRate + ((safeSpeed - 1) * 100), -40, 40)),
  };
}

/** Produce speech-friendly text without reading Markdown punctuation or raw URLs aloud. */
export function toSpeakableText(input: string, maxLength = 12_000): string {
  return input
    .replace(/-----BEGIN [^-\n]*PRIVATE KEY-----[\s\S]*?-----END [^-\n]*PRIVATE KEY-----/gi, ' [redacted secret] ')
    .replace(/\b(api[_ -]?key|password|passwd|access[_ -]?token|refresh[_ -]?token|authorization|secret)\s*[:=]\s*(?:Bearer\s+)?[^\s,;]+/gi, '$1: [redacted secret]')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{20,})\b/g, '[redacted secret]')
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[redacted secret]')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/[>*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
