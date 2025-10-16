import type { UserMessageItem, ThreadItem } from '../types/items.js';
import {
  defaultInputConverter,
  type ResponseInputItem,
} from './input-item-converter.js';

/**
 * Converts a ChatKit UserMessageItem to Agent SDK input format (simple version).
 *
 * This is a simple converter that extracts text content from the user message
 * and formats it for the Agent SDK. For more complex conversions (e.g., handling
 * attachments, multiple content types), you can create a custom converter.
 *
 * @param userMessage - The ChatKit user message to convert
 * @returns Agent SDK input format (array of message objects)
 *
 * @example Single message (simple)
 * ```typescript
 * const userMessage: UserMessageItem = {
 *   type: 'user_message',
 *   id: 'msg_123',
 *   thread_id: 'thr_abc',
 *   created_at: '2025-10-09T12:00:00Z',
 *   content: [{
 *     type: 'input_text',
 *     text: 'Hello, how can you help me?'
 *   }],
 *   attachments: [],
 *   inference_options: {}
 * };
 *
 * const agentInput = await simpleToAgentInput(userMessage);
 * // Returns: [{ role: 'user', content: 'Hello, how can you help me?' }]
 * ```
 */
export async function simpleToAgentInput(
  userMessage: UserMessageItem
): Promise<Array<{ role: 'user'; content: string }>>;

/**
 * Converts a full thread history (array of ThreadItems) to Agent SDK input format.
 *
 * This enables the AI to see the complete conversation history including
 * widgets, workflows, and tasks that were previously displayed.
 *
 * This is the Python SDK parity version - accepts full thread history!
 *
 * @param items - Array of thread items from conversation history
 * @returns Agent SDK input format (array of input items)
 *
 * @example Full history with widgets
 * ```typescript
 * // Load recent thread history from database
 * const historyResult = await store.loadThreadItems(
 *   threadId,
 *   null,  // after
 *   50,    // limit
 *   'asc', // chronological order
 *   context
 * );
 *
 * // Convert ALL items to agent input (includes widgets, workflows, tasks!)
 * const agentInput = await simpleToAgentInput(historyResult.data);
 *
 * // Pass to agent - AI now knows about widgets that were displayed!
 * const result = await run(agent, agentInput, {
 *   stream: true,
 *   context: agentContext
 *   // Note: Don't use previousResponseId when using manual history
 * });
 * ```
 */
export async function simpleToAgentInput(
  items: ThreadItem[]
): Promise<ResponseInputItem[]>;

/**
 * Implementation of simpleToAgentInput with overloads.
 */
export async function simpleToAgentInput(
  input: UserMessageItem | ThreadItem[]
): Promise<Array<{ role: 'user'; content: string }> | ResponseInputItem[]> {
  // Check if input is an array (full history conversion)
  if (Array.isArray(input)) {
    // Use InputThreadItemConverter for full history
    return await defaultInputConverter.toAgentInput(input);
  }

  // Single UserMessageItem (simple conversion - backward compatible)
  const userMessage = input;
  const text = userMessage.content
    .filter((c) => c.type === 'input_text')
    .map((c) => c.text)
    .join(' ');

  return [
    {
      role: 'user',
      content: text,
    },
  ];
}
