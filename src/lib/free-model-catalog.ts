import catalog from '@shared/free-models/catalog.json';
import { OPENROUTER_DEFAULT_MODEL_ID } from '@shared/openrouter';

/**
 * Ox Alpha is featured at the top of the picker, but it is NOT one of the
 * 30 Hugging Face models: it is an OpenRouter stealth-preview model with no
 * Hugging Face model ID, and its availability may change. Keeping it out of
 * FREE_MODELS preserves the exactly-30 HF catalog count and its tests.
 */
export const OX_ALPHA_PICK = {
  vendorId: 'openrouter',
  modelId: OPENROUTER_DEFAULT_MODEL_ID,
} as const;

export type FreeModelTier = 'cloud-instant' | 'one-pull' | 'power-user' | 'not-default';
export type FreeModelRouteType = 'openrouter-free' | 'ollama' | 'hf-local';

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
