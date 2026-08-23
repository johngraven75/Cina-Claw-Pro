import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import type { RemoteRelayClient } from './remote-relay-client';
import { isRecord } from './payload-utils';

interface RelayConfigurationPayload {
  relayUrl: string;
  enabled: boolean;
}

interface DeviceConfigurationPayload {
  deviceId: string;
}

export function createRemoteRelayApi(client: RemoteRelayClient): CompleteHostServiceRegistry['remoteRelay'] {
  return {
    status: () => client.getStatus(),
    configure: async (payload) => {
      const body: Partial<RelayConfigurationPayload> = isRecord(payload) ? payload as Partial<RelayConfigurationPayload> : {};
      if (typeof body.relayUrl !== 'string' || typeof body.enabled !== 'boolean') throw new Error('Invalid remote relay configuration.');
      return client.configure({ relayUrl: body.relayUrl, enabled: body.enabled });
    },
    createPairingCode: () => client.createPairingCode(),
    listDevices: () => client.listDevices(),
    revokeDevice: async (payload) => {
      const body: Partial<DeviceConfigurationPayload> = isRecord(payload) ? payload as Partial<DeviceConfigurationPayload> : {};
      if (typeof body.deviceId !== 'string') throw new Error('Invalid paired device identifier.');
      await client.revokeDevice(body.deviceId);
      return { success: true };
    },
  };
}
