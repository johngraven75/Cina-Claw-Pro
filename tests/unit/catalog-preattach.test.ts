import { describe, expect, it, vi } from 'vitest';
import { FREE_MODELS } from '@/lib/free-model-catalog';
import {
  applyCatalogPreattachPlan,
  buildCatalogPreattachPlan,
  type PreattachAccountInput,
} from '@/lib/catalog-preattach';

const ollamaAccount: PreattachAccountInput = {
  id: 'ollama',
  vendorId: 'ollama',
  enabled: true,
  model: 'qwen3-vl:8b',
  metadata: { customModels: ['qwen3-vl:8b'] },
};
const openRouterAccount: PreattachAccountInput = {
  id: 'openrouter',
  vendorId: 'openrouter',
  enabled: true,
  model: 'z-ai/glm-5.3-flash',
};

describe('catalog v2 pre-attachment', () => {
  it('sets a working default on first load and covers all 50 models', () => {
    const plan = buildCatalogPreattachPlan(FREE_MODELS, [ollamaAccount, openRouterAccount], { showUncensored: false });
    expect(plan.defaultVendorId).toBe('ollama');
    expect(plan.defaultModelId).toBe('qwen3-vl:8b-instruct');
    expect(plan.fallbackModelIds).toEqual(['qwen3-vl:4b-instruct', 'qwen3-vl:2b-instruct']);
    expect(plan.defaultAccountId).toBe('ollama');
    expect(plan.coveredModels).toBe(50);
    expect(plan.missingProviders).toEqual([]);
    const ollamaUpdate = plan.accountUpdates.find((u) => u.vendorId === 'ollama');
    expect(ollamaUpdate?.patch.model).toBe('qwen3-vl:8b-instruct');
    expect(ollamaUpdate?.patch.metadata?.customModels).toContain('qwen3-vl:8b-instruct');
    expect(ollamaUpdate?.patch.metadata?.customModels).toContain('huihui_ai/qwen3-vl-abliterated:4b-instruct');
    expect(plan.setupOnly.length).toBeGreaterThan(0);
    expect(plan.setupOnly.every((row) => row.needsDownload)).toBe(true);
  });

  it('attaches uncensored models but never defaults to one and hides them until opt-in', () => {
    const plan = buildCatalogPreattachPlan(FREE_MODELS, [ollamaAccount], { showUncensored: false });
    expect(plan.uncensoredAttached).toBe(20);
    expect(plan.uncensoredVisible).toBe(false);
    expect(plan.defaultModelId).not.toContain('abliterated');
    for (const update of plan.accountUpdates) {
      expect(update.patch.model ?? '').not.toContain('abliterated');
    }
    const optedIn = buildCatalogPreattachPlan(FREE_MODELS, [ollamaAccount], { showUncensored: true });
    expect(optedIn.uncensoredVisible).toBe(true);
    expect(optedIn.defaultModelId).toBe('qwen3-vl:8b-instruct');
  });

  it('records uncensored route refs in account metadata for flag-based Chat filtering', () => {
    const plan = buildCatalogPreattachPlan(FREE_MODELS, [ollamaAccount, openRouterAccount], { showUncensored: false });
    const ollamaUpdate = plan.accountUpdates.find((u) => u.vendorId === 'ollama');
    const flagged = ollamaUpdate?.patch.metadata?.uncensoredModels ?? [];
    // Every attachable (Ollama) uncensored row is flagged, including rows
    // whose refs carry markers today — the flag is what protects a future
    // marker-less row.
    const ollamaUncensored = FREE_MODELS.filter((m) => m.uncensored && m.route.type === 'ollama');
    expect(flagged).toHaveLength(ollamaUncensored.length);
    for (const model of ollamaUncensored) {
      expect(flagged).toContain(model.route.ref);
    }
    expect(flagged).not.toContain('qwen3-vl:8b-instruct');
    // Re-running over an already-flagged account preserves flags, no dupes.
    const rerun = buildCatalogPreattachPlan(
      FREE_MODELS,
      [{ ...ollamaAccount, metadata: { customModels: [], uncensoredModels: [...flagged] } }],
      { showUncensored: false },
    );
    const rerunFlagged = rerun.accountUpdates.find((u) => u.vendorId === 'ollama')?.patch.metadata?.uncensoredModels ?? [];
    expect(rerunFlagged).toEqual(flagged);
  });

  it('never produces a no-model state: without any account the default is still selected, just needs-provider', async () => {
    const plan = buildCatalogPreattachPlan(FREE_MODELS, [], { showUncensored: false });
    expect(plan.defaultModelId).toBe('qwen3-vl:8b-instruct');
    expect(plan.defaultAccountId).toBeNull();
    expect(plan.defaultStatus).toBe('needs-provider');
    expect(plan.missingProviders).toContain('ollama');
    expect(plan.accountUpdates).toEqual([]);
    const updateAccount = vi.fn().mockResolvedValue(undefined);
    const setDefaultAccount = vi.fn().mockResolvedValue(undefined);
    await applyCatalogPreattachPlan(plan, { updateAccount, setDefaultAccount }, { setAsDefault: true });
    expect(updateAccount).not.toHaveBeenCalled();
    expect(setDefaultAccount).not.toHaveBeenCalled();
  });

  it('applies through the existing updateAccount path and only sets the default account when asked', async () => {
    const plan = buildCatalogPreattachPlan(FREE_MODELS, [ollamaAccount, openRouterAccount], { showUncensored: false });
    const updateAccount = vi.fn().mockResolvedValue(undefined);
    const setDefaultAccount = vi.fn().mockResolvedValue(undefined);
    await applyCatalogPreattachPlan(plan, { updateAccount, setDefaultAccount }, { setAsDefault: false });
    expect(updateAccount).toHaveBeenCalledTimes(2);
    expect(setDefaultAccount).not.toHaveBeenCalled();
    await applyCatalogPreattachPlan(plan, { updateAccount, setDefaultAccount }, { setAsDefault: true });
    expect(setDefaultAccount).toHaveBeenCalledWith('ollama');
  });
});
