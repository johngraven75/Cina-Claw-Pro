import { describe, expect, it } from 'vitest';
import { applyCinaClawAutonomyDefaults } from '../../electron/utils/cina-claw-defaults';

describe('Cina-Claw Pro autonomy defaults', () => {
  it('seeds bounded planning, exec, and delegation defaults', () => {
    const config: Record<string, unknown> = {};
    expect(applyCinaClawAutonomyDefaults(config)).toBe(true);
    expect(config).toMatchObject({
      tools: { codeMode: { enabled: true, maxToolCalls: 24 }, experimental: { planTool: true }, exec: { host: 'gateway', security: 'allowlist', ask: 'on-miss' } },
      agents: { defaults: { maxConcurrent: 4, subagents: { allow: ['*'], maxConcurrent: 4, delegationMode: 'prefer', runTimeoutSeconds: 900 } } },
    });
  });

  it('preserves every explicit operator choice', () => {
    const config: Record<string, unknown> = { tools: { codeMode: false, experimental: { planTool: false }, exec: { host: 'node', security: 'full', ask: 'off' } }, agents: { defaults: { maxConcurrent: 1, subagents: { allow: ['research'], delegationMode: 'off' } } } };
    applyCinaClawAutonomyDefaults(config);
    expect(config).toMatchObject({ tools: { codeMode: false, experimental: { planTool: false }, exec: { host: 'node', security: 'full', ask: 'off' } }, agents: { defaults: { maxConcurrent: 1, subagents: { allow: ['research'], delegationMode: 'off' } } } });
  });

  it('is idempotent', () => { const config: Record<string, unknown> = {}; applyCinaClawAutonomyDefaults(config); expect(applyCinaClawAutonomyDefaults(config)).toBe(false); });
});
