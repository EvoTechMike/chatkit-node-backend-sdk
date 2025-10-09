import type { RunItem } from '@openai/agents';
import type { ThreadMetadata } from '../types/thread.js';
import type { ThreadItem, AssistantMessageItem } from '../types/items.js';
import type { Store } from '../store/Store.js';

/**
 * Base class for converting Agent SDK RunItems to ChatKit ThreadItems.
 *
 * This abstract class allows you to customize how Agent outputs are converted
 * to ChatKit items. Extend this class to implement custom conversion logic
 * for your specific use case.
 *
 * @template TContext - The user-defined context type
 *
 * @example
 * ```typescript
 * class CustomItemConverter<TContext> extends ThreadItemConverter<TContext> {
 *   async convert(
 *     agentOutput: RunItem,
 *     thread: ThreadMetadata,
 *     store: Store<TContext>,
 *     context: TContext
 *   ): Promise<ThreadItem> {
 *     // Custom conversion logic here
 *     // For example, handle tool calls, add metadata, etc.
 *     return customThreadItem;
 *   }
 * }
 * ```
 */
export abstract class ThreadItemConverter<TContext = unknown> {
  /**
   * Converts an Agent SDK RunItem to a ChatKit ThreadItem.
   *
   * @param agentOutput - The Agent SDK RunItem to convert
   * @param thread - The current thread metadata
   * @param store - The store instance for generating IDs or fetching additional data
   * @param context - The user-defined request context
   * @returns The converted ChatKit ThreadItem
   */
  abstract convert(
    agentOutput: RunItem,
    thread: ThreadMetadata,
    store: Store<TContext>,
    context: TContext
  ): Promise<ThreadItem>;
}

/**
 * Default implementation of ThreadItemConverter that handles basic text message conversion.
 *
 * This converter extracts text output from Agent message items and creates
 * ChatKit AssistantMessageItems. For more advanced conversions (tool calls,
 * handoffs, etc.), extend the ThreadItemConverter class.
 *
 * @template TContext - The user-defined context type
 */
export class DefaultThreadItemConverter<
  TContext = unknown,
> extends ThreadItemConverter<TContext> {
  async convert(
    agentOutput: RunItem,
    thread: ThreadMetadata,
    store: Store<TContext>,
    context: TContext
  ): Promise<ThreadItem> {
    // Import extractAllTextOutput dynamically
    const agentsSdk = await import('@openai/agents');
    const text = agentsSdk.extractAllTextOutput([agentOutput]);

    // Generate item ID
    const itemId = store.generateItemId('message', thread, context);

    // Create AssistantMessageItem
    const item: AssistantMessageItem = {
      type: 'assistant_message',
      id: itemId,
      thread_id: thread.id,
      created_at: new Date().toISOString(),
      content: [
        {
          type: 'output_text',
          text: text || '',
          annotations: [],
        },
      ],
    };

    return item;
  }
}
