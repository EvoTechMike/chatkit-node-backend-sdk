import type { UserMessageItem } from '../types/items.js';

/**
 * Converts a ChatKit UserMessageItem to Agent SDK input format.
 *
 * This is a simple converter that extracts text content from the user message
 * and formats it for the Agent SDK. For more complex conversions (e.g., handling
 * attachments, multiple content types), you can create a custom converter.
 *
 * @param userMessage - The ChatKit user message to convert
 * @returns Agent SDK input format (array of message objects)
 *
 * @example
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
): Promise<Array<{ role: 'user'; content: string }>> {
  // Extract text content from the user message
  const text = userMessage.content
    .filter((c) => c.type === 'input_text')
    .map((c) => c.text)
    .join(' ');

  // Return in Agent SDK format
  return [
    {
      role: 'user',
      content: text,
    },
  ];
}
