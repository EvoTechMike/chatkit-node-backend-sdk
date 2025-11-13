import type { ThreadMetadata } from '../types/thread.js';
import type { Store } from '../store/Store.js';
import type { StoreItemType } from '../types/store.js';
import type { ThreadStreamEvent } from '../types/events.js';
import type { WidgetRoot } from '../widgets/index.js';
import type { WorkflowItem } from '../types/items.js';
import type { Workflow, Task, WorkflowSummary } from '../types/workflow.js';

/**
 * Client tool call configuration.
 * Set this on AgentContext to trigger a client-side tool execution.
 */
export interface ClientToolCall {
  /** Name of the client-side tool to call */
  name: string;
  /** Arguments to pass to the client tool */
  arguments: Record<string, any>;
}

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
   * Drain all remaining items from the queue (synchronously)
   * Returns any items that were queued but not yet consumed
   */
  drain(): T[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
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
   * Previous response ID for conversation chaining.
   * Used with OpenAI's Responses API to maintain server-side conversation state.
   *
   * NEW: Python SDK parity feature!
   *
   * @example
   * ```typescript
   * // Track response ID for next request
   * context.previousResponseId = result.response_id;
   * ```
   */
  previousResponseId?: string | null;

  /**
   * Current active workflow item.
   * Tracks custom workflows created by tools during execution.
   *
   * NEW: Python SDK parity feature!
   *
   * @example
   * ```typescript
   * // Start a workflow
   * await context.startWorkflow({ type: 'custom', tasks: [] });
   * console.log(context.workflowItem?.id); // "wf_abc123"
   * ```
   */
  workflowItem?: WorkflowItem | null;

  /**
   * Client tool call to be executed on the client-side.
   * When set by a tool, this will be emitted as a ClientToolCallItem at the end of the stream.
   *
   * @example
   * ```typescript
   * // In a tool's execute function:
   * context.clientToolCall = {
   *   name: 'add_to_todo_list',
   *   arguments: { task: 'Buy groceries' }
   * };
   * ```
   */
  clientToolCall?: ClientToolCall;

  /**
   * Generate a unique ID for a thread item.
   *
   * Convenience method for generating IDs without calling store methods directly.
   *
   * NEW: Python SDK parity feature!
   *
   * @param type - The type of item to generate an ID for
   * @param thread - Optional thread metadata (defaults to context.thread)
   * @returns A unique ID string
   *
   * @example
   * ```typescript
   * const itemId = context.generateId('message');
   * const workflowId = context.generateId('workflow');
   * ```
   */
  generateId(type: StoreItemType, thread?: ThreadMetadata): string;

  /**
   * Start a new workflow.
   *
   * Workflows are multi-step progress indicators shown to users.
   * Use this to create custom workflows that display task progress.
   *
   * NEW: Python SDK parity feature!
   *
   * @param workflow - The workflow configuration
   *
   * @example
   * ```typescript
   * // In a tool that processes data
   * async execute(params, { context }) {
   *   await context.startWorkflow({
   *     type: 'custom',
   *     tasks: [],
   *     expanded: true,
   *     summary: null
   *   });
   *
   *   // Add tasks as work progresses...
   * }
   * ```
   */
  startWorkflow(workflow: Workflow): Promise<void>;

  /**
   * End the current workflow.
   *
   * Completes the active workflow with an optional summary.
   * The workflow will be saved to the database and marked as complete.
   *
   * NEW: Python SDK parity feature!
   *
   * @param summary - Optional summary to display when collapsed
   * @param expanded - Whether to keep the workflow expanded (default: false)
   *
   * @example
   * ```typescript
   * // End workflow with duration summary
   * await context.endWorkflow(
   *   { type: 'duration', duration: 30 },
   *   false  // collapsed
   * );
   * ```
   */
  endWorkflow(
    summary?: WorkflowSummary | null,
    expanded?: boolean
  ): Promise<void>;

  /**
   * Add a task to the current workflow.
   *
   * Creates or updates the active workflow with a new task.
   * If no workflow is active, creates one automatically.
   *
   * NEW: Python SDK parity feature!
   *
   * @param task - The task to add to the workflow
   *
   * @example
   * ```typescript
   * await context.addWorkflowTask({
   *   type: 'custom',
   *   title: 'Loading data',
   *   content: 'Reading 1000 rows from database...'
   * });
   *
   * // Later, update it
   * await context.updateWorkflowTask(
   *   { type: 'custom', title: 'Loading data', content: '✓ Loaded 1000 rows' },
   *   0  // task index
   * );
   * ```
   */
  addWorkflowTask(task: Task): Promise<void>;

  /**
   * Update an existing task in the current workflow.
   *
   * Modifies a task at the specified index, useful for showing progress updates.
   *
   * NEW: Python SDK parity feature!
   *
   * @param task - The updated task
   * @param taskIndex - The index of the task to update
   *
   * @example
   * ```typescript
   * // Update task status from "in progress" to "complete"
   * await context.updateWorkflowTask(
   *   {
   *     type: 'custom',
   *     title: 'Processing',
   *     content: '✓ Completed 100/100 items'
   *   },
   *   1  // second task
   * );
   * ```
   */
  updateWorkflowTask(task: Task, taskIndex: number): Promise<void>;

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
