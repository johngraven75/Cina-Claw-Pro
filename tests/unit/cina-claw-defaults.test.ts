import { describe, expect, it } from 'vitest';
import {
  applyCinaClawAutonomyDefaults,
  CINA_DEFAULT_MODEL_ID,
  CINA_DEFAULT_MODEL_REF,
} from '../../electron/utils/cina-claw-defaults';

describe('Cina-Claw Pro autonomy defaults', () => {
  const defaultsFrom = (config: Record<string, unknown>) =>
    ((config.agents as Record<string, unknown>).defaults as Record<string, unknown>);

  it('seeds bounded planning, exec, and delegation defaults', () => {
    const config: Record<string, unknown> = {};
    expect(applyCinaClawAutonomyDefaults(config)).toBe(true);
    expect(config).toMatchObject({
      tools: { codeMode: { enabled: true, maxPendingToolCalls: 24, timeoutMs: 300_000 }, experimental: { planTool: true }, exec: { host: 'gateway', security: 'allowlist', ask: 'on-miss' } },
      agents: { defaults: { maxConcurrent: 4, subagents: { allowAgents: ['*'], maxConcurrent: 4, delegationMode: 'prefer', runTimeoutSeconds: 900 } } },
      models: {
        providers: {
          ollama: {
            baseUrl: 'http://localhost:11434/v1',
            api: 'openai-completions',
            models: [
              {
                id: 'qwen3-vl:8b-instruct',
                name: 'Qwen3-VL 8B Instruct',
                input: ['text', 'image', 'video'],
                contextWindow: 262144,
              },
              {
                id: 'qwen3-vl:4b-instruct',
                name: 'Qwen3-VL 4B Instruct',
                input: ['text', 'image', 'video'],
                contextWindow: 262144,
              },
              {
                id: 'qwen3-vl:2b-instruct',
                name: 'Qwen3-VL 2B Instruct',
                input: ['text', 'image', 'video'],
                contextWindow: 262144,
              },
            ],
          },
        },
      },
    });
    expect((config.models as Record<string, Record<string, Record<string, unknown>>>).providers.ollama).not.toHaveProperty('apiKey');
    expect(defaultsFrom(config).model).toEqual({ primary: CINA_DEFAULT_MODEL_REF, fallbacks: ['ollama/qwen3-vl:4b-instruct', 'ollama/qwen3-vl:2b-instruct'] });
    expect(CINA_DEFAULT_MODEL_ID).toBe('qwen3-vl:8b-instruct');
    expect(CINA_DEFAULT_MODEL_REF).toBe('ollama/qwen3-vl:8b-instruct');
  });

  it('preserves every valid explicit operator choice', () => {
    const config: Record<string, unknown> = { tools: { codeMode: false, experimental: { planTool: false }, exec: { host: 'node', security: 'full', ask: 'off' } }, agents: { defaults: { maxConcurrent: 1, subagents: { allowAgents: ['research'], delegationMode: 'suggest' } } } };
    applyCinaClawAutonomyDefaults(config);
    expect(config).toMatchObject({ tools: { codeMode: false, experimental: { planTool: false }, exec: { host: 'node', security: 'full', ask: 'off' } }, agents: { defaults: { maxConcurrent: 1, subagents: { allowAgents: ['research'], delegationMode: 'suggest' } } } });
  });

  it('is idempotent', () => { const config: Record<string, unknown> = {}; applyCinaClawAutonomyDefaults(config); expect(applyCinaClawAutonomyDefaults(config)).toBe(false); });

  it('migrates a saved retired Ox Alpha default to the OpenRouter successor', () => {
    const config: Record<string, unknown> = {
      models: {
        providers: {
          openrouter: {
            baseUrl: 'https://openrouter.ai/api/v1',
            api: 'openai-completions',
            models: [{ id: 'stealth/ox-alpha', name: 'Ox Alpha' }],
          },
        },
      },
      agents: {
        defaults: { model: { primary: 'openrouter/stealth/ox-alpha', fallbacks: ['openrouter/stealth/ox-alpha', 'ollama/qwen3-vl:4b-instruct'] } },
        agents: { main: { model: { primary: 'openrouter/stealth/ox-alpha' } } },
      },
    };
    expect(applyCinaClawAutonomyDefaults(config)).toBe(true);
    const defaults = ((config.agents as Record<string, unknown>).defaults as Record<string, unknown>).model as Record<string, unknown>;
    expect(defaults.primary).toBe('openrouter/z-ai/glm-5.3-flash');
    expect(defaults.fallbacks).toEqual(['openrouter/z-ai/glm-5.3-flash', 'ollama/qwen3-vl:4b-instruct']);
    const providerModels = ((config.models as Record<string, unknown>).providers as Record<string, Record<string, unknown>>).openrouter.models as Array<Record<string, unknown>>;
    expect(providerModels[0].id).toBe('z-ai/glm-5.3-flash');
    // Idempotent: a second pass changes nothing further.
    expect(applyCinaClawAutonomyDefaults(config)).toBe(false);
  });

  it('leaves every non-retired model choice untouched by the migration', () => {
    const config: Record<string, unknown> = {
      models: { providers: {} },
      agents: { defaults: { model: { primary: 'ollama/qwen3-vl:8b-instruct', fallbacks: ['ollama/qwen3-vl:4b-instruct'] } } },
    };
    applyCinaClawAutonomyDefaults(config);
    const defaults = ((config.agents as Record<string, unknown>).defaults as Record<string, unknown>).model as Record<string, unknown>;
    expect(defaults.primary).toBe('ollama/qwen3-vl:8b-instruct');
  });

  it('never recreates a provider or changes an upgraded installation model choice', () => {
    const explicitModel = { primary: 'custom/private-model', fallbacks: ['custom/backup'] };
    const config: Record<string, unknown> = {
      models: { providers: {} },
      agents: { defaults: { model: explicitModel } },
    };

    applyCinaClawAutonomyDefaults(config);

    expect(config.models).toEqual({ providers: {} });
    expect(defaultsFrom(config).model).toEqual(explicitModel);
  });

  it('does not reinterpret an existing empty models section as a first boot', () => {
    const config: Record<string, unknown> = { models: {} };
    applyCinaClawAutonomyDefaults(config);
    expect(config.models).toEqual({});
    expect(defaultsFrom(config).model).toBeUndefined();
  });

  it('migrates v1.0.2 field names rejected by the OpenClaw 2026.7.1 schema', () => {
    const config: Record<string, unknown> = {
      tools: { codeMode: { enabled: true, maxToolCalls: 12, maxDurationMs: 45_000 } },
      agents: { defaults: { subagents: { allow: ['research'] } } },
    };

    expect(applyCinaClawAutonomyDefaults(config)).toBe(true);
    expect(config).toMatchObject({
      tools: { codeMode: { enabled: true, maxPendingToolCalls: 12, timeoutMs: 45_000 } },
      agents: { defaults: { subagents: { allowAgents: ['research'] } } },
    });
    expect((config.tools as Record<string, Record<string, unknown>>).codeMode).not.toHaveProperty('maxToolCalls');
    expect((config.tools as Record<string, Record<string, unknown>>).codeMode).not.toHaveProperty('maxDurationMs');
    expect(((config.agents as Record<string, Record<string, Record<string, unknown>>>).defaults).subagents).not.toHaveProperty('allow');
  });
});
