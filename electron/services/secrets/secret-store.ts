import { safeStorage } from 'electron';
import type { ProviderSecret } from '../../shared/providers/types';
import { getClawXProviderStore } from '../providers/store-instance';

type EncryptedSecretEnvelope = { format: 'electron-safe-storage-v1'; ciphertext: string };
type StoredSecret = ProviderSecret | EncryptedSecretEnvelope;

export interface SecretStore {
  get(accountId: string): Promise<ProviderSecret | null>;
  set(secret: ProviderSecret): Promise<void>;
  delete(accountId: string): Promise<void>;
}

function isEncrypted(value: StoredSecret | undefined): value is EncryptedSecretEnvelope {
  return !!value && 'format' in value && value.format === 'electron-safe-storage-v1' && typeof value.ciphertext === 'string';
}

function protect(secret: ProviderSecret): StoredSecret {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('[secrets] OS encryption is unavailable; using local store fallback');
    return secret;
  }
  return { format: 'electron-safe-storage-v1', ciphertext: safeStorage.encryptString(JSON.stringify(secret)).toString('base64') };
}

function unprotect(value: StoredSecret): ProviderSecret | null {
  if (!isEncrypted(value)) return value;
  try {
    return JSON.parse(safeStorage.decryptString(Buffer.from(value.ciphertext, 'base64'))) as ProviderSecret;
  } catch (error) {
    console.error('[secrets] Failed to decrypt provider credential', error);
    return null;
  }
}

export class ElectronStoreSecretStore implements SecretStore {
  async get(accountId: string): Promise<ProviderSecret | null> {
    const store = await getClawXProviderStore();
    const secrets = (store.get('providerSecrets') ?? {}) as Record<string, StoredSecret>;
    const stored = secrets[accountId];
    if (stored) {
      const secret = unprotect(stored);
      if (secret && !isEncrypted(stored) && safeStorage.isEncryptionAvailable()) await this.set(secret);
      return secret;
    }
    const apiKeys = (store.get('apiKeys') ?? {}) as Record<string, string>;
    const apiKey = apiKeys[accountId];
    if (!apiKey) return null;
    const migrated: ProviderSecret = { type: 'api_key', accountId, apiKey };
    await this.set(migrated);
    return migrated;
  }

  async set(secret: ProviderSecret): Promise<void> {
    const store = await getClawXProviderStore();
    const secrets = (store.get('providerSecrets') ?? {}) as Record<string, StoredSecret>;
    secrets[secret.accountId] = protect(secret);
    store.set('providerSecrets', secrets);
    const apiKeys = (store.get('apiKeys') ?? {}) as Record<string, string>;
    delete apiKeys[secret.accountId];
    store.set('apiKeys', apiKeys);
  }

  async delete(accountId: string): Promise<void> {
    const store = await getClawXProviderStore();
    const secrets = (store.get('providerSecrets') ?? {}) as Record<string, StoredSecret>;
    delete secrets[accountId];
    store.set('providerSecrets', secrets);
    const apiKeys = (store.get('apiKeys') ?? {}) as Record<string, string>;
    delete apiKeys[accountId];
    store.set('apiKeys', apiKeys);
  }
}

const secretStore = new ElectronStoreSecretStore();
export function getSecretStore(): SecretStore { return secretStore; }
export async function getProviderSecret(accountId: string): Promise<ProviderSecret | null> { return getSecretStore().get(accountId); }
export async function setProviderSecret(secret: ProviderSecret): Promise<void> { await getSecretStore().set(secret); }
export async function deleteProviderSecret(accountId: string): Promise<void> { await getSecretStore().delete(accountId); }
