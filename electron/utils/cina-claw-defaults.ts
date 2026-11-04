import {
  applyOpenRouterFreeCompatibility,
  isOpenRouterFreeModelRef,
} from './openrouter-free-compat';
import {
  OPENROUTER_DEFAULT_MODEL_ID,
  OPENROUTER_DEFAULT_MODEL_NAME,
  OPENROUTER_DEFAULT_MODEL_REF,
  OPENROUTER_RETIRED_MODEL_ID,
  OPENROUTER_RETIRED_MODEL_REF,
} from '@shared/openrouter';

type ConfigRecord = Record<string, unknown>;

/**
 * v1.0.7 retired-model migration (CodeAnt MAJOR): existing installs whose
 * saved primary, fallback, agent override, or provider model entry still
 * points at the retired OpenRouter stealth/ox-alpha (404) are migrated to
 * OpenRouter's own successor, z-ai/glm-5.3-flash (same provider, metered),
 * on config load. This runs inside applyCinaClawAutonomyDefaults, which
 * already runs on the config-load/sanitize paths, so no new load path is
 * needed. It never touches any other model choice, never creates a
 * provider, and is idempotent (a migrated config migrates no further).
 */
export function migrateRetiredModelRefs(config: ConfigRecord): boolean {
  let changed = false;
  const migrateRef = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed === OPENROUTER_RETIRED_MODEL_REF || trimmed === OPENROUTER_RETIRED_MODEL_ID) {
      changed = true;
      return trimmed === OPENROUTER_RETIRED_MODEL_ID ? OPENROUTER_DEFAULT_MODEL_ID : OPENROUTER_DEFAULT_MODEL_REF;
    }
    return value;
  };
  const migrateModelConfig = (modelCfg: unknown): void => {
    // record() returns the original object for objects (mutations apply)
    // and a throwaway {} for anything else (no-op, nothing to migrate).
    const cfg = record(modelCfg);
    if (cfg.primary !== undefined) cfg.primary = migrateRef(cfg.primary);
    if (Array.isArray(cfg.fallbacks)) {
      const fallbacks = cfg.fallbacks as unknown[];
      const next = fallbacks.map(migrateRef);
      if (next.some((value, index) => value !== fallbacks[index])) changed = true;
      cfg.fallbacks = next;
    }
  };
  const models = record(config.models);
  const providers = record(models.providers);
  for (const rawProvider of Object.values(providers)) {
    const provider = record(rawProvider);
    if (Array.isArray(provider.models)) {
      for (const entry of provider.models) {
        const modelEntry = record(entry);
        if (typeof modelEntry.id === 'string' && modelEntry.id.trim() === OPENROUTER_RETIRED_MODEL_ID) {
          modelEntry.id = OPENROUTER_DEFAULT_MODEL_ID;
          modelEntry.name = OPENROUTER_DEFAULT_MODEL_NAME;
          changed = true;
        }
      }
    }
  }
  const agents = record(config.agents);
  migrateModelConfig(record(agents.defaults).model);
  const agentMap = record(agents.agents);
  for (const rawAgent of Object.values(agentMap)) {
    migrateModelConfig(record(rawAgent).model);
  }
  return changed;
}

/**
 * App-wide default, changed 2026-11-03 (catalog v2): the previous default,
 * OpenRouter stealth/ox-alpha, is RETIRED (404) and must never be seeded
 * again. The keyless local default is Ollama Qwen3-VL 8B Instruct, with the
 * 4B and 2B Instruct builds as lower-VRAM fallbacks. OpenRouter stays an
 * available provider; its successor pick (z-ai/glm-5.3-flash, metered) lives
 * in shared/openrouter.ts and is NOT this default. No key is invented here:
 * Ollama needs no key, only a running server and one model pull.
 */
export const CINA_DEFAULT_PROVIDER_KEY = 'ollama';
export const CINA_DEFAULT_MODEL_ID = 'qwen3-vl:8b-instruct';
export const CINA_DEFAULT_MODEL_NAME = 'Qwen3-VL 8B Instruct';
export const CINA_DEFAULT_MODEL_REF = 'ollama/qwen3-vl:8b-instruct';
export const CINA_DEFAULT_FALLBACK_MODEL_REFS = [
  'ollama/qwen3-vl:4b-instruct',
  'ollama/qwen3-vl:2b-instruct',
] as const;
export const CINA_DEFAULT_BASE_URL = 'http://localhost:11434/v1';
export const CINA_DEFAULT_CONTEXT_WINDOW = 262144;

function record(value: unknown): ConfigRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ConfigRecord : {};
}

