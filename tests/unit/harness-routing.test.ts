import { describe, expect, it } from 'vitest';
import { DEFAULT_CHAT_MODE } from '../../src/stores/chat-mode';
import {
  isDeadModelRef,
  resolveHarnessModelRoute,
} from '../../src/lib/harness/model-routing';
import { toolRoutingForMode } from '../../src/lib/harness/tool-routing';
import type { ConfiguredModelOption } from '../../src/lib/model-options';

function option(modelRef: string): ConfiguredModelOption {
  const [runtimeProviderKey] = modelRef.split('/');
  return {
    modelRef,
    label: modelRef,
    runtimeProviderKey,
    accountId: 'test-account',
    uncensored: false,
  };
}

const LIVE_OPTIONS = [
  option('ollama-abc12345/qwen3-vl:8b-instruct'),
  option('ollama-abc12345/qwen3-vl:4b-instruct'),
];

describe('harness model routing', () => {
  it('resolves the pre-attached Ollama default, never a dead model', () => {
    const route = resolveHarnessModelRoute({
      engineId: 'openclaw',
      preferredModelRef: 'openrouter/stealth/ox-alpha',
      defaultModelRef: null,
      modelOptions: [option('openrouter/stealth/ox-alpha'), ...LIVE_OPTIONS],
    });
    expect(route.modelRef).toBe('ollama-abc12345/qwen3-vl:8b-instruct');
    expect(route.fromPreattachedDefault).toBe(true);
    expect(route.failureReason).toBeNull();
  });

  it('refuses DeepSeek-R1 refs case-insensitively', () => {
    expect(isDeadModelRef('openrouter/deepseek-ai/DeepSeek-R1')).toBe(true);
    expect(isDeadModelRef('stealth/ox-alpha')).toBe(true);
    expect(isDeadModelRef('ollama/qwen3-vl:8b-instruct')).toBe(false);
  });

  it('resolves to null with a reason when every option is dead', () => {
    const route = resolveHarnessModelRoute({
      engineId: 'openclaw',
      preferredModelRef: null,
      defaultModelRef: null,
      modelOptions: [option('openrouter/stealth/ox-alpha')],
    });
    expect(route.modelRef).toBeNull();
    expect(route.failureReason).toBeTruthy();
  });
});

describe('harness tool routing', () => {
  it('reports web search as denied-globally when the switch is on', () => {
    const routing = toolRoutingForMode({ ...DEFAULT_CHAT_MODE, webSearch: true, deepResearch: true });
    expect(routing.webSearch.status).toBe('denied-globally');
    expect(routing.deepResearch.status).toBe('denied-globally');
    expect(routing.webSearch.status).not.toBe('allowed');
  });

  it('reports web search as denied-by-switch when the switch is off', () => {
    const routing = toolRoutingForMode(DEFAULT_CHAT_MODE);
    expect(routing.webSearch.status).toBe('denied-by-switch');
  });

  it('keeps exec allowed only under allowlist + ask-on-miss, never auto-approved', () => {
    const routing = toolRoutingForMode(DEFAULT_CHAT_MODE);
    expect(routing.exec.status).toBe('allowed');
    expect(routing.exec.note).toMatch(/never auto-granted|never.*approved/i);
    expect(toolRoutingForMode({ ...DEFAULT_CHAT_MODE, codeExecution: false }).exec.status)
      .toBe('denied-by-switch');
  });

  it('marks memory and image generation as directive-only, not enforced', () => {
    const routing = toolRoutingForMode(DEFAULT_CHAT_MODE);
    expect(routing.memory.status).toBe('directive-only');
    expect(routing.imageGeneration.status).toBe('directive-only');
  });
});
