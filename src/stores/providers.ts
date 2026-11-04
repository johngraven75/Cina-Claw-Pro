/**
 * Provider State Store
 * Manages AI provider configurations
 */
import { create } from 'zustand';
import type {
  ProviderAccount,
  ProviderConfig,
  ProviderVendorInfo,
  ProviderWithKeyInfo,
} from '@/lib/providers';
import { normalizeProviderApiKeyInput } from '@/lib/providers';
import { hostApi } from '@/lib/host-api';
import { fetchProviderSnapshot } from '@/lib/provider-accounts';
import {
  applyCatalogPreattachPlan,
  buildCatalogPreattachPlan,
} from '@/lib/catalog-preattach';
import { FREE_MODELS } from '@/lib/free-model-catalog';

/**
 * v1.0.7 (CodeAnt MAJOR): the catalog-v2 pre-attach planner previously had
 * no production caller — it existed only in unit tests, so pre-attachment
 * worked only through the config seed, not through provider load. Provider
 * load now applies it (once per session, and only when the plan would
 * actually change an account), through the existing host provider-account
 * path. Failures are logged, never thrown: provider load must not fail
 * because pre-attachment did.
 */
let catalogPreattachApplied = false;

function catalogPreattachNeedsApply(
  plan: ReturnType<typeof buildCatalogPreattachPlan>,
  accounts: ProviderAccount[],
  setAsDefault: boolean,
): boolean {
  const byId = new Map(accounts.map((account) => [account.id, account]));
  for (const update of plan.accountUpdates) {
    const account = byId.get(update.accountId);
    if (!account) continue;
    const currentCustom = new Set(account.metadata?.customModels ?? []);
    if ((update.patch.metadata?.customModels ?? []).some((id) => !currentCustom.has(id))) return true;
    const currentUncensored = new Set(account.metadata?.uncensoredModels ?? []);
    if ((update.patch.metadata?.uncensoredModels ?? []).some((id) => !currentUncensored.has(id))) return true;
    if (setAsDefault && update.patch.model && account.model !== update.patch.model) return true;
  }
  return false;
}

// Re-export types for consumers that imported from here
export type {
  ProviderAccount,
  ProviderConfig,
  ProviderVendorInfo,
  ProviderWithKeyInfo,
} from '@/lib/providers';
export type { ProviderSnapshot } from '@/lib/provider-accounts';

interface ProviderState {
  statuses: ProviderWithKeyInfo[];
  accounts: ProviderAccount[];
  vendors: ProviderVendorInfo[];
  defaultAccountId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  refreshProviderSnapshot: () => Promise<void>;
  createAccount: (account: ProviderAccount, apiKey?: string) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  validateAccountApiKey: (
    accountId: string,
    apiKey: string,
    options?: { baseUrl?: string; apiProtocol?: ProviderAccount['apiProtocol']; modelId?: string }
  ) => Promise<{ valid: boolean; error?: string }>;
  getAccountApiKey: (accountId: string) => Promise<string | null>;

  // Legacy compatibility aliases
  fetchProviders: () => Promise<void>;
  addProvider: (config: Omit<ProviderConfig, 'createdAt' | 'updatedAt'>, apiKey?: string) => Promise<void>;
  addAccount: (account: ProviderAccount, apiKey?: string) => Promise<void>;
  updateProvider: (providerId: string, updates: Partial<ProviderConfig>, apiKey?: string) => Promise<void>;
  updateAccount: (accountId: string, updates: Partial<ProviderAccount>, apiKey?: string) => Promise<void>;
  deleteProvider: (providerId: string) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  setApiKey: (providerId: string, apiKey: string) => Promise<void>;
  updateProviderWithKey: (
    providerId: string,
    updates: Partial<ProviderConfig>,
    apiKey?: string
  ) => Promise<void>;
  deleteApiKey: (providerId: string) => Promise<void>;
  setDefaultProvider: (providerId: string) => Promise<void>;
  setDefaultAccount: (accountId: string) => Promise<void>;
  validateApiKey: (
    providerId: string,
    apiKey: string,
    options?: { baseUrl?: string; apiProtocol?: ProviderAccount['apiProtocol'] }
  ) => Promise<{ valid: boolean; error?: string }>;
  getApiKey: (providerId: string) => Promise<string | null>;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  statuses: [],
  accounts: [],
  vendors: [],
  defaultAccountId: null,
  loading: false,
  error: null,

