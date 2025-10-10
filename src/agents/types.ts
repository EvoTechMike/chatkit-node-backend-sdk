import type { ThreadMetadata } from '../types/thread.js';
import type { Store } from '../store/Store.js';
import type { ThreadStreamEvent } from '../types/events.js';
import type { WidgetRoot } from '../widgets/index.js';

/**
 * Async queue for managing custom events in AgentContext.
 * Implements AsyncIterable so it can be consumed as an async generator.
 */
export class AsyncEventQueue<T> implements AsyncIterable<T> {
  private queue: T[] = [];
  private resolvers: Array<(value: T | typeof AsyncEventQueue.COMPLETE) => void> = [];
  private completed = false;

  static COMPLETE = Symbol('COMPLETE');

  /**
   * Add an event to the queue
   */
  push(event: T): void {
    if (this.completed) {
      throw new Error('Cannot push to completed queue');
    }

    if (this.resolvers.length > 0) {
      // Someone is waiting, resolve immediately
      const resolve = this.resolvers.shift()!;
      resolve(event);
    } else {
      // No one waiting, queue it
      this.queue.push(event);
    }
  }

  /**
   * Mark the queue as complete
   */
  complete(): void {
    this.completed = true;
    // Resolve all waiting consumers with COMPLETE sentinel
    for (const resolve of this.resolvers) {
      resolve(AsyncEventQueue.COMPLETE);
    }
    this.resolvers = [];
  }

  /**
   * Get next event from queue (async)
   */
  private next(): Promise<T | typeof AsyncEventQueue.COMPLETE> {
    if (this.queue.length > 0) {
      return Promise.resolve(this.queue.shift()!);
    }

    if (this.completed) {
      return Promise.resolve(AsyncEventQueue.COMPLETE);
    }

    // Wait for next push
    return new Promise((resolve) => {
      this.resolvers.push(resolve);
    });
  }

  /**
   * Implement AsyncIterable
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    while (true) {
      const value = await this.next();
      if (value === AsyncEventQueue.COMPLETE) {
        break;
      }
      // Type guard: if not COMPLETE, it must be T
      yield value as T;
    }
  }
}

/**
 * Context object passed to Agent execution that combines ChatKit-specific data
 * with user-defined request context.
 *
 * This allows Agents to access the current thread, store, and any custom
 * context data (like user ID, tenant ID, etc.) during execution.
 *
 * Provides methods for tools to emit custom events (widgets, workflows, etc.)
 * that will be merged with Agent SDK response streams.
 *
 * @template TContext - The user-defined context type (default: unknown)
 *
 * @example
 * ```typescript
 * interface MyContext {
 *   userId: string;
 *   tenantId: string;
 * }
 *
 * const agentContext: AgentContext<MyContext> = {
 *   thread: currentThread,
 *   store: myStore,
 *   requestContext: { userId: 'user123', tenantId: 'tenant456' },
 *   _events: new AsyncEventQueue()
 * };
 *
 * // In a tool:
 * await agentContext.streamWidget(myWidget);
 * ```
 */
export interface AgentContext<TContext = unknown> {
  /** The current ChatKit thread being processed */
  thread: ThreadMetadata;

  /** The store instance for persisting thread data */
  store: Store<TContext>;

  /** User-defined request context (e.g., user ID, session data, etc.) */
  requestContext: TContext;

  /**
   * Internal event queue for custom events (widgets, workflows, etc.)
   * @internal
   */
  _events: AsyncEventQueue<ThreadStreamEvent>;

  /**
   * Emit a custom ThreadStreamEvent.
   * This is typically used by tools to send custom events alongside Agent SDK responses.
   *
   * @param event - The ThreadStreamEvent to emit
   *
   * @example
   * ```typescript
   * await context.stream({
   *   type: 'thread.item.added',
   *   item: myCustomItem
   * });
   * ```
   */
  stream(event: ThreadStreamEvent): Promise<void>;

  /**
   * Stream a widget to the chat interface.
   * Can accept either a static widget or an async generator for streaming updates.
   *
   * @param widget - Static widget or async generator yielding widget states
   * @param copyText - Optional text for copy-to-clipboard functionality
   *
   * @example
   * ```typescript
   * // Static widget
   * await context.streamWidget({
   *   type: 'Card',
   *   children: [{ type: 'Text', value: 'Hello!' }]
   * });
   *
   * // Streaming widget
   * async function* widgetGenerator() {
   *   yield { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Loading...' }] };
   *   yield { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Complete!' }] };
   * }
   * await context.streamWidget(widgetGenerator());
   * ```
   */
  streamWidget(
    widget: WidgetRoot | AsyncGenerator<WidgetRoot, void, undefined>,
    copyText?: string | null
  ): Promise<void>;
}
