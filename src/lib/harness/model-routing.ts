/**
 * Cina harness layer — provider/model routing (pure logic).
 *
 * The harness routes a turn to a model through the catalog-v2
 * pre-attachment: agent override > agents default > pre-attached
 * catalog default (Ollama qwen3-vl:8b-instruct, then 4B/2B fallbacks) >
 * first configured option — exactly resolveChatModelRef, plus one
 * guard that function does not have: dead models are refused.
 *
 * Dead-model denylist (verified 2026-11-03, gateway log):
 * - OpenRouter stealth/ox-alpha: testing period ended, OpenRouter 404.
 * - Hugging Face deepseek-ai/DeepSeek-R1: 402 billing / cooldown.
 * A dead ref in the options is dropped before resolution; a dead
 * preferred/default ref falls through to the next candidate instead
 * of being selected. If nothing usable remains, the route resolves to
 * null with a failure reason — never to a dead model, never to a
 * silently substituted model the user did not pick (fallbacks are the
 * published pre-attached lists only).
 */
import {
  PREATTACHED_DEFAULT_MODEL_IDS,
  PREATTACHED_FALLBACK_MODEL_IDS,
  modelIdOfModelRef,
  resolveChatModelRef,
  type ConfiguredModelOption,
} from '@/lib/model-options';
import type { HarnessRoute } from './types';

export const HARNESS_DEAD_MODEL_MATCHERS: readonly string[] = [
  'stealth/ox-alpha',
  'deepseek-r1',
];

export function isDeadModelRef(modelRef: string | null | undefined): boolean {
  const value = (modelRef || '').toLowerCase();
  if (!value) return false;
  return HARNESS_DEAD_MODEL_MATCHERS.some((dead) => value.includes(dead));
}

/**
 * Resolve a harness route. `engineId` is supplied by the caller (the
 * adapter that owns this route); this function only resolves the model
 * and refuses dead ones.
 */
export function resolveHarnessModelRoute(input: {
  engineId: 'openclaw' | 'direct';
  preferredModelRef: string | null | undefined;
  defaultModelRef: string | null | undefined;
  modelOptions: ConfiguredModelOption[];
}): HarnessRoute {
  const liveOptions = (input.modelOptions ?? []).filter(
    (option) => !isDeadModelRef(option.modelRef),
  );
  const resolved = resolveChatModelRef(
    input.preferredModelRef,
    input.defaultModelRef,
    liveOptions,
  );
  if (!resolved) {
    return {
      engineId: input.engineId,
      modelRef: null,
      fromPreattachedDefault: false,
      failureReason: 'No usable model: every configured option is a dead model or no model is configured.',
    };
  }
  const resolvedId = modelIdOfModelRef(resolved).toLowerCase();
  const preattachedIds = [...PREATTACHED_DEFAULT_MODEL_IDS, ...PREATTACHED_FALLBACK_MODEL_IDS]
    .map((id) => id.toLowerCase());
  return {
    engineId: input.engineId,
    modelRef: resolved,
    fromPreattachedDefault: preattachedIds.includes(resolvedId),
    failureReason: null,
  };
}
