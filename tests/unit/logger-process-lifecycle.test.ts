// @vitest-environment node
import { afterAll, describe, expect, it, vi } from 'vitest';

const LOGGER_EXIT_STATE = Symbol.for('cina-claw.logger.exit-state');
type ProcessWithLoggerState = NodeJS.Process & {
  [LOGGER_EXIT_STATE]?: { listener: () => void };
};

describe('logger process lifecycle', () => {
  afterAll(() => {
    // Keep the process-level singleton installed for other test modules; the
    // production process also owns it for its full lifetime.
    vi.resetModules();
  });

  it('registers at most one exit listener across repeated module evaluation', async () => {
    const processState = process as ProcessWithLoggerState;
    const listenerBefore = processState[LOGGER_EXIT_STATE]?.listener;
    const countBefore = process.listenerCount('exit');

    for (let index = 0; index < 16; index += 1) {
      vi.resetModules();
      await import('../../electron/utils/logger');
    }

    const listenerAfter = processState[LOGGER_EXIT_STATE]?.listener;
    expect(listenerAfter).toBeTypeOf('function');
    expect(process.listenerCount('exit') - countBefore).toBe(listenerBefore ? 0 : 1);
    if (listenerBefore) expect(listenerAfter).toBe(listenerBefore);
  });
});