/** Seed safe, bounded autonomous behavior without overwriting operator choices. */
export function applyCinaClawAutonomyDefaults(config: ConfigRecord): boolean {
  let changed = false;
  const tools = record(config.tools);
  if (tools.codeMode === undefined) {
    tools.codeMode = { enabled: true, maxPendingToolCalls: 24, timeoutMs: 300_000 };
    changed = true;
  } else if (tools.codeMode && typeof tools.codeMode === 'object' && !Array.isArray(tools.codeMode)) {
    // Cina-Claw v1.0.2 seeded pre-release names that OpenClaw 2026.7.1
    // rejects under its strict CodeMode schema. Migrate them in place so an
    // affected installation can recover before Gateway validation runs.
    const codeMode = tools.codeMode as ConfigRecord;
    if (codeMode.maxPendingToolCalls === undefined && typeof codeMode.maxToolCalls === 'number') {
      codeMode.maxPendingToolCalls = codeMode.maxToolCalls;
      changed = true;
    }
    if (codeMode.timeoutMs === undefined && typeof codeMode.maxDurationMs === 'number') {
      codeMode.timeoutMs = codeMode.maxDurationMs;
      changed = true;
    }
    if ('maxToolCalls' in codeMode) { delete codeMode.maxToolCalls; changed = true; }
    if ('maxDurationMs' in codeMode) { delete codeMode.maxDurationMs; changed = true; }
    tools.codeMode = codeMode;
  }
  const experimental = record(tools.experimental);
  if (experimental.planTool === undefined) { experimental.planTool = true; changed = true; }
  tools.experimental = experimental;
  const exec = record(tools.exec);
  if (exec.host === undefined) { exec.host = 'gateway'; changed = true; }
  if (exec.security === undefined) { exec.security = 'allowlist'; changed = true; }
  if (exec.ask === undefined) { exec.ask = 'on-miss'; changed = true; }
  tools.exec = exec;
  config.tools = tools;

  const agents = record(config.agents);
  const defaults = record(agents.defaults);

  // A brand-new install should open Chat with a working keyless default
  // already selected: local Ollama Qwen3-VL 8B Instruct, with 4B/2B
  // fallbacks. Ollama needs no key — but it DOES need the server running
  // and one model pull, so this seed is a selection, not a readiness claim:
  // callers must surface the Ollama-down / not-pulled status (see
  // electron/services/ollama-api.ts, exposed as hostApi.ollama.health)
  // instead of pretending chat is ready.
  // Only seed when both sections are genuinely absent: an upgraded
  // installation (including one whose operator removed every provider)
  // must never have a provider or model choice recreated behind their back.
  if (config.models === undefined && defaults.model === undefined) {
    // v1.0.7 (CodeAnt MAJOR): register the fallback models in the
    // provider's models list too, not just in defaults.model.fallbacks —
    // OpenClaw cannot route to a fallback it has never seen registered.
    config.models = {
      providers: {
        [CINA_DEFAULT_PROVIDER_KEY]: {
          baseUrl: CINA_DEFAULT_BASE_URL,
          api: 'openai-completions',
          models: [
            {
              id: CINA_DEFAULT_MODEL_ID,
              name: CINA_DEFAULT_MODEL_NAME,
              input: ['text', 'image', 'video'],
              contextWindow: CINA_DEFAULT_CONTEXT_WINDOW,
            },
            {
              id: 'qwen3-vl:4b-instruct',
              name: 'Qwen3-VL 4B Instruct',
              input: ['text', 'image', 'video'],
              contextWindow: CINA_DEFAULT_CONTEXT_WINDOW,
            },
            {
              id: 'qwen3-vl:2b-instruct',
              name: 'Qwen3-VL 2B Instruct',
              input: ['text', 'image', 'video'],
              contextWindow: CINA_DEFAULT_CONTEXT_WINDOW,
            },
          ],
        },
      },
    };
    defaults.model = { primary: CINA_DEFAULT_MODEL_REF, fallbacks: [...CINA_DEFAULT_FALLBACK_MODEL_REFS] };
    changed = true;
  }
  const usesOpenRouterFree = isOpenRouterFreeModelRef(record(defaults.model).primary);
  if (defaults.maxConcurrent === undefined) {
    defaults.maxConcurrent = usesOpenRouterFree ? 1 : 4;
    changed = true;
  }
  const subagents = record(defaults.subagents);
  if (subagents.allowAgents === undefined) {
    subagents.allowAgents = Array.isArray(subagents.allow) ? subagents.allow : ['*'];
    changed = true;
  }
  // OpenClaw's strict Subagent schema calls this field allowAgents. Remove
  // the obsolete v1.0.2 alias even when a canonical value already exists.
  if ('allow' in subagents) { delete subagents.allow; changed = true; }
  if (subagents.maxConcurrent === undefined) {
    subagents.maxConcurrent = usesOpenRouterFree ? 1 : 4;
    changed = true;
  }
  if (subagents.delegationMode === undefined) { subagents.delegationMode = 'prefer'; changed = true; }
  if (subagents.runTimeoutSeconds === undefined) { subagents.runTimeoutSeconds = 900; changed = true; }
  if (subagents.announceTimeoutMs === undefined) { subagents.announceTimeoutMs = 120_000; changed = true; }
  if (subagents.archiveAfterMinutes === undefined) { subagents.archiveAfterMinutes = 60; changed = true; }
  defaults.subagents = subagents;
  agents.defaults = defaults;
  config.agents = agents;
  if (applyOpenRouterFreeCompatibility(config)) changed = true;
  // Retired-model migration runs on every config load/sanitize pass, so
  // an existing install saved on the dead Ox Alpha default recovers to
  // the successor instead of 404-ing forever. It touches nothing else.
  if (migrateRetiredModelRefs(config)) changed = true;
  return changed;
}
