import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VOICE_PROFILE_ID,
  VOICE_PROFILES,
  getVoiceProfile,
  getVoiceTuning,
  toSpeakableText,
} from '../../shared/voice';

describe('Cina-Claw Pro voice profiles', () => {
  it('ships exactly five female and five male choices', () => {
    expect(VOICE_PROFILES).toHaveLength(10);
    expect(VOICE_PROFILES.filter((profile) => profile.gender === 'female')).toHaveLength(5);
    expect(VOICE_PROFILES.filter((profile) => profile.gender === 'male')).toHaveLength(5);
    expect(new Set(VOICE_PROFILES.map((profile) => profile.id)).size).toBe(10);
  });

  it('resolves a valid default and safely falls back from unknown ids', () => {
    expect(getVoiceProfile(DEFAULT_VOICE_PROFILE_ID).id).toBe(DEFAULT_VOICE_PROFILE_ID);
    expect(getVoiceProfile('not-installed').id).toBe(DEFAULT_VOICE_PROFILE_ID);
  });

  it('maps speed and depth into bounded Windows speech tuning', () => {
    const profile = getVoiceProfile('atlas');
    expect(getVoiceTuning(profile, 9, 999)).toEqual({ pitchPercent: -29, ratePercent: 32 });
    expect(getVoiceTuning(profile, -5, -10)).toEqual({ pitchPercent: -1, ratePercent: -40 });
  });

  it('removes Markdown noise and raw URLs before playback', () => {
    expect(toSpeakableText('## Result\n- See [the report](https://example.com)\n```ts\nsecret()\n```'))
      .toBe('Result See the report');
  });

  it('redacts credential-shaped content before automatic playback', () => {
    expect(toSpeakableText('API key: sk-abcdefghijklmnopqrstuvwxyz123456 password=hunter2'))
      .toBe('API key: [redacted secret] password: [redacted secret]');
  });
});
