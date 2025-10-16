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
import type { WorkflowItem } from '../types/items.js';
import type { Workflow, Task, WorkflowSummary } from '../types/workflow.js';
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

    // NEW: Python SDK parity fields
    previousResponseId: null,
    workflowItem: null,

    // Convenience ID generation
    generateId(type, thread?) {
      const targetThread = thread || context.thread;
      return store.generateItemId(type, targetThread, requestContext);
    },

    // Workflow management methods
    async startWorkflow(workflow: Workflow): Promise<void> {
      const workflowItem: WorkflowItem = {
        type: 'workflow',
        id: context.generateId('workflow'),
        thread_id: context.thread.id,
        created_at: new Date().toISOString(),
        workflow,
      };

      context.workflowItem = workflowItem;

      // Defer sending added event until tasks are added for non-reasoning workflows
      if (workflow.type !== 'reasoning' && workflow.tasks.length === 0) {
        return;
      }

      await context.stream({
        type: 'thread.item.added',
        item: workflowItem,
      });
    },

    async endWorkflow(
      summary?: WorkflowSummary | null,
      expanded: boolean = false
    ): Promise<void> {
      if (!context.workflowItem) {
        return; // No workflow to end
      }

      // Set summary if provided
      if (summary !== undefined) {
        context.workflowItem.workflow.summary = summary;
      } else if (context.workflowItem.workflow.summary === null) {
        // Calculate duration if no summary provided
        const start = new Date(context.workflowItem.created_at).getTime();
        const end = Date.now();
        const duration = Math.floor((end - start) / 1000);
        context.workflowItem.workflow.summary = {
          duration,
        };
      }

      context.workflowItem.workflow.expanded = expanded;

      await context.stream({
        type: 'thread.item.done',
        item: context.workflowItem,
      });

      context.workflowItem = null;
    },

    async addWorkflowTask(task: Task): Promise<void> {
      // Create workflow if needed
      if (!context.workflowItem) {
        await context.startWorkflow({
          type: 'custom',
          tasks: [],
          expanded: true,
          summary: null,
        });
      }

      const workflow = context.workflowItem!.workflow;
      workflow.tasks.push(task);

      // Send added event if this is the first task for a non-reasoning workflow
      if (workflow.type !== 'reasoning' && workflow.tasks.length === 1) {
        await context.stream({
          type: 'thread.item.added',
          item: context.workflowItem!,
        });
      } else {
        // Send task added update
        await context.stream({
          type: 'thread.item.updated',
          item_id: context.workflowItem!.id,
          update: {
            type: 'workflow.task.added',
            task_index: workflow.tasks.length - 1,
            task,
          },
        });
      }
    },

    async updateWorkflowTask(task: Task, taskIndex: number): Promise<void> {
      if (!context.workflowItem) {
        throw new Error('No active workflow to update');
      }

      const workflow = context.workflowItem.workflow;

      if (taskIndex < 0 || taskIndex >= workflow.tasks.length) {
        throw new Error(`Task index ${taskIndex} out of bounds (workflow has ${workflow.tasks.length} tasks)`);
      }

      // Update task in place
      workflow.tasks[taskIndex] = task;

      await context.stream({
        type: 'thread.item.updated',
        item_id: context.workflowItem.id,
        update: {
          type: 'workflow.task.updated',
          task_index: taskIndex,
          task,
        },
      });
    },

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
