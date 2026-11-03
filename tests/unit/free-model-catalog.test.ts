import { describe, expect, it } from 'vitest';
import {
  CATALOG_DEFAULT_MODEL_ID,
  FREE_MODELS,
  OPENROUTER_SUCCESSOR_PICK,
  OX_ALPHA_PICK,
  filterFreeModels,
  isSelectableFreeModel,
  targetModelId,
  targetVendorId,
} from '@/lib/free-model-catalog';

describe('free model catalog picker logic (v2: 50 models)', () => {
  it('loads the same 50 models as the catalog data file', () => {
    expect(FREE_MODELS).toHaveLength(50);
    expect(FREE_MODELS.map((model) => model.rank)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );
  });

  it('hides uncensored models by default and shows them only on opt-in', () => {
    expect(filterFreeModels(FREE_MODELS, { query: '', tier: 'all', showUncensored: false })).toHaveLength(30);
    expect(filterFreeModels(FREE_MODELS, { query: '', tier: 'all', showUncensored: true })).toHaveLength(50);
  });

  it('filters by tier and by search text', () => {
    const cloud = filterFreeModels(FREE_MODELS, { query: '', tier: 'cloud-instant', showUncensored: true });
    expect(cloud.length).toBeGreaterThan(0);
    expect(cloud.every((model) => model.tier === 'cloud-instant')).toBe(true);
    const gemma = filterFreeModels(FREE_MODELS, { query: 'gemma', tier: 'all', showUncensored: false });
    expect(gemma.length).toBeGreaterThan(0);
    expect(gemma.every((model) => model.hfId.toLowerCase().includes('gemma'))).toBe(true);
  });

  it('only routes OpenRouter and Ollama models to a provider account', () => {
    for (const model of FREE_MODELS) {
      if (model.route.type === 'hf-local') {
        expect(isSelectableFreeModel(model)).toBe(false);
        expect(targetVendorId(model)).toBeNull();
      } else {
        expect(isSelectableFreeModel(model)).toBe(true);
        expect(targetVendorId(model)).toBe(model.route.type === 'openrouter-free' ? 'openrouter' : 'ollama');
        expect(targetModelId(model)).toBe(model.route.ref);
      }
    }
  });

  it('features the OpenRouter successor separately, without changing the 50-model HF count', () => {
    expect(OPENROUTER_SUCCESSOR_PICK.vendorId).toBe('openrouter');
    expect(OPENROUTER_SUCCESSOR_PICK.modelId).toBe('z-ai/glm-5.3-flash');
    expect(OX_ALPHA_PICK).toBe(OPENROUTER_SUCCESSOR_PICK);
    expect(FREE_MODELS.some((model) => model.route.ref === 'stealth/ox-alpha')).toBe(false);
    expect(FREE_MODELS).toHaveLength(50);
  });

  it('never routes an uncensored model through a shared cloud endpoint', () => {
    const uncensored = FREE_MODELS.filter((candidate) => candidate.uncensored);
    expect(uncensored).toHaveLength(20);
    expect(uncensored.map((model) => model.rank)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 31),
    );
    for (const model of uncensored) {
      expect(model.route.type).not.toBe('openrouter-free');
      expect(model.tier).not.toBe('cloud-instant');
    }
  });

  it('defaults to local Ollama Qwen3-VL 8B Instruct, never an uncensored model', () => {
    const dflt = FREE_MODELS.find((model) => model.route.ref === CATALOG_DEFAULT_MODEL_ID);
    expect(dflt).toBeDefined();
    expect(dflt?.uncensored).toBe(false);
    expect(dflt?.route.type).toBe('ollama');
  });
});
