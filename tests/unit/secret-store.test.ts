import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ data: {} as Record<string, unknown>, encryption: true }));
vi.mock('electron', () => ({ safeStorage: {
  isEncryptionAvailable: () => state.encryption,
  encryptString: (value: string) => Buffer.from(`protected:${value}`, 'utf8'),
  decryptString: (value: Buffer) => value.toString('utf8').replace(/^protected:/, ''),
} }));
vi.mock('../../electron/services/providers/store-instance', () => ({ getClawXProviderStore: async () => ({
  get: (key: string) => state.data[key],
  set: (key: string, value: unknown) => { state.data[key] = value; },
}) }));

import { ElectronStoreSecretStore } from '../../electron/services/secrets/secret-store';

describe('provider secret storage', () => {
  beforeEach(() => { state.data = {}; state.encryption = true; });

  it('encrypts new provider credentials and removes legacy plaintext', async () => {
    const store = new ElectronStoreSecretStore();
    state.data.apiKeys = { google: 'old-key' };
    await store.set({ type: 'api_key', accountId: 'google', apiKey: 'new-key' });
    expect(JSON.stringify(state.data.providerSecrets)).not.toContain('new-key');
    expect(state.data.apiKeys).toEqual({});
    await expect(store.get('google')).resolves.toMatchObject({ apiKey: 'new-key' });
  });

  it('migrates a legacy api key on read', async () => {
    state.data.apiKeys = { openrouter: 'legacy' };
    const store = new ElectronStoreSecretStore();
    await expect(store.get('openrouter')).resolves.toMatchObject({ accountId: 'openrouter', apiKey: 'legacy' });
    expect(JSON.stringify(state.data.providerSecrets)).not.toContain('legacy');
    expect(state.data.apiKeys).toEqual({});
  });

  it('retains a functional fallback when OS encryption is unavailable', async () => {
    state.encryption = false;
    const store = new ElectronStoreSecretStore();
    await store.set({ type: 'api_key', accountId: 'local', apiKey: 'fallback' });
    await expect(store.get('local')).resolves.toMatchObject({ apiKey: 'fallback' });
  });
});
