/**
 * Cina harness store (draft).
 *
 * Owns, per the harness-layer design:
 * - engine selection (requested vs effective — see resolveEffectiveEngine);
 * - the timestamped, metadata-only activity log (capped, never prompt
 *   text, never tool I/O);
 * - the approval queue, mirrored from the ACP permission flow by the
 *   ACP chat session store (this store never approves anything itself:
 *   approve/decline still go through the ACP permission cards, and
 *   Full Autonomy never auto-approves);
 * - the harness-session binding: in this draft a harness session IS
 *   the chat session key it serves. A future engine with its own
 *   session ids would map them here instead of changing callers.
 *
 * Deliberately in-memory only, like the chat-mode store: engine
 * choice, activity, and approvals reset on restart, so no
 * unattended/uncensored state is silently carried over.
 */
import { create } from 'zustand';
import {
  HARNESS_DEFAULT_ENGINE_ID,
  resolveEffectiveEngine,
  type HarnessActivityEntry,
  type HarnessApprovalEntry,
  type HarnessEngineId,
} from '@/lib/harness';

export const HARNESS_ACTIVITY_CAP = 500;

let harnessEntryCounter = 0;

function nextHarnessEntryId(): string {
  harnessEntryCounter += 1;
  return `harness-${Date.now().toString(36)}-${harnessEntryCounter}`;
}

export function createHarnessActivityEntry(
  input: Omit<HarnessActivityEntry, 'id' | 'at'> & { at?: string },
): HarnessActivityEntry {
  return {
    ...input,
    id: nextHarnessEntryId(),
    at: input.at ?? new Date().toISOString(),
  };
}

type HarnessState = {
  /** Engine the user (or a future caller) asked for. */
  requestedEngineId: HarnessEngineId;
  /** Engine actually serving turns: requested when available, else openclaw. */
  effectiveEngineId: HarnessEngineId;
  setEngineId: (engineId: HarnessEngineId) => void;
  /** Harness session id bound to a chat session key (identity in this draft). */
  boundSessionKey: string | null;
  bindSession: (sessionKey: string | null) => void;
  activity: HarnessActivityEntry[];
  appendActivity: (entry: Omit<HarnessActivityEntry, 'id' | 'at'> & { at?: string }) => void;
  clearActivity: () => void;
  approvals: HarnessApprovalEntry[];
  recordApprovalRequest: (entry: {
    requestId: string;
    sessionKey: string;
    title: string;
  }) => void;
  recordApprovalOutcome: (
    requestId: string,
    status: 'approved' | 'declined' | 'auto-declined',
    autoDeclineReason?: string | null,
  ) => void;
  clearApprovals: () => void;
};

export const useHarnessStore = create<HarnessState>((set, get) => ({
  requestedEngineId: HARNESS_DEFAULT_ENGINE_ID,
  effectiveEngineId: HARNESS_DEFAULT_ENGINE_ID,

  setEngineId(engineId) {
    const effectiveEngineId = resolveEffectiveEngine(engineId);
    set({ requestedEngineId: engineId, effectiveEngineId });
    get().appendActivity({
      sessionKey: get().boundSessionKey ?? '',
      engineId: effectiveEngineId,
      kind: 'engine-selected',
      summary: `Engine selected: requested=${engineId}, effective=${effectiveEngineId}`,
      detail: effectiveEngineId !== engineId
        ? 'Requested engine is unavailable in this draft; OpenClaw remains effective.'
        : undefined,
    });
  },

  boundSessionKey: null,

  bindSession(sessionKey) {
    set({ boundSessionKey: sessionKey });
  },

  activity: [],

  appendActivity(entry) {
    const full = createHarnessActivityEntry(entry);
    set((state) => ({
      activity: [...state.activity, full].slice(-HARNESS_ACTIVITY_CAP),
    }));
  },

  clearActivity() {
    set({ activity: [] });
  },

  approvals: [],

  recordApprovalRequest(entry) {
    set((state) => {
      if (state.approvals.some((item) => item.requestId === entry.requestId)) {
        return state;
      }
      return {
        approvals: [
          ...state.approvals,
          {
            requestId: entry.requestId,
            sessionKey: entry.sessionKey,
            title: entry.title,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            resolvedAt: null,
            autoDeclineReason: null,
          },
        ],
      };
    });
  },

  recordApprovalOutcome(requestId, status, autoDeclineReason = null) {
    set((state) => ({
      approvals: state.approvals.map((item) => (item.requestId === requestId
        ? {
          ...item,
          status,
          resolvedAt: new Date().toISOString(),
          autoDeclineReason: status === 'auto-declined' ? autoDeclineReason : item.autoDeclineReason,
        }
        : item)),
    }));
  },

  clearApprovals() {
    set({ approvals: [] });
  },
}));
