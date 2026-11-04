import { describe, expect, it } from 'vitest';
import {
  normalizeOllamaModelId,
  OLLAMA_AUTOCONFIG_PRIORITY,
  OLLAMA_PULL_ALLOWLIST,
} from '../../electron/services/ollama-api';

describe('Ollama autoconfig allowlist (v1.0.7)', () => {
  it('allows only the pre-attached Qwen3-VL builds for pull', () => {
    for (const id of [
      'qwen3-vl:8b-instruct',
      'qwen3-vl:8b',
      'qwen3-vl:4b-instruct',
      'qwen3-vl:4b',
      'qwen3-vl:2b-instruct',
      'qwen3-vl:2b',
    ]) {
      expect(normalizeOllamaModelId(id)).toBe(id);
    }
    expect(OLLAMA_PULL_ALLOWLIST).toHaveLength(6);
  });

  it('refuses arbitrary, retired, and unrelated model IDs', () => {
    expect(normalizeOllamaModelId('llama3.2:3b')).toBeNull();
    expect(normalizeOllamaModelId('gemma4:latest')).toBeNull();
    expect(normalizeOllamaModelId('stealth/ox-alpha')).toBeNull();
    expect(normalizeOllamaModelId('deepseek-ai/DeepSeek-R1')).toBeNull();
    expect(normalizeOllamaModelId('')).toBeNull();
    expect(normalizeOllamaModelId(undefined)).toBeNull();
  });

  it('normalizes :latest and case before the allowlist check', () => {
    expect(normalizeOllamaModelId('Qwen3-VL:8B-Instruct:latest')).toBe('qwen3-vl:8b-instruct');
  });

  it('orders autoconfig priority 8B first, then 4B, then 2B', () => {
    expect(OLLAMA_AUTOCONFIG_PRIORITY[0]).toBe('qwen3-vl:8b-instruct');
    expect(OLLAMA_AUTOCONFIG_PRIORITY.slice(2, 4)).toEqual(['qwen3-vl:4b-instruct', 'qwen3-vl:4b']);
    expect(OLLAMA_AUTOCONFIG_PRIORITY.slice(4)).toEqual(['qwen3-vl:2b-instruct', 'qwen3-vl:2b']);
  });
});
