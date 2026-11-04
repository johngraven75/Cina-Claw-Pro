import { describe, expect, it } from 'vitest';
import { DEFAULT_CHAT_MODE } from '../../src/stores/chat-mode';
import { directAdapter, buildDirectChatRequest, sendDirectSimpleChat } from '../../src/lib/harness/direct-adapter';
import { openclawAdapter } from '../../src/lib/harness/openclaw-adapter';
import { getEngineAdapter, resolveEffectiveEngine } from '../../src/lib/harness/index';
import type { ConfiguredModelOption } from '../../src/lib/model-options';

const OPTIONS: ConfiguredModelOption[] = [{
  modelRef: 'ollama-abc12345/qwen3-vl:8b-instruct',
  label: 'qwen3-vl:8b-instruct (Ollama)',
  runtimeProviderKey: 'ollama-abc12345',
  accountId: 'ollama',
  uncensored: false,
}];

describe('harness engine adapters', () => {
  it('OpenClaw adapter is available and declares channels/cron as runtime-provided', () => {
    expect(openclawAdapter.available).toBe(true);
    expect(openclawAdapter.capabilities.channels).toBe(true);
    expect(openclawAdapter.capabilities.cron).toBe(true);
    expect(openclawAdapter.capabilities.acpSessions).toBe(true);
    const route = openclawAdapter.resolveRoute({
      sessionKey: 's1',
      preferredModelRef: null,
      defaultModelRef: null,
      modelOptions: OPTIONS,
    });
    expect(route.engineId).toBe('openclaw');
    expect(route.modelRef).toBe('ollama-abc12345/qwen3-vl:8b-instruct');
  });

  it('default mode produces no directive block; a changed mode does', () => {
    const base = openclawAdapter.buildTurnPlan({
      sessionKey: 's1',
      route: { engineId: 'openclaw', modelRef: OPTIONS[0].modelRef, fromPreattachedDefault: true, failureReason: null },
      mode: DEFAULT_CHAT_MODE,
    });
    expect(base.modeDirectives).toBeNull();
    const changed = openclawAdapter.buildTurnPlan({
      sessionKey: 's1',
      route: base.route,
      mode: { ...DEFAULT_CHAT_MODE, webSearch: true },
    });
    expect(changed.modeDirectives).toMatch(/Web search/);
  });

  it('Direct adapter is a stub: unavailable, no capabilities, no faked reply', async () => {
    expect(directAdapter.available).toBe(false);
    expect(directAdapter.unavailableReason).toMatch(/no host route/i);
    expect(directAdapter.capabilities.channels).toBe(false);
    expect(directAdapter.capabilities.cron).toBe(false);
    expect(directAdapter.capabilities.simpleChat).toBe(false);
    const request = buildDirectChatRequest('qwen3-vl:8b-instruct', [{ role: 'user', content: 'hi' }]);
    expect(request.model).toBe('qwen3-vl:8b-instruct');
    await expect(sendDirectSimpleChat(request)).resolves.toMatchObject({ ok: false });
  });

  it('effective engine stays OpenClaw while Direct is unavailable', () => {
    expect(getEngineAdapter('direct').available).toBe(false);
    expect(resolveEffectiveEngine('direct')).toBe('openclaw');
    expect(resolveEffectiveEngine('openclaw')).toBe('openclaw');
  });
});
