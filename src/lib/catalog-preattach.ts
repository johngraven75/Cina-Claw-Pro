/**
 * Catalog v2 pre-attachment (draft, pure logic — no store, no host-api).
 *
 * Goal: when the user opens Chat, a model is ALREADY selected — no blank
 * picker, no manual provider selection. This module only COMPUTES the plan
 * and, via applyCatalogPreattachPlan(), drives the existing provider-store
 * path (updateAccount / setDefaultAccount) exactly the way the free-model
 * picker already does for a single row. The coordinator/Chat worker owns
 * calling it once on provider-snapshot load; this file never touches a
 * store itself, so it cannot clobber another worker's store edits.
 *
 * What is pre-done vs what still needs the user/machine:
 * - PRE-DONE by the plan: every catalog model's route is registered on its
 *   provider account (Ollama/OpenRouter rows via updateAccount, Ollama rows
 *   additionally in metadata.customModels; HF/vLLM/llama.cpp rows as
 *   setup-only route metadata so picking one never re-enters an ID).
 * - NOT invented by the plan: no API key (OpenRouter rows stay unusable
 *   until the operator saves a key through the normal secure flow), no
 *   download/pull (a selected local model still needs Ollama running and
 *   one pull — surfaced via defaultStatus, never faked as ready).
 * - NEVER: an uncensored model is the default, or visible before opt-in.
 *   Uncensored rows ARE attached (so opt-in needs no extra provider config
 *   beyond their local pull/download), and their route refs are recorded
 *   in the account's metadata.uncensoredModels flag list, which is what
 *   the Chat picker filters on; name markers are only a fallback for
 *   accounts attached before this flag existed.
 */
import {
  CATALOG_DEFAULT_FALLBACK_MODEL_IDS,
  CATALOG_DEFAULT_MODEL_ID,
  CATALOG_DEFAULT_VENDOR_ID,
  type FreeModel,
} from './free-model-catalog';

export { CATALOG_DEFAULT_FALLBACK_MODEL_IDS, CATALOG_DEFAULT_MODEL_ID, CATALOG_DEFAULT_VENDOR_ID };

export interface PreattachAccountInput {
  id: string;
  vendorId: string;
  enabled: boolean;
  model?: string;
  metadata?: {
    customModels?: string[];
    /**
     * Route refs already flagged uncensored on this account (from an
     * earlier pre-attach run). The plan preserves them, so re-running
     * never drops a flag.
     */
    uncensoredModels?: string[];
  };
}

export type CatalogPreattachDefaultStatus =
  | 'ready-account'
  | 'needs-provider'
  | 'needs-pull-check';

export interface CatalogPreattachAccountUpdate {
  accountId: string;
  vendorId: string;
  /** Patch shaped for the existing updateAccount(accountId, patch) call. */
  patch: {
    model?: string;
    metadata?: { customModels: string[]; uncensoredModels: string[] };
  };
  /** True only for the account that carries the Chat default model. */
  setsDefaultModel: boolean;
}

export interface CatalogPreattachSetupOnly {
  rank: number;
  hfId: string;
  routeRef: string;
  /** Picking this row needs a download/pull first; its ID is pre-registered. */
  needsDownload: true;
}

export interface CatalogPreattachPlan {
  /** Always set for standard models — a no-model state never occurs. */
  defaultVendorId: typeof CATALOG_DEFAULT_VENDOR_ID;
  defaultModelId: typeof CATALOG_DEFAULT_MODEL_ID;
  fallbackModelIds: readonly string[];
  /** Account that should become the default account, if one exists yet. */
  defaultAccountId: string | null;
  defaultStatus: CatalogPreattachDefaultStatus;
  /** One updateAccount call per existing enabled provider account touched. */
  accountUpdates: CatalogPreattachAccountUpdate[];
  /** Catalog rows with no provider account to attach to (yet). */
  missingProviders: string[];
  /** HF/vLLM/llama.cpp rows: route pre-registered, download still required. */
  setupOnly: CatalogPreattachSetupOnly[];
  /** Uncensored rows attached but never default and hidden until opt-in. */
  uncensoredAttached: number;
  uncensoredVisible: boolean;
  /** Total catalog rows covered by this plan (attached + setup-only). */
  coveredModels: number;
}

function uniqueInOrder(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim() !== '')));
}

/**
 * Build the pre-attachment plan for a catalog snapshot.
 * Pure and idempotent: re-running it over already-attached accounts
 * produces the same customModels list (no duplicates, no churn).
 */
