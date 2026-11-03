import type { ProviderAccount, ProviderVendorInfo, ProviderWithKeyInfo } from '@/lib/providers';

export interface ConfiguredModelOption {
  modelRef: string;
  label: string;
  runtimeProviderKey: string;
  accountId: string;
  /**
   * True when this option's model is flagged uncensored in its account's
   * metadata.uncensoredModels (catalog v2 pre-attachment). Chat hides
   * flagged options until the session uncensored opt-in is on; name
   * markers remain only as a fallback for accounts attached before the
   * flag existed.
   */
  uncensored: boolean;
}

export interface RuntimeProviderOption {
  runtimeProviderKey: string;
  accountId: string;
  label: string;
  modelIdPlaceholder?: string;
  configuredModelId?: string;
}

export function resolveRuntimeProviderKey(account: ProviderAccount): string {
  if (account.authMode === 'oauth_browser') {
    if (account.vendorId === 'openai') return 'openai';
  }

  if (account.vendorId === 'custom' || account.vendorId === 'ollama') {
    const prefix = `${account.vendorId}-`;
    if (account.id.startsWith(prefix)) {
      const tail = account.id.slice(prefix.length);
      if (tail.length === 8 && !tail.includes('-')) {
        return account.id;
      }
    }

    const suffix = account.id.replace(/-/g, '').slice(0, 8);
    return `${account.vendorId}-${suffix}`;
  }

  if (account.vendorId === 'minimax-portal-cn') {
    return 'minimax-portal';
  }

  return account.vendorId;
}

export function splitModelRef(modelRef: string | null | undefined): { providerKey: string; modelId: string } | null {
  const value = (modelRef || '').trim();
  if (!value) return null;
  const separatorIndex = value.indexOf('/');
  if (separatorIndex <= 0 || separatorIndex >= value.length - 1) return null;
  return {
    providerKey: value.slice(0, separatorIndex),
    modelId: value.slice(separatorIndex + 1),
  };
}

