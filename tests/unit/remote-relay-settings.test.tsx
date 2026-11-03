import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RemoteRelaySettings } from '@/components/settings/RemoteRelaySettings';

const revokeDevice = vi.fn(async () => ({ ok: true }));

vi.mock('@/lib/host-api', () => ({
  hostApi: {
    remoteRelay: {
      status: async () => ({ relayUrl: 'https://relay.example', enabled: true }),
      listDevices: async () => [
        {
          id: 'device-1',
          name: 'Test Phone',
          status: 'active',
          lastSeenAt: new Date('2026-11-03T00:00:00Z').toISOString(),
        },
      ],
      configure: async () => ({ relayUrl: 'https://relay.example', enabled: true }),
      createPairingCode: async () => ({ code: '123456', expiresAt: '2026-11-03T01:00:00Z' }),
      revokeDevice: (...args: unknown[]) => revokeDevice(...args),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RemoteRelaySettings revoke', () => {
  it('passes the device id as a plain string to the host client', async () => {
    render(<RemoteRelaySettings />);

    await waitFor(() => {
      expect(screen.getByText('Test Phone')).toBeVisible();
    });

    fireEvent.click(screen.getByRole('button', { name: /revoke/i }));

    await waitFor(() => {
      expect(revokeDevice).toHaveBeenCalledWith('device-1');
    });
    // The host client wraps the string into { deviceId } itself; passing
    // an object here was the TS2345 that blocked the web typecheck.
    expect(revokeDevice).not.toHaveBeenCalledWith({ deviceId: 'device-1' });
  });
});
