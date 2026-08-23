/** Shared OpenRouter defaults used by Main, Renderer, and every desktop build. */
export const OPENROUTER_PROVIDER_KEY = 'openrouter';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_REFERER_HEADER = 'https://github.com/johngraven75/Cina-Claw-Pro';
export const OPENROUTER_TITLE_HEADER = 'Cina-Claw Pro';

/** Stable no-cost router retained as an explicit operator-selectable option. */
export const OPENROUTER_FREE_ROUTER_MODEL_ID = 'openrouter/free';

/** Current Cina-Claw Pro default. OpenClaw adds the outer provider prefix. */
export const OPENROUTER_DEFAULT_MODEL_ID = 'stealth/ox-alpha';
export const OPENROUTER_DEFAULT_MODEL_REF =
  `${OPENROUTER_PROVIDER_KEY}/${OPENROUTER_DEFAULT_MODEL_ID}`;
export const OPENROUTER_DEFAULT_MODEL_NAME = 'Ox Alpha';
export const OPENROUTER_DEFAULT_MODEL_DOCS_URL =
  'https://openrouter.ai/stealth/ox-alpha';
export const OPENROUTER_DEFAULT_CONTEXT_WINDOW = 1_048_576;
export const OPENROUTER_DEFAULT_MAX_TOKENS = 131_072;

/** No-cost OpenRouter models that should keep conservative concurrency defaults. */
export const OPENROUTER_NO_COST_MODEL_IDS = [
  OPENROUTER_DEFAULT_MODEL_ID,
  OPENROUTER_FREE_ROUTER_MODEL_ID,
] as const;
