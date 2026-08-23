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

function isRelayConfigurationPayload(value: unknown): value is RelayConfigurationPayload {
  return isRecord(value) && typeof value.relayUrl === 'string' && typeof value.enabled === 'boolean';
}

function isDeviceConfigurationPayload(value: unknown): value is DeviceConfigurationPayload {
  return isRecord(value) && typeof value.deviceId === 'string';
}

export function createRemoteRelayApi(client: RemoteRelayClient): CompleteHostServiceRegistry['remoteRelay'] {
  return {
    status: () => client.getStatus(),
    configure: async (payload) => {
      if (!isRelayConfigurationPayload(payload)) throw new Error('Invalid remote relay configuration.');
      return client.configure({ relayUrl: payload.relayUrl, enabled: payload.enabled });
    },
    createPairingCode: () => client.createPairingCode(),
    listDevices: () => client.listDevices(),
    revokeDevice: async (payload) => {
      if (!isDeviceConfigurationPayload(payload)) throw new Error('Invalid paired device identifier.');
      await client.revokeDevice(payload.deviceId);
      return { success: true };
    },
  };
}
