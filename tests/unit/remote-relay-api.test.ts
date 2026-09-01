import { describe, expect, it, vi } from 'vitest';
import { createRemoteRelayApi } from '../../electron/services/remote-relay-api';

describe('createRemoteRelayApi', () => {
  it('passes validated relay configuration to the client', async () => {
    const client = {
      getStatus: vi.fn(),
      configure: vi.fn().mockResolvedValue({ enabled: true, relayUrl: 'https://relay.example.test', polling: false }),
      createPairingCode: vi.fn(),
      listDevices: vi.fn(),
      revokeDevice: vi.fn(),
    };

    const api = createRemoteRelayApi(client as never);
    await expect(api.configure({ relayUrl: 'https://relay.example.test', enabled: true })).resolves.toEqual({
      enabled: true,
      relayUrl: 'https://relay.example.test',
      polling: false,
    });
    expect(client.configure).toHaveBeenCalledWith({ relayUrl: 'https://relay.example.test', enabled: true });
  });

  it('rejects invalid relay configuration payloads', async () => {
    const api = createRemoteRelayApi({
      getStatus: vi.fn(),
      configure: vi.fn(),
      createPairingCode: vi.fn(),
      listDevices: vi.fn(),
      revokeDevice: vi.fn(),
    } as never);

    await expect(api.configure({ relayUrl: 'https://relay.example.test', enabled: 'yes' })).rejects.toThrow(
      'Invalid remote relay configuration.',
    );
  });

  it('passes a validated device identifier to the client', async () => {
    const client = {
      getStatus: vi.fn(),
      configure: vi.fn(),
      createPairingCode: vi.fn(),
      listDevices: vi.fn(),
      revokeDevice: vi.fn().mockResolvedValue(undefined),
    };

    const api = createRemoteRelayApi(client as never);
    await expect(api.revokeDevice({ deviceId: 'device_123' })).resolves.toEqual({ success: true });
    expect(client.revokeDevice).toHaveBeenCalledWith('device_123');
  });

  it('rejects invalid device payloads', async () => {
    const api = createRemoteRelayApi({
      getStatus: vi.fn(),
      configure: vi.fn(),
      createPairingCode: vi.fn(),
      listDevices: vi.fn(),
      revokeDevice: vi.fn(),
    } as never);

    await expect(api.revokeDevice({})).rejects.toThrow('Invalid paired device identifier.');
  });
});
