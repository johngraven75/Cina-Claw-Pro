import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import type { RemoteRelayClient } from './remote-relay-client';
import { isRecord } from './payload-utils';

export function createRemoteRelayApi(client: RemoteRelayClient): CompleteHostServiceRegistry['remoteRelay'] {
  return {
    status: () => client.getStatus(),
    configure: async (payload) => {
      const body = isRecord(payload) ? payload : {};
      if (typeof body.relayUrl !== 'string' || typeof body.enabled !== 'boolean') throw new Error('Invalid remote relay configuration.');
      return client.configure({ relayUrl: body.relayUrl, enabled: body.enabled });
    },
    createPairingCode: () => client.createPairingCode(),
    listDevices: () => client.listDevices(),
    revokeDevice: async (payload) => {
      const body = isRecord(payload) ? payload : {};
      if (typeof body.deviceId !== 'string') throw new Error('Invalid paired device identifier.');
      await client.revokeDevice(body.deviceId);
      return { success: true };
    },
  };
}
