import {
  applyOpenRouterFreeCompatibility,
  isOpenRouterFreeModelRef,
  OPENROUTER_BASE_URL,
  OPENROUTER_FREE_MODEL_ID,
  OPENROUTER_REFERER_HEADER,
  OPENROUTER_TITLE_HEADER,
} from './openrouter-free-compat';

type ConfigRecord = Record<string, unknown>;

export const CINA_DEFAULT_PROVIDER_KEY = 'openrouter';
export const CINA_DEFAULT_MODEL_ID = OPENROUTER_FREE_MODEL_ID;
export const CINA_DEFAULT_MODEL_REF = `${CINA_DEFAULT_PROVIDER_KEY}/${CINA_DEFAULT_MODEL_ID}`;

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

  // A brand-new install should guide the operator to the zero-cost OpenRouter
  // free router. The API key remains environment-backed and must be supplied
  // through the normal secure provider setup flow. Only seed when both
  // sections are genuinely absent: an upgraded installation (including one
  // whose operator removed every provider) must never have a provider or
  // model choice recreated behind their back.
  if (config.models === undefined && defaults.model === undefined) {
    config.models = {
      providers: {
        [CINA_DEFAULT_PROVIDER_KEY]: {
          baseUrl: OPENROUTER_BASE_URL,
          api: 'openai-completions',
          apiKey: 'OPENROUTER_API_KEY',
          headers: {
            'HTTP-Referer': OPENROUTER_REFERER_HEADER,
            'X-OpenRouter-Title': OPENROUTER_TITLE_HEADER,
          },
          models: [{
            id: CINA_DEFAULT_MODEL_ID,
            name: 'OpenRouter Free Router',
            input: ['text', 'image'],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 32_768,
            maxTokens: 8_192,
          }],
        },
      },
    };
    defaults.model = { primary: CINA_DEFAULT_MODEL_REF, fallbacks: [] };
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
  return changed;
}