export function normalizeModelIdForRuntimeProvider(
  modelId: string | null | undefined,
  runtimeProviderKey: string,
): string {
  const value = (modelId || '').trim();
  const prefix = `${runtimeProviderKey}/`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function formatModelRefLabel(modelRef: string | null | undefined): string {
  const parsed = splitModelRef(modelRef);
  return parsed?.modelId || (modelRef || '').trim() || 'Model';
}

export function formatProviderDisplayName(
  account: ProviderAccount,
  vendorMap: Map<string, ProviderVendorInfo>,
): string {
  if (account.vendorId === 'custom' || account.vendorId === 'ollama') {
    return account.label.trim() || account.vendorId;
  }

  const vendor = vendorMap.get(account.vendorId);
  return vendor?.name || account.label.trim() || account.vendorId;
}

export function formatConfiguredModelLabel(
  modelId: string,
  account: ProviderAccount,
  vendorMap: Map<string, ProviderVendorInfo>,
): string {
  const providerName = formatProviderDisplayName(account, vendorMap);
  return `${modelId} (${providerName})`;
}

export function toModelOptionTestId(label: string): string {
  return label.replace(/[^a-zA-Z0-9_-]+/g, '-');
}

export function hasConfiguredProviderCredentials(
  account: ProviderAccount,
  statusById: Map<string, ProviderWithKeyInfo>,
): boolean {
  if (account.authMode === 'oauth_device' || account.authMode === 'oauth_browser' || account.authMode === 'local') {
    return true;
  }
  return statusById.get(account.id)?.hasKey ?? false;
}

export function buildRuntimeProviderOptions(
  providerAccounts: ProviderAccount[],
  providerStatuses: ProviderWithKeyInfo[],
  providerVendors: ProviderVendorInfo[],
  providerDefaultAccountId: string | null,
): RuntimeProviderOption[] {
  const safeAccounts = Array.isArray(providerAccounts) ? providerAccounts : [];
  const safeStatuses = Array.isArray(providerStatuses) ? providerStatuses : [];
  const safeVendors = Array.isArray(providerVendors) ? providerVendors : [];
  const vendorMap = new Map<string, ProviderVendorInfo>(safeVendors.map((vendor) => [vendor.id, vendor]));
  const statusById = new Map<string, ProviderWithKeyInfo>(safeStatuses.map((status) => [status.id, status]));
  const entries = safeAccounts
    .filter((account) => account.enabled && hasConfiguredProviderCredentials(account, statusById))
    .sort((left, right) => {
      if (left.id === providerDefaultAccountId) return -1;
      if (right.id === providerDefaultAccountId) return 1;
      return right.updatedAt.localeCompare(left.updatedAt);
    });

  const deduped = new Map<string, RuntimeProviderOption>();
  for (const account of entries) {
    const runtimeProviderKey = resolveRuntimeProviderKey(account);
    if (!runtimeProviderKey || deduped.has(runtimeProviderKey)) continue;
    const vendor = vendorMap.get(account.vendorId);
    const label = `${account.label} (${vendor?.name || account.vendorId})`;
    const configuredModelId = account.model
      ? (account.model.startsWith(`${runtimeProviderKey}/`)
        ? account.model.slice(runtimeProviderKey.length + 1)
        : account.model)
      : undefined;

    deduped.set(runtimeProviderKey, {
      runtimeProviderKey,
      accountId: account.id,
      label,
      modelIdPlaceholder: vendor?.modelIdPlaceholder,
      configuredModelId,
    });
  }

  return [...deduped.values()];
}

export function buildConfiguredModelOptions(
  providerAccounts: ProviderAccount[],
  providerStatuses: ProviderWithKeyInfo[],
  providerVendors: ProviderVendorInfo[],
  providerDefaultAccountId: string | null,
): ConfiguredModelOption[] {
  const safeAccounts = Array.isArray(providerAccounts) ? providerAccounts : [];
  const safeStatuses = Array.isArray(providerStatuses) ? providerStatuses : [];
  const safeVendors = Array.isArray(providerVendors) ? providerVendors : [];
  const vendorMap = new Map<string, ProviderVendorInfo>(safeVendors.map((vendor) => [vendor.id, vendor]));
  const statusById = new Map<string, ProviderWithKeyInfo>(safeStatuses.map((status) => [status.id, status]));
  const entries = safeAccounts
    .filter((account) => {
      const hasModel = Boolean(account.model?.trim())
        || Boolean(account.metadata?.customModels?.some((modelId) => modelId.trim()));
      return account.enabled && hasModel && hasConfiguredProviderCredentials(account, statusById);
    })
    .sort((left, right) => {
      if (left.id === providerDefaultAccountId) return -1;
      if (right.id === providerDefaultAccountId) return 1;
      return right.updatedAt.localeCompare(left.updatedAt);
    });

  const deduped = new Map<string, ConfiguredModelOption>();
  for (const account of entries) {
    const runtimeProviderKey = resolveRuntimeProviderKey(account);
    const uncensoredModelIds = new Set(
      (account.metadata?.uncensoredModels ?? [])
        .map((modelId) => normalizeModelIdForRuntimeProvider(modelId, runtimeProviderKey))
        .filter(Boolean),
    );
    const modelIds = (() => {
      const selectedModelId = normalizeModelIdForRuntimeProvider(account.model, runtimeProviderKey);
      const supportsMultipleModels = account.vendorId === 'custom' || account.vendorId === 'ollama';
      if (!supportsMultipleModels && selectedModelId) {
        return [selectedModelId];
      }
      const configured = (account.metadata?.customModels ?? [])
        .map((modelId) => normalizeModelIdForRuntimeProvider(modelId, runtimeProviderKey))
        .filter(Boolean);
      if (configured.length > 0) return configured;
      return selectedModelId ? [selectedModelId] : [];
    })();
    for (const modelId of modelIds) {
      const modelRef = `${runtimeProviderKey}/${modelId}`;
      if (deduped.has(modelRef)) continue;
      deduped.set(modelRef, {
        modelRef,
        label: formatConfiguredModelLabel(modelId, account, vendorMap),
        runtimeProviderKey,
        accountId: account.id,
        uncensored: uncensoredModelIds.has(modelId),
      });
    }
  }

  return [...deduped.values()];
}

export function isConfiguredModelRefAvailable(
  modelRef: string | null | undefined,
  modelOptions: ConfiguredModelOption[],
): boolean {
  const value = (modelRef || '').trim();
  if (!value) return false;
  return modelOptions.some((option) => option.modelRef === value);
}

/**
 * Pre-attached catalog default (draft: catalog v2 pre-attachment).
 *
 * Chat must open with a model already selected, not a blank picker. The
 * catalog worker pre-registers all catalog models to their providers;
 * Chat's part is to prefer that pre-attached default when the agent has
 * no explicit model and no agents-level default applies. Matching is by
 * model id (the part after the provider key), so it survives the runtime
 * provider-key suffix that Ollama/custom accounts get
 * (e.g. `ollama-<hash>/qwen3-vl:8b-instruct`).
 *
 * Order: exact default id first, then lower-VRAM fallbacks in order.
 * Uncensored models are never in these lists and are never returned here.
 */
export const PREATTACHED_DEFAULT_MODEL_IDS = ['qwen3-vl:8b-instruct', 'qwen3-vl:8b'];

export const PREATTACHED_FALLBACK_MODEL_IDS = [
  'qwen3-vl:4b-instruct',
  'qwen3-vl:4b',
  'qwen3-vl:2b-instruct',
  'qwen3-vl:2b',
];

export function modelIdOfModelRef(modelRef: string | null | undefined): string {
  return splitModelRef(modelRef)?.modelId ?? (modelRef || '').trim();
}

export function resolvePreattachedDefaultModelRef(
  modelOptions: ConfiguredModelOption[],
): string | null {
  for (const wantedId of [...PREATTACHED_DEFAULT_MODEL_IDS, ...PREATTACHED_FALLBACK_MODEL_IDS]) {
    const match = modelOptions.find(
      (option) => modelIdOfModelRef(option.modelRef).toLowerCase() === wantedId.toLowerCase(),
    );
    if (match) return match.modelRef;
  }
  return null;
}

/**
 * Chat model resolution with the pre-attached default slotted in:
 * agent override > agents default > pre-attached catalog default > first
 * configured option. This replaces the old "first option wins" fallback
 * for Chat only; resolveConfiguredModelRef is unchanged for other callers.
 */
export function resolveChatModelRef(
  preferredModelRef: string | null | undefined,
  defaultModelRef: string | null | undefined,
  modelOptions: ConfiguredModelOption[],
): string | null {
  const preferred = (preferredModelRef || '').trim();
  if (preferred && isConfiguredModelRefAvailable(preferred, modelOptions)) return preferred;
  const fallbackDefault = (defaultModelRef || '').trim();
  if (fallbackDefault && isConfiguredModelRefAvailable(fallbackDefault, modelOptions)) return fallbackDefault;
  return resolvePreattachedDefaultModelRef(modelOptions) ?? modelOptions[0]?.modelRef ?? null;
}

export function resolveConfiguredModelRef(
  preferredModelRef: string | null | undefined,
  defaultModelRef: string | null | undefined,
  modelOptions: ConfiguredModelOption[],
): string | null {
  const preferred = (preferredModelRef || '').trim();
  if (preferred && isConfiguredModelRefAvailable(preferred, modelOptions)) {
    return preferred;
  }

  const fallbackDefault = (defaultModelRef || '').trim();
  if (fallbackDefault && isConfiguredModelRefAvailable(fallbackDefault, modelOptions)) {
    return fallbackDefault;
  }

  return modelOptions[0]?.modelRef ?? null;
}
