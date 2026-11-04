import { describe, expect, it } from 'vitest';
import { stripSkillTokens } from '@/lib/chat-mode-directives';

describe('stripSkillTokens (v1.0.7)', () => {
  it('removes a composer skill token plus its two-space delimiter', () => {
    expect(stripSkillTokens('/research  what is new')).toBe('what is new');
    expect(stripSkillTokens('use /research  now')).toBe('use now');
  });

  it('leaves paths, URLs, and other double spaces untouched', () => {
    expect(stripSkillTokens('check /api/v1  docs')).toBe('check /api/v1  docs');
    expect(stripSkillTokens('see https://example.com/a  and b')).toBe('see https://example.com/a  and b');
    expect(stripSkillTokens('a  b')).toBe('a  b');
  });

  it('does not strip a token without its two-space delimiter', () => {
    expect(stripSkillTokens('/research now')).toBe('/research now');
  });
});