export function buildCatalogPreattachPlan(
  models: FreeModel[],
  accounts: PreattachAccountInput[],
  options: { showUncensored: boolean },
): CatalogPreattachPlan {
  const enabledByVendor = new Map<string, PreattachAccountInput>();
  for (const account of accounts) {
    if (account.enabled && !enabledByVendor.has(account.vendorId)) {
      enabledByVendor.set(account.vendorId, account);
    }
  }

  const accountUpdates: CatalogPreattachAccountUpdate[] = [];
  const setupOnly: CatalogPreattachSetupOnly[] = [];
  const missingProviders = new Set<string>();
  let uncensoredAttached = 0;

  const attachable = new Map<string, string[]>();
  // Uncensored route refs per attachable vendor. This is the explicit
  // flag Chat filters on: an uncensored row is hidden until opt-in even
  // when its route ref carries none of the old name markers
  // (abliterated / uncensored / huihui / dolphin). HF-local setup-only
  // rows have no provider account, so they cannot appear in the Chat
  // picker at all; the catalog picker itself already filters them by
  // the catalog row's uncensored boolean.
  const uncensoredByVendor = new Map<string, string[]>();
  for (const model of models) {
    if (model.uncensored) uncensoredAttached += 1;
    if (model.route.type === 'hf-local') {
      setupOnly.push({
        rank: model.rank,
        hfId: model.hfId,
        routeRef: model.route.ref,
        needsDownload: true,
      });
      continue;
    }
    const vendorId = model.route.type === 'openrouter-free' ? 'openrouter' : 'ollama';
    const refs = attachable.get(vendorId) ?? [];
    refs.push(model.route.ref);
    attachable.set(vendorId, refs);
    if (model.uncensored) {
      const flagged = uncensoredByVendor.get(vendorId) ?? [];
      flagged.push(model.route.ref);
      uncensoredByVendor.set(vendorId, flagged);
    }
    if (!enabledByVendor.has(vendorId)) missingProviders.add(vendorId);
  }

  for (const [vendorId, refs] of attachable) {
    const account = enabledByVendor.get(vendorId);
    if (!account) continue;
    const customModels = uniqueInOrder([...refs, ...(account.metadata?.customModels ?? [])]);
    const uncensoredModels = uniqueInOrder([
      ...(uncensoredByVendor.get(vendorId) ?? []),
      ...(account.metadata?.uncensoredModels ?? []),
    ]);
    const isDefaultVendor = vendorId === CATALOG_DEFAULT_VENDOR_ID;
    accountUpdates.push({
      accountId: account.id,
      vendorId,
      patch: {
        ...(isDefaultVendor ? { model: CATALOG_DEFAULT_MODEL_ID } : {}),
        metadata: { customModels, uncensoredModels },
      },
      setsDefaultModel: isDefaultVendor,
    });
  }

  const defaultAccount = enabledByVendor.get(CATALOG_DEFAULT_VENDOR_ID) ?? null;
  return {
    defaultVendorId: CATALOG_DEFAULT_VENDOR_ID,
    defaultModelId: CATALOG_DEFAULT_MODEL_ID,
    fallbackModelIds: CATALOG_DEFAULT_FALLBACK_MODEL_IDS,
    defaultAccountId: defaultAccount?.id ?? null,
    // "ready-account" means the account exists and carries the default;
    // pull status still needs the Ollama tags check — never claim "ready".
    defaultStatus: defaultAccount ? 'needs-pull-check' : 'needs-provider',
    accountUpdates,
    missingProviders: [...missingProviders],
    setupOnly,
    uncensoredAttached,
    uncensoredVisible: options.showUncensored,
    coveredModels: models.length,
  };
}

export interface CatalogPreattachDeps {
  updateAccount: (accountId: string, patch: CatalogPreattachAccountUpdate['patch']) => Promise<void>;
  setDefaultAccount: (accountId: string) => Promise<void>;
}

/**
 * Apply a plan through the existing provider-store path. Rules enforced here:
 * - never sets an uncensored model as an account model;
 * - never creates an account or a key (missing providers stay missing, and
 *   the caller must render the default as "needs Ollama started / one pull"
 *   with a one-click start/pull action, not a blank picker);
 * - setAsDefault gates BOTH the account-model patch and setDefaultAccount:
 *   when false, only metadata (customModels / uncensoredModels) is applied,
 *   so an operator's existing account model is never overwritten by a
 *   pre-attach run that was not asked to set the default (v1.0.7 fix);
 * - setupOnly rows are intentionally not applied: they are HF-local rows
 *   with no provider account to update, and their only meaning is
 *   "download/pull still required" (see plan.setupOnly.needsDownload).
 */
export async function applyCatalogPreattachPlan(
  plan: CatalogPreattachPlan,
  deps: CatalogPreattachDeps,
  options: { setAsDefault: boolean },
): Promise<void> {
  for (const update of plan.accountUpdates) {
    if (update.patch.model && update.patch.model !== plan.defaultModelId) {
      throw new Error('catalog pre-attach refused to set a non-default model');
    }
    const patch = options.setAsDefault
      ? update.patch
      : { metadata: update.patch.metadata };
    await deps.updateAccount(update.accountId, patch);
  }
  if (options.setAsDefault && plan.defaultAccountId) {
    await deps.setDefaultAccount(plan.defaultAccountId);
  }
}
