import type {
  AcpTimelineSnapshot,
  RenderPart,
  TimelineItem,
} from './timeline-types';

/**
 * A finished ACP turn that produced no assistant content at all.
 *
 * This is the "thinking indicator shows, then disappears, with no reply
 * and no error" failure: `connection.prompt()` in the Main process
 * resolves successfully when the agent stops, even if the model stopped
 * early (for example, a tiny local model that cannot follow the agent
 * loop) without emitting any assistant text, thought, tool call, or plan.
 * The renderer therefore clears `sending` and shows nothing, and the
 * existing error banner stays empty because no operation failed.
 *
 * These helpers are pure and deliberately conservative: a turn only
 * counts as empty when its timing is already `complete` and there is
 * genuinely no assistant item after the last user message of that turn.
 * Whitespace-only assistant text does not count as a reply.
 */

function partHasVisibleContent(part: RenderPart): boolean {
  if (part.kind === 'markdown') return part.text.trim().length > 0;
  // An image, attachment, or an unsupported-content error is visible
  // in the timeline, so it is not "nothing".
  return part.kind === 'image' || part.kind === 'attachment' || part.kind === 'error';
}

function itemHasVisibleContent(item: TimelineItem): boolean {
  switch (item.kind) {
    case 'message-segment':
      return item.role === 'assistant' && item.parts.some(partHasVisibleContent);
    case 'thought':
      return item.parts.some(partHasVisibleContent);
    case 'tool-call':
      return true;
    case 'permission':
      return true;
    case 'plan':
      return item.entries.length > 0;
    default:
      return false;
  }
}

/** The messageId of the last user message in the timeline, or null. */
export function lastUserMessageId(snapshot: AcpTimelineSnapshot): string | null {
  for (let index = snapshot.itemOrder.length - 1; index >= 0; index -= 1) {
    const item = snapshot.itemsById[snapshot.itemOrder[index]];
    if (item?.kind === 'message-segment' && item.role === 'user') return item.messageId;
  }
  return null;
}

/** True when an assistant item with visible content follows that user message. */
export function hasAssistantContentAfter(
  snapshot: AcpTimelineSnapshot,
  userMessageId: string,
): boolean {
  let userIndex = -1;
  for (let index = 0; index < snapshot.itemOrder.length; index += 1) {
    const item = snapshot.itemsById[snapshot.itemOrder[index]];
    if (item?.kind === 'message-segment' && item.role === 'user' && item.messageId === userMessageId) {
      userIndex = index;
    }
  }
  if (userIndex < 0) return false;
  for (let index = userIndex + 1; index < snapshot.itemOrder.length; index += 1) {
    const item = snapshot.itemsById[snapshot.itemOrder[index]];
    if (!item) continue;
    if (item.kind === 'message-segment' && item.role === 'user') continue;
    if (itemHasVisibleContent(item)) return true;
  }
  return false;
}

/**
 * The user messageId of a completed turn that ended with no assistant
 * content, or null when the last turn has content, is still running,
 * or there is no user message yet.
 */
export function emptyAssistantTurnMessageId(
  snapshot: AcpTimelineSnapshot,
  turnTimingStatus: string | undefined,
): string | null {
  if (turnTimingStatus !== 'complete') return null;
  const userMessageId = lastUserMessageId(snapshot);
  if (!userMessageId) return null;
  return hasAssistantContentAfter(snapshot, userMessageId) ? null : userMessageId;
}
