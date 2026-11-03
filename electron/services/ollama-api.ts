/**
 * Main-process Ollama health + model inventory (draft: chat pre-attachment).
 *
 * Renderer must never fetch Ollama directly; it calls hostApi.ollama.health
 * and this service probes the local server from the main process.
 *
 * Scope guard: only loopback base URLs are accepted (127.0.0.1, ::1,
 * localhost). Anything else is rejected without a request, so a crafted
 * renderer payload cannot turn this probe into an SSRF fetch.
 *
 * What this proves — and what it does not:
 *   - status "up" proves GET /api/tags answered on the loopback server.
 *   - models lists the tags the server reported (e.g. "qwen3-vl:8b-instruct").
 *     Chat compares the selected model against this list before claiming
 *     it is pulled; a model absent from the list is shown as "needs pull",
 *     never as ready.
 *   - status "down" proves nothing about why Ollama is down, only that the
 *     probe failed or timed out. Chat shows "start Ollama, then recheck"
 *     and offers a recheck — there is no start/pull action in this draft
 *     because no host route for starting Ollama or pulling a model exists
 *     yet (gap, reported to the parent).
 */
import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import http from 'node:http';
import https from 'node:https';

export type OllamaHealthResult = {
  status: 'up' | 'down';
  baseUrl: string;
  models: string[];
  checkedAt: string;
  error?: string;
};

export const DEFAULT_OLLAMA_HEALTH_BASE_URL = 'http://127.0.0.1:11434';

function normalizeLoopbackBaseUrl(raw: string | undefined): string | null {
  const candidate = (raw || DEFAULT_OLLAMA_HEALTH_BASE_URL).replace(/\/$/, '');
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!['127.0.0.1', '::1', 'localhost'].includes(url.hostname)) return null;
  return `${url.protocol}//${url.host}`;
}

function fetchTags(baseUrl: string, timeoutMs: number): Promise<{ models: string[] }> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(`${baseUrl}/api/tags`);
    } catch (error) {
      reject(error);
      return;
    }
    const request = (url.protocol === 'https:' ? https : http).get(
      url,
      { timeout: timeoutMs },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
              models?: Array<{ name?: unknown }>;
            };
            const models = Array.isArray(parsed.models)
              ? parsed.models
                .map((entry) => (typeof entry.name === 'string' ? entry.name : ''))
                .filter(Boolean)
              : [];
            resolve({ models });
          } catch {
            // Any HTTP answer proves the server is up, even if the body is
            // not the expected tags JSON; report up with an empty list
            // rather than failing the whole probe.
            resolve({ models: [] });
          }
        });
      },
    );
    request.on('timeout', () => {
      request.destroy(new Error('Ollama probe timed out'));
    });
    request.on('error', reject);
  });
}

export function createOllamaApi(): CompleteHostServiceRegistry['ollama'] {
  return {
    async health(payload) {
      const baseUrl = normalizeLoopbackBaseUrl(payload?.baseUrl);
      const checkedAt = new Date().toISOString();
      if (!baseUrl) {
        return {
          status: 'down',
          baseUrl: payload?.baseUrl ?? DEFAULT_OLLAMA_HEALTH_BASE_URL,
          models: [],
          checkedAt,
          error: 'Only loopback Ollama base URLs are allowed',
        };
      }
      try {
        const { models } = await fetchTags(baseUrl, 2000);
        return { status: 'up', baseUrl, models, checkedAt };
      } catch (error) {
        return {
          status: 'down',
          baseUrl,
          models: [],
          checkedAt,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
