import { beforeEach, describe, expect, it } from 'vitest';
import { HARNESS_ACTIVITY_CAP, useHarnessStore } from '../../src/stores/harness';

function resetHarness() {
  useHarnessStore.setState({
    requestedEngineId: 'openclaw',
    effectiveEngineId: 'openclaw',
    boundSessionKey: null,
    activity: [],
    approvals: [],
  });
}

describe('harness store', () => {
  beforeEach(() => {
    resetHarness();
  });

  it('defaults to the OpenClaw engine', () => {
    const state = useHarnessStore.getState();
    expect(state.requestedEngineId).toBe('openclaw');
    expect(state.effectiveEngineId).toBe('openclaw');
  });

  it('selecting Direct keeps OpenClaw effective and logs the difference', () => {
    const { setEngineId } = useHarnessStore.getState();
    setEngineId('direct');
    const state = useHarnessStore.getState();
    expect(state.requestedEngineId).toBe('direct');
    expect(state.effectiveEngineId).toBe('openclaw');
    const entry = state.activity.find((item) => item.kind === 'engine-selected');
    expect(entry?.summary).toMatch(/requested=direct, effective=openclaw/);
  });

  it('binds a harness session to a chat session key', () => {
    useHarnessStore.getState().bindSession('session-1');
    expect(useHarnessStore.getState().boundSessionKey).toBe('session-1');
  });

  it('caps the activity log and never stores prompt text in entries', () => {
    const { appendActivity } = useHarnessStore.getState();
    for (let index = 0; index < HARNESS_ACTIVITY_CAP + 50; index += 1) {
      appendActivity({
        sessionKey: 's1',
        engineId: 'openclaw',
        kind: 'turn-started',
        summary: `Turn started: m${index}`,
      });
    }
    const { activity } = useHarnessStore.getState();
    expect(activity).toHaveLength(HARNESS_ACTIVITY_CAP);
    expect(activity[0].summary).toBe('Turn started: m50');
  });

  it('mirrors approval requests and outcomes, deduping by request id', () => {
    const store = useHarnessStore.getState();
    store.recordApprovalRequest({ requestId: 'r1', sessionKey: 's1', title: 'Run command' });
    store.recordApprovalRequest({ requestId: 'r1', sessionKey: 's1', title: 'Run command' });
    expect(useHarnessStore.getState().approvals).toHaveLength(1);
    expect(useHarnessStore.getState().approvals[0].status).toBe('pending');
    useHarnessStore.getState().recordApprovalOutcome('r1', 'approved');
    const entry = useHarnessStore.getState().approvals[0];
    expect(entry.status).toBe('approved');
    expect(entry.resolvedAt).toBeTruthy();
  });
});
