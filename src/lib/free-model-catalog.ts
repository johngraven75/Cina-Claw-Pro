import catalog from '@shared/free-models/catalog.json';
import {
  OPENROUTER_DEFAULT_MODEL_ID,
  OPENROUTER_RETIRED_MODEL_ID,
} from '@shared/openrouter';

/** App-wide keyless default (local Ollama) — see catalog-preattach.ts. */
export const CATALOG_DEFAULT_VENDOR_ID = 'ollama' as const;
export const CATALOG_DEFAULT_MODEL_ID = 'qwen3-vl:8b-instruct' as const;
export const CATALOG_DEFAULT_FALLBACK_MODEL_IDS = [
  'qwen3-vl:4b-instruct',
  'qwen3-vl:2b-instruct',
] as const;

/**
 * Ox Alpha (stealth/ox-alpha) RETIRED 2026-11-03 (OpenRouter 404). The
 * featured OpenRouter pick is now its successor, z-ai/glm-5.3-flash
 * (metered, not a free preview). It is NOT one of the 50 Hugging Face
 * catalog models: it has no Hugging Face model ID. Keeping it out of
 * FREE_MODELS preserves the exactly-50 HF catalog count and its tests.
 * OX_ALPHA_PICK is kept as a compatibility alias for the picker component;
 * the component's Ox Alpha label still needs an i18n/label pass (see report).
 */
export const OPENROUTER_SUCCESSOR_PICK = {
  vendorId: 'openrouter',
  modelId: OPENROUTER_DEFAULT_MODEL_ID,
} as const;
/**
 * @deprecated v1.0.7: kept only so older imports keep working. The pick is
 * the GLM successor, not Ox Alpha — new code must use
 * OPENROUTER_SUCCESSOR_PICK, and the UI label/testids no longer say Ox Alpha.
 */
export const OX_ALPHA_PICK = OPENROUTER_SUCCESSOR_PICK;
export const OX_ALPHA_RETIRED_MODEL_ID = OPENROUTER_RETIRED_MODEL_ID;

export type FreeModelTier = 'cloud-instant' | 'one-pull' | 'power-user' | 'not-default';
export type FreeModelRouteType = 'openrouter-free' | 'ollama' | 'hf-local';

export type FreeModelVerification = 'strong' | 'strong-existence-only' | 'snippet-only';

export interface FreeModel {
  rank: number;
  hfId: string;
  displayName: string;
  size: string;
  contextTokens: number | null;
  modalities: string[];
  reasoning: string;
  license: string;
  route: { type: FreeModelRouteType; ref: string };
  setupNeeded: string;
  gated: boolean;
  tier: FreeModelTier;
  uncensored: boolean;
  /** Draft verification level; present on catalog-v2 rows, absent on v1 rows. */
  verification?: FreeModelVerification;
}

interface CatalogFile {
  models: FreeModel[];
}

export const FREE_MODELS: FreeModel[] = (catalog as unknown as CatalogFile).models;

export const FREE_MODEL_TIERS: FreeModelTier[] = ['cloud-instant', 'one-pull', 'power-user', 'not-default'];

/**
 * Only OpenRouter :free and Ollama routes can actually be applied to an
 * existing provider account from this picker. Hugging Face / vLLM / llama.cpp
 * rows are setup-only: the picker shows their exact HF ID and setup note
 * instead of pretending the model is now selected.
 */
export function isSelectableFreeModel(model: FreeModel): boolean {
  return model.route.type === 'openrouter-free' || model.route.type === 'ollama';
}

export function targetVendorId(model: FreeModel): 'openrouter' | 'ollama' | null {
  if (model.route.type === 'openrouter-free') return 'openrouter';
  if (model.route.type === 'ollama') return 'ollama';
  return null;
}

export function targetModelId(model: FreeModel): string {
  return model.route.ref;
}

export function filterFreeModels(
  models: FreeModel[],
  options: { query: string; tier: FreeModelTier | 'all'; showUncensored: boolean },
): FreeModel[] {
  const query = options.query.trim().toLowerCase();
  return models.filter((model) => {
    if (model.uncensored && !options.showUncensored) return false;
    if (options.tier !== 'all' && model.tier !== options.tier) return false;
    if (!query) return true;
    return model.displayName.toLowerCase().includes(query) || model.hfId.toLowerCase().includes(query);
  });
}
