export const OPENROUTER_FREE_MODEL_ID = 'openrouter/free';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_REFERER_HEADER = 'https://github.com/johngraven75/Cina-Claw-Pro';
export const OPENROUTER_TITLE_HEADER = 'Cina-Claw Pro';

type ConfigRecord = Record<string, unknown>;

function record(value: unknown): ConfigRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as ConfigRecord
    : {};
}

function isOpenRouterProvider(providerKey: string, provider: ConfigRecord): boolean {
  if (providerKey.toLowerCase() === 'openrouter') return true;
  const baseUrl = typeof provider.baseUrl === 'string' ? provider.baseUrl : '';
  return baseUrl.toLowerCase().includes('openrouter.ai');
}

export function isOpenRouterFreeModelRef(modelRef: unknown): boolean {
  return typeof modelRef === 'string'
    && (modelRef === OPENROUTER_FREE_MODEL_ID || modelRef.endsWith(`/${OPENROUTER_FREE_MODEL_ID}`));
}

export function applyOpenRouterFreeCompatibility(config: ConfigRecord): boolean {
  let changed = false;
  const models = record(config.models);
  if (models.providers === undefined) return false;
  const providers = record(models.providers);
  const agents = record(config.agents);
  const defaults = record(agents.defaults);
  const defaultModel = record(defaults.model);
  const primary = defaultModel.primary;
  const hasFreePrimary = isOpenRouterFreeModelRef(primary);

  for (const [providerKey, rawProvider] of Object.entries(providers)) {
    const provider = record(rawProvider);
    if (!isOpenRouterProvider(providerKey, provider)) continue;

    if (provider.baseUrl === undefined) {
      provider.baseUrl = OPENROUTER_BASE_URL;
      changed = true;
    }
    if (provider.api === undefined) {
      provider.api = 'openai-completions';
      changed = true;
    }

    const headers = record(provider.headers);
    if (headers['HTTP-Referer'] === undefined) {
      headers['HTTP-Referer'] = OPENROUTER_REFERER_HEADER;
      changed = true;
    }
    if (headers['X-OpenRouter-Title'] === undefined) {
      headers['X-OpenRouter-Title'] = OPENROUTER_TITLE_HEADER;
      changed = true;
    }
    provider.headers = headers;
    providers[providerKey] = provider;
  }

  if (hasFreePrimary) {
    // Free routing has variable upstream latency and tighter rate limits. Only
    // constrain concurrency when the operator has not chosen a value.
    if (defaults.maxConcurrent === undefined) {
      defaults.maxConcurrent = 1;
      changed = true;
    }
    const subagents = record(defaults.subagents);
    if (subagents.maxConcurrent === undefined) {
      subagents.maxConcurrent = 1;
      changed = true;
    }
    defaults.subagents = subagents;
  }

  models.providers = providers;
  config.models = models;
  agents.defaults = defaults;
  config.agents = agents;
  return changed;
}
