/** Shared OpenRouter defaults used by Main, Renderer, and every desktop build. */
export const OPENROUTER_PROVIDER_KEY = 'openrouter';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_REFERER_HEADER = 'https://github.com/johngraven75/Cina-Claw-Pro';
export const OPENROUTER_TITLE_HEADER = 'Cina-Claw Pro';

/** Stable no-cost router retained as an explicit operator-selectable option. */
export const OPENROUTER_FREE_ROUTER_MODEL_ID = 'openrouter/free';

/**
 * RETIRED 2026-11-03: OpenRouter stealth/ox-alpha returned 404 — its testing
 * period ended. It must never be a default again. Kept as a named constant
 * only so old configs/tests can recognise (and migrate away from) it.
 */
export const OPENROUTER_RETIRED_MODEL_ID = 'stealth/ox-alpha';
export const OPENROUTER_RETIRED_MODEL_REF =
  `${OPENROUTER_PROVIDER_KEY}/${OPENROUTER_RETIRED_MODEL_ID}`;

/**
 * OpenRouter successor pick (metered, NOT a free preview): OpenRouter itself
 * points former Ox Alpha users at z-ai/glm-5.3-flash. This is the OpenRouter
 * provider's own default/placeholder only — it is NOT the app-wide keyless
 * default. That default is the local Ollama model in
 * electron/utils/cina-claw-defaults.ts (Qwen3-VL 8B Instruct).
 */
export const OPENROUTER_SUCCESSOR_MODEL_ID = 'z-ai/glm-5.3-flash';
export const OPENROUTER_SUCCESSOR_MODEL_NAME = 'GLM 5.3 Flash (OpenRouter, metered)';
export const OPENROUTER_SUCCESSOR_MODEL_DOCS_URL =
  'https://openrouter.ai/z-ai/glm-5.3-flash';

/** Current OpenRouter provider default = the successor, not the retired pick. */
export const OPENROUTER_DEFAULT_MODEL_ID = OPENROUTER_SUCCESSOR_MODEL_ID;
export const OPENROUTER_DEFAULT_MODEL_REF =
  `${OPENROUTER_PROVIDER_KEY}/${OPENROUTER_DEFAULT_MODEL_ID}`;
export const OPENROUTER_DEFAULT_MODEL_NAME = OPENROUTER_SUCCESSOR_MODEL_NAME;
export const OPENROUTER_DEFAULT_MODEL_DOCS_URL = OPENROUTER_SUCCESSOR_MODEL_DOCS_URL;
export const OPENROUTER_DEFAULT_CONTEXT_WINDOW = 1_048_576;
export const OPENROUTER_DEFAULT_MAX_TOKENS = 131_072;

/**
 * No-cost OpenRouter models that should keep conservative concurrency defaults.
 * The retired Ox Alpha ID stays here ONLY as a legacy guard for existing
 * configs that still name it — it is not a default, a pick, or a working model.
 */
export const OPENROUTER_NO_COST_MODEL_IDS = [
  OPENROUTER_RETIRED_MODEL_ID,
  OPENROUTER_FREE_ROUTER_MODEL_ID,
] as const;
