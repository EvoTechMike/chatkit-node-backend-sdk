/**
 * AgentContext Helper Functions
 *
 * This module provides helper functions to create and work with AgentContext instances.
 */

import type { ThreadMetadata } from '../types/thread.js';
import type { Store } from '../store/Store.js';
import type { ThreadStreamEvent } from '../types/events.js';
import type { WidgetRoot } from '../widgets/index.js';
import type { AgentContext } from './types.js';
import { AsyncEventQueue } from './types.js';
import { streamWidget as serverStreamWidget } from '../server/widget-stream.js';

/**
 * Create an AgentContext with all required methods implemented.
 *
 * This factory function creates a complete AgentContext instance with the
 * stream() and streamWidget() methods properly implemented.
 *
 * @template TContext - The user-defined context type
 * @param thread - The current thread metadata
 * @param store - The store instance
 * @param requestContext - User-defined request context
 * @returns A complete AgentContext instance
 *
 * @example
 * ```typescript
 * const context = createAgentContext(
 *   currentThread,
 *   myStore,
 *   { userId: 'user123' }
 * );
 *
 * // Use in tools:
 * await context.streamWidget(myWidget);
 * ```
 */
export function createAgentContext<TContext = unknown>(
  thread: ThreadMetadata,
  store: Store<TContext>,
  requestContext: TContext
): AgentContext<TContext> {
  const _events = new AsyncEventQueue<ThreadStreamEvent>();

  const context: AgentContext<TContext> = {
    thread,
    store,
    requestContext,
    _events,

    async stream(event: ThreadStreamEvent): Promise<void> {
      _events.push(event);
    },

    async streamWidget(
      widget: WidgetRoot | AsyncGenerator<WidgetRoot, void, undefined>,
      copyText?: string | null
    ): Promise<void> {
      // Use the server streamWidget function and push events to queue
      for await (const event of serverStreamWidget(
        thread,
        widget,
        copyText,
        (itemType) => store.generateItemId(itemType, thread, requestContext)
      )) {
        _events.push(event);
      }
    },
  };

  return context;
}
