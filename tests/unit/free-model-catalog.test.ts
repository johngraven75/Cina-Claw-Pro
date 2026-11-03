import { describe, expect, it } from 'vitest';
import {
  FREE_MODELS,
  OX_ALPHA_PICK,
  filterFreeModels,
  isSelectableFreeModel,
  targetModelId,
  targetVendorId,
} from '@/lib/free-model-catalog';

describe('free model catalog picker logic', () => {
  it('loads the same 30 models as the catalog data file', () => {
    expect(FREE_MODELS).toHaveLength(30);
    expect(FREE_MODELS.map((model) => model.rank)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    );
  });

  it('hides uncensored models by default and shows them only on opt-in', () => {
    expect(filterFreeModels(FREE_MODELS, { query: '', tier: 'all', showUncensored: false })).toHaveLength(20);
    expect(filterFreeModels(FREE_MODELS, { query: '', tier: 'all', showUncensored: true })).toHaveLength(30);
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

  it('features Ox Alpha separately, without changing the 30-model HF count', () => {
    expect(OX_ALPHA_PICK.vendorId).toBe('openrouter');
    expect(OX_ALPHA_PICK.modelId).toBe('stealth/ox-alpha');
    expect(FREE_MODELS.some((model) => model.hfId === OX_ALPHA_PICK.modelId)).toBe(false);
    expect(FREE_MODELS).toHaveLength(30);
  });

  it('never routes an uncensored model through a shared cloud endpoint', () => {
    for (const model of FREE_MODELS.filter((candidate) => candidate.uncensored)) {
      expect(model.route.type).not.toBe('openrouter-free');
      expect(model.tier).not.toBe('cloud-instant');
    }
  });
});
