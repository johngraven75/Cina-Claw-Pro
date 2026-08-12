import { describe, expect, it } from 'vitest';
import { applyCinaClawAutonomyDefaults } from '../../electron/utils/cina-claw-defaults';

describe('Cina-Claw Pro autonomy defaults', () => {
  it('seeds bounded planning, exec, and delegation defaults', () => {
    const config: Record<string, unknown> = {};
    expect(applyCinaClawAutonomyDefaults(config)).toBe(true);
    expect(config).toMatchObject({
      tools: { codeMode: { enabled: true, maxPendingToolCalls: 24, timeoutMs: 300_000 }, experimental: { planTool: true }, exec: { host: 'gateway', security: 'allowlist', ask: 'on-miss' } },
      agents: { defaults: { maxConcurrent: 4, subagents: { allowAgents: ['*'], maxConcurrent: 4, delegationMode: 'prefer', runTimeoutSeconds: 900 } } },
    });
  });

  it('preserves every valid explicit operator choice', () => {
    const config: Record<string, unknown> = { tools: { codeMode: false, experimental: { planTool: false }, exec: { host: 'node', security: 'full', ask: 'off' } }, agents: { defaults: { maxConcurrent: 1, subagents: { allowAgents: ['research'], delegationMode: 'suggest' } } } };
    applyCinaClawAutonomyDefaults(config);
    expect(config).toMatchObject({ tools: { codeMode: false, experimental: { planTool: false }, exec: { host: 'node', security: 'full', ask: 'off' } }, agents: { defaults: { maxConcurrent: 1, subagents: { allowAgents: ['research'], delegationMode: 'suggest' } } } });
  });

  it('is idempotent', () => { const config: Record<string, unknown> = {}; applyCinaClawAutonomyDefaults(config); expect(applyCinaClawAutonomyDefaults(config)).toBe(false); });

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
