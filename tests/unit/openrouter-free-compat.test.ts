import { describe, expect, it } from 'vitest';
import {
  applyOpenRouterFreeCompatibility,
  isOpenRouterFreeModelRef,
} from '../../electron/utils/openrouter-free-compat';

describe('OpenRouter free-agent compatibility', () => {
  it('recognizes provider-qualified and direct free-router model references', () => {
    expect(isOpenRouterFreeModelRef('openrouter/free')).toBe(true);
    expect(isOpenRouterFreeModelRef('openrouter/openrouter/free')).toBe(true);
    expect(isOpenRouterFreeModelRef('openai/gpt-5')).toBe(false);
  });

  it('normalizes an OpenRouter provider and constrains only unset free-agent concurrency', () => {
    const config: Record<string, unknown> = {
      models: {
        providers: {
          openrouter: { apiKey: 'redacted' },
        },
      },
      agents: {
        defaults: {
          model: { primary: 'openrouter/free', fallbacks: [] },
        },
      },
    };

    expect(applyOpenRouterFreeCompatibility(config)).toBe(true);
    expect(config).toMatchObject({
      models: {
        providers: {
          openrouter: {
            baseUrl: 'https://openrouter.ai/api/v1',
            api: 'openai-completions',
            headers: {
              'HTTP-Referer': 'https://github.com/johngraven75/Cina-Claw-Pro',
              'X-OpenRouter-Title': 'Cina-Claw Pro',
            },
          },
        },
      },
      agents: { defaults: { maxConcurrent: 1, subagents: { maxConcurrent: 1 } } },
    });
  });

  it('preserves explicit provider headers and concurrency choices', () => {
    const config: Record<string, unknown> = {
      models: {
        providers: {
          openrouter: {
            baseUrl: 'https://openrouter.ai/api/v1',
            api: 'openai-completions',
            headers: { 'X-OpenRouter-Title': 'Custom title' },
          },
        },
      },
      agents: {
        defaults: {
          maxConcurrent: 3,
          model: { primary: 'openrouter/free' },
          subagents: { maxConcurrent: 2 },
        },
      },
    };

    applyOpenRouterFreeCompatibility(config);
    expect(config).toMatchObject({
      models: { providers: { openrouter: { headers: { 'X-OpenRouter-Title': 'Custom title' } } } },
      agents: { defaults: { maxConcurrent: 3, subagents: { maxConcurrent: 2 } } },
    });
  });
});
