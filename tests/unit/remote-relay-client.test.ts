import { describe, expect, it } from 'vitest';
import { buildRemoteSessionKey, extractGatewayRunId } from '../../electron/services/remote-relay-client';

describe('remote relay desktop dispatch helpers', () => {
  it('scopes remote prompts to a stable gateway-owned session key', () => {
    expect(buildRemoteSessionKey('reason', 'gateway_abc')).toBe('agent:reason:remote:gateway_abc');
    expect(buildRemoteSessionKey('../unsafe', 'gateway_abc')).toBe('agent:main:remote:gateway_abc');
  });

  it('exposes only a bounded run identifier from the desktop gateway response', () => {
    expect(extractGatewayRunId({ runId: 'run_123' })).toBe('run_123');
    expect(extractGatewayRunId({ id: 'run_456' })).toBe('run_456');
    expect(extractGatewayRunId({ error: 'provider key should never leave the desktop' })).toBeUndefined();
  });
});
