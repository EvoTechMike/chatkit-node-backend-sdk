/**
 * Standalone Widget Streaming
 *
 * This module provides a standalone `streamWidget` function for use in the
 * ChatKitServer's `respond()` method. It converts widgets to ChatKit thread events,
 * handling both static widgets and streaming widget generators.
 */

import type { ThreadMetadata } from '../types/thread.js';
import type { ThreadStreamEvent } from '../types/events.js';
import type { WidgetItem } from '../types/items.js';
import type { WidgetRoot } from '../widgets/index.js';
import { diffWidget } from '../agents/widget-helpers.js';
import { defaultGenerateItemId } from '../utils/id.js';

/**
 * Stream a widget as ChatKit thread events.
 *
 * This function can be used directly in the `respond()` method to emit widgets
 * without requiring an AgentContext. It supports both:
 * - Static widgets: Emits a single `thread.item.done` event
 * - Streaming widgets: Emits `thread.item.added`, `thread.item.updated`, and `thread.item.done` events
 *
 * For streaming widgets, Text and Markdown components with an `id` will have their
 * value changes emitted as text delta events for a smooth streaming experience.
 *
 * @param thread - The current thread metadata
 * @param widget - Static widget or async generator yielding widget states
 * @param copyText - Optional text for copy-to-clipboard functionality
 * @param generateId - Optional function to generate item IDs (defaults to defaultGenerateItemId)
 * @returns Async generator of ThreadStreamEvents
 *
 * @example
 * ```typescript
 * // In ChatKitServer.respond():
 * async function* respond(thread, input, context) {
 *   // Static widget
 *   for await (const event of streamWidget(thread, {
 *     type: 'Card',
 *     children: [{ type: 'Text', value: 'Hello!' }]
 *   })) {
 *     yield event;
 *   }
 *
 *   // Streaming widget
 *   async function* widgetGen() {
 *     yield { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Loading...', streaming: true }] };
 *     await delay(1000);
 *     yield { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Complete!', streaming: false }] };
 *   }
 *   for await (const event of streamWidget(thread, widgetGen())) {
 *     yield event;
 *   }
 * }
 * ```
 */
export async function* streamWidget(
  thread: ThreadMetadata,
  widget: WidgetRoot | AsyncGenerator<WidgetRoot, void, undefined>,
  copyText?: string | null,
  generateId: (itemType: 'message' | 'workflow' | 'task' | 'tool_call' | 'attachment') => string = (
    itemType
  ) => defaultGenerateItemId(itemType)
): AsyncGenerator<ThreadStreamEvent> {
  const itemId = generateId('message');

  // Handle static widget (not a generator)
  if (
    typeof widget === 'object' &&
    widget !== null &&
    !('next' in widget && typeof widget.next === 'function')
  ) {
    const widgetItem: WidgetItem = {
      type: 'widget',
      id: itemId,
      thread_id: thread.id,
      created_at: new Date().toISOString(),
      widget: widget as WidgetRoot,
      copy_text: copyText || null,
    };

    yield {
      type: 'thread.item.done',
      item: widgetItem,
    };
    return;
  }

  // Handle streaming widget generator
  const widgetGen = widget as AsyncGenerator<WidgetRoot, void, undefined>;

  // Get initial state
  const initialResult = await widgetGen.next();
  if (initialResult.done) {
    return; // Empty generator
  }

  const initialState = initialResult.value;

  const widgetItem: WidgetItem = {
    type: 'widget',
    id: itemId,
    thread_id: thread.id,
    created_at: new Date().toISOString(),
    widget: initialState,
    copy_text: copyText || null,
  };

  // Emit initial item added
  yield {
    type: 'thread.item.added',
    item: widgetItem,
  };

  let lastState = initialState;

  // Stream updates
  for await (const newState of widgetGen) {
    const deltas = diffWidget(lastState, newState);

    for (const update of deltas) {
      yield {
        type: 'thread.item.updated',
        item_id: itemId,
        update,
      };
    }

    lastState = newState;
  }

  // Emit final done event with last state
  yield {
    type: 'thread.item.done',
    item: {
      ...widgetItem,
      widget: lastState,
    },
  };
}
