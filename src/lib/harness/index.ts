/**
 * Cina harness layer — engine registry (barrel).
 *
 * UI, switches, and catalog code import engines ONLY through here.
 * Adding a future engine means: implement EngineAdapter, add it to
 * HARNESS_ENGINES, and nothing else changes. Removing OpenClaw is
 * explicitly out of scope for this draft — it is the default and the
 * only available engine.
 */
import { directAdapter } from './direct-adapter';
import { openclawAdapter } from './openclaw-adapter';
import type { EngineAdapter, HarnessEngineId } from './types';

export const HARNESS_ENGINES: readonly EngineAdapter[] = [
  openclawAdapter,
  directAdapter,
];

export const HARNESS_DEFAULT_ENGINE_ID: HarnessEngineId = 'openclaw';

export function getEngineAdapter(engineId: HarnessEngineId): EngineAdapter {
  return HARNESS_ENGINES.find((adapter) => adapter.id === engineId) ?? openclawAdapter;
}

/**
 * Effective engine: the requested engine when it is available, else
 * OpenClaw. This is a visible fallback rule, not a silent substitution:
 * the store records both the requested and the effective engine, and
 * the UI shows the stub note whenever they differ.
 */
export function resolveEffectiveEngine(requestedId: HarnessEngineId): HarnessEngineId {
  const adapter = getEngineAdapter(requestedId);
  return adapter.available ? requestedId : HARNESS_DEFAULT_ENGINE_ID;
}

export { directAdapter, openclawAdapter };
export * from './types';
export * from './tool-routing';
export * from './model-routing';
