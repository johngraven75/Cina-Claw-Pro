import { describe, expect, it } from 'vitest';
import { createEmptyAcpTimeline } from '@/lib/acp/reducer';
import type { AcpTimelineSnapshot } from '@/lib/acp/timeline-types';
import {
  emptyAssistantTurnMessageId,
  hasAssistantContentAfter,
  lastUserMessageId,
} from '@/lib/acp/empty-turn';

function timelineWithItems(items: AcpTimelineSnapshot['itemsById']): AcpTimelineSnapshot {
  return {
    ...createEmptyAcpTimeline('agent:main:session-1', 1),
    itemOrder: Object.keys(items),
    itemsById: items,
  };
}

const user = {
  kind: 'message-segment' as const,
  id: 'user-a:0',
  role: 'user' as const,
  messageId: 'user-a',
  segmentIndex: 0,
  parts: [{ kind: 'markdown' as const, text: 'hi' }],
};

describe('empty assistant turns', () => {
  it('reports a completed turn with no assistant item as empty', () => {
    const snapshot = timelineWithItems({ [user.id]: user });
    expect(lastUserMessageId(snapshot)).toBe('user-a');
    expect(hasAssistantContentAfter(snapshot, 'user-a')).toBe(false);
    expect(emptyAssistantTurnMessageId(snapshot, 'complete')).toBe('user-a');
  });

  it('does not report a running turn as empty', () => {
    const snapshot = timelineWithItems({ [user.id]: user });
    expect(emptyAssistantTurnMessageId(snapshot, 'running')).toBeNull();
    expect(emptyAssistantTurnMessageId(snapshot, undefined)).toBeNull();
  });

  it('counts assistant text, thought, tool calls, and plans as content', () => {
    const base = { [user.id]: user };
    const assistantText = timelineWithItems({
      ...base,
      'assistant-a:0': {
        kind: 'message-segment', id: 'assistant-a:0', role: 'assistant', messageId: 'assistant-a',
        segmentIndex: 0, parts: [{ kind: 'markdown', text: 'hello' }],
      },
    });
    expect(emptyAssistantTurnMessageId(assistantText, 'complete')).toBeNull();

    const thoughtOnly = timelineWithItems({
      ...base,
      'thought:assistant-a': {
        kind: 'thought', id: 'thought:assistant-a', messageId: 'assistant-a',
        parts: [{ kind: 'markdown', text: 'thinking it through' }],
      },
    });
    expect(emptyAssistantTurnMessageId(thoughtOnly, 'complete')).toBeNull();

    const toolOnly = timelineWithItems({
      ...base,
      'tool:read': {
        kind: 'tool-call', id: 'tool:read', toolCallId: 'read', title: 'Read',
        status: 'completed', outputParts: [], locations: [],
      },
    });
    expect(emptyAssistantTurnMessageId(toolOnly, 'complete')).toBeNull();
  });

  it('does not count whitespace-only assistant text as a reply', () => {
    const snapshot = timelineWithItems({
      [user.id]: user,
      'assistant-a:0': {
        kind: 'message-segment', id: 'assistant-a:0', role: 'assistant', messageId: 'assistant-a',
        segmentIndex: 0, parts: [{ kind: 'markdown', text: '   \n  ' }],
      },
    });
    expect(emptyAssistantTurnMessageId(snapshot, 'complete')).toBe('user-a');
  });

  it('only looks after the last user message', () => {
    const snapshot = timelineWithItems({
      'assistant-a:0': {
        kind: 'message-segment', id: 'assistant-a:0', role: 'assistant', messageId: 'assistant-a',
        segmentIndex: 0, parts: [{ kind: 'markdown', text: 'old answer' }],
      },
      [user.id]: user,
    });
    expect(emptyAssistantTurnMessageId(snapshot, 'complete')).toBe('user-a');
  });

  it('returns null with no user message', () => {
    const snapshot = createEmptyAcpTimeline('agent:main:session-1', 1);
    expect(emptyAssistantTurnMessageId(snapshot, 'complete')).toBeNull();
  });
});