  init: async () => {
    await get().refreshProviderSnapshot();
  },

  refreshProviderSnapshot: async () => {
    set({ loading: true, error: null });

    try {
      const snapshot = await fetchProviderSnapshot();

      set({
        statuses: snapshot.statuses ?? [],
        accounts: snapshot.accounts ?? [],
        vendors: snapshot.vendors ?? [],
        defaultAccountId: snapshot.defaultAccountId ?? null,
        loading: false
      });

      // Catalog v2 pre-attachment on provider load (see flag above).
      // showUncensored is display-time only (chat-mode store); the plan
      // always records the uncensored flags, so passing false here does
      // not drop any flag — it only keeps uncensoredVisible false.
      if (!catalogPreattachApplied && (snapshot.accounts ?? []).length > 0) {
        const accounts = snapshot.accounts ?? [];
        const plan = buildCatalogPreattachPlan(
          FREE_MODELS,
          accounts.map((account) => ({
            id: account.id,
            vendorId: account.vendorId,
            enabled: account.enabled,
            model: account.model,
            metadata: account.metadata,
          })),
          { showUncensored: false },
        );
        const setAsDefault = (snapshot.defaultAccountId ?? null) === null;
        if (catalogPreattachNeedsApply(plan, accounts, setAsDefault)) {
          catalogPreattachApplied = true;
          try {
            await applyCatalogPreattachPlan(
              plan,
              {
                updateAccount: async (accountId, patch) => {
                  const result = await hostApi.providers.updateAccount(accountId, patch);
                  if (!result.success) throw new Error(result.error || 'Failed to update provider account');
                },
                setDefaultAccount: async (accountId) => {
                  const result = await hostApi.providers.setDefaultAccount(accountId);
                  if (!result.success) throw new Error(result.error || 'Failed to set default provider account');
                },
              },
              { setAsDefault },
            );
            await get().refreshProviderSnapshot();
          } catch (error) {
            console.error('Catalog pre-attach on provider load failed (provider load itself succeeded):', error);
          }
        } else {
          catalogPreattachApplied = true;
        }
      }
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  fetchProviders: async () => get().refreshProviderSnapshot(),

  // Legacy ProviderConfig-shaped alias kept for backward compatibility
  // with any stale caller. Internally projects the legacy config payload
  // onto the ProviderAccount surface and delegates to createAccount.
  addProvider: async (config, apiKey) => {
    try {
      const now = new Date().toISOString();
      const account: ProviderAccount = {
        id: config.id,
        vendorId: config.type,
        label: config.name,
        authMode: config.type === 'ollama' ? 'local' : 'api_key',
        baseUrl: config.baseUrl,
        apiProtocol: config.apiProtocol,
        headers: config.headers,
        model: config.model,
        fallbackModels: config.fallbackModels,
        fallbackAccountIds: config.fallbackProviderIds,
        enabled: config.enabled,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      };
      await get().createAccount(account, apiKey);
    } catch (error) {
      console.error('Failed to add provider', error);
      throw error;
    }
  },

  createAccount: async (account, apiKey) => {
    try {
      const result = await hostApi.providers.createAccount({ account, apiKey });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create provider account');
      }

      await get().refreshProviderSnapshot();
    } catch (error) {
      console.error('Failed to add account:', error);
      throw error;
    }
  },

  addAccount: async (account, apiKey) => get().createAccount(account, apiKey),

  // Legacy ProviderConfig-shaped alias. Translates the partial ProviderConfig
  // patch into a ProviderAccount patch and routes through updateAccount.
  updateProvider: async (providerId, updates, apiKey) => {
    try {
      const accountUpdates: Partial<ProviderAccount> = {};
      if (updates.name !== undefined) accountUpdates.label = updates.name;
      if (updates.type !== undefined) accountUpdates.vendorId = updates.type;
      if (updates.baseUrl !== undefined) accountUpdates.baseUrl = updates.baseUrl;
      if (updates.apiProtocol !== undefined) accountUpdates.apiProtocol = updates.apiProtocol;
      if (updates.headers !== undefined) accountUpdates.headers = updates.headers;
      if (updates.model !== undefined) accountUpdates.model = updates.model;
      if (updates.fallbackModels !== undefined) accountUpdates.fallbackModels = updates.fallbackModels;
      if (updates.fallbackProviderIds !== undefined) accountUpdates.fallbackAccountIds = updates.fallbackProviderIds;
      if (updates.enabled !== undefined) accountUpdates.enabled = updates.enabled;
      await get().updateAccount(providerId, accountUpdates, apiKey);
    } catch (error) {
      console.error('Failed to update provider', error);
      throw error;
    }
  },

  updateAccount: async (accountId, updates, apiKey) => {
    try {
      const result = await hostApi.providers.updateAccount(
        accountId,
        updates,
        apiKey,
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update provider account');
      }

      await get().refreshProviderSnapshot();
    } catch (error) {
      console.error('Failed to update account:', error);
      throw error;
    }
  },

  deleteProvider: async (providerId) => get().removeAccount(providerId),

  removeAccount: async (accountId) => {
    try {
      const result = await hostApi.providers.deleteAccount(accountId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete provider account');
      }

      await get().refreshProviderSnapshot();
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  },

  deleteAccount: async (accountId) => get().removeAccount(accountId),

  // Legacy alias kept for in-flight callers; routes the call through
  // updateAccount, which is semantically equivalent to "set API key without
  // other changes".
  setApiKey: async (providerId, apiKey) => get().updateAccount(providerId, {}, apiKey),

  updateProviderWithKey: async (providerId, updates, apiKey) => {
    try {
      const accountUpdates: Partial<ProviderAccount> = {};
      if (updates.name !== undefined) accountUpdates.label = updates.name;
      if (updates.type !== undefined) accountUpdates.vendorId = updates.type;
      if (updates.baseUrl !== undefined) accountUpdates.baseUrl = updates.baseUrl;
      if (updates.apiProtocol !== undefined) accountUpdates.apiProtocol = updates.apiProtocol;
      if (updates.headers !== undefined) accountUpdates.headers = updates.headers;
      if (updates.model !== undefined) accountUpdates.model = updates.model;
      if (updates.fallbackModels !== undefined) accountUpdates.fallbackModels = updates.fallbackModels;
      if (updates.fallbackProviderIds !== undefined) accountUpdates.fallbackAccountIds = updates.fallbackProviderIds;
      if (updates.enabled !== undefined) accountUpdates.enabled = updates.enabled;
      await get().updateAccount(providerId, accountUpdates, apiKey);
    } catch (error) {
      console.error('Failed to update provider with key:', error);
      throw error;
    }
  },

  // Legacy alias that clears only the stored key for an account.
  deleteApiKey: async (providerId) => {
    try {
      const result = await hostApi.providers.deleteAccountApiKey(providerId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete API key');
      }

      await get().refreshProviderSnapshot();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      throw error;
    }
  },

  setDefaultProvider: async (providerId) => get().setDefaultAccount(providerId),

  setDefaultAccount: async (accountId) => {
    try {
      const result = await hostApi.providers.setDefaultAccount(accountId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to set default provider account');
      }

      set({ defaultAccountId: accountId });
    } catch (error) {
      console.error('Failed to set default account:', error);
      throw error;
    }
  },
  
  validateAccountApiKey: async (providerId, apiKey, options) => {
    try {
      const normalizedApiKey = normalizeProviderApiKeyInput(apiKey);
      const result = await hostApi.providers.validateKey({
          accountId: providerId,
          vendorId: providerId,
          providerId,
          apiKey: normalizedApiKey,
          options,
      });
      return result?.valid === true
        ? { valid: true }
        : { valid: false, error: result?.error };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  },

  validateApiKey: async (providerId, apiKey, options) => get().validateAccountApiKey(providerId, apiKey, options),

  getAccountApiKey: async (providerId) => {
    try {
      return await hostApi.providers.getAccountApiKey(providerId);
    } catch {
      return null;
    }
  },

  getApiKey: async (providerId) => get().getAccountApiKey(providerId),
}));
