import type { RunStreamEvent } from '@openai/agents';
import type { ThreadStreamEvent } from '../types/events.js';
import type { AssistantMessageItem } from '../types/items.js';
import type { AgentContext } from './types.js';
import { defaultGenerateItemId } from '../utils/id.js';

/**
 * Converts an Agent SDK Runner stream to ChatKit ThreadStreamEvents.
 *
 * This function bridges the Agent SDK and ChatKit by:
 * 1. Listening to Agent Runner stream events
 * 2. Converting message outputs to ChatKit AssistantMessageItems
 * 3. Saving items to the store
 * 4. Emitting ChatKit-compatible events for the frontend
 *
 * @template TContext - The user-defined context type
 * @param context - The AgentContext containing thread, store, and request context
 * @param agentRunner - The Agent SDK Runner stream (from Runner.runStreamed())
 * @returns AsyncGenerator of ChatKit ThreadStreamEvents
 *
 * @example
 * ```typescript
 * const agentContext: AgentContext<MyContext> = {
 *   thread: currentThread,
 *   store: myStore,
 *   requestContext: { userId: 'user123' }
 * };
 *
 * const runnerStream = Runner.runStreamed(myAgent, input, { context: agentContext });
 *
 * for await (const event of streamAgentResponse(agentContext, runnerStream)) {
 *   yield event; // Emit to ChatKit frontend
 * }
 * ```
 */
export async function* streamAgentResponse<TContext = unknown>(
  context: AgentContext<TContext>,
  agentRunner: AsyncIterable<RunStreamEvent>
): AsyncGenerator<ThreadStreamEvent> {
  let currentMessageId: string | null = null;
  let currentMessageText = '';
  let contentIndex = 0;

  try {
    for await (const event of agentRunner) {
      // Handle Agent SDK raw model stream events
      if (event.type === 'raw_model_stream_event') {
        const { data } = event;

        // Handle message creation (response.output_item.added for type "message")
        if (data.type === 'model' && data.event?.type === 'response.output_item.added') {
          const item = data.event.item;
          if (item && item.type === 'message' && item.role === 'assistant') {
            // Generate new message ID
            currentMessageId = defaultGenerateItemId('message');
            currentMessageText = '';
            contentIndex = 0;

            // Emit thread.item.added event (ChatKit expects this when item starts)
            const initialItem: AssistantMessageItem = {
              type: 'assistant_message',
              id: currentMessageId,
              thread_id: context.thread.id,
              created_at: new Date().toISOString(),
              content: [],
            };

            yield {
              type: 'thread.item.added',
              item: initialItem,
            };
          }
        }

        // Handle content part added - Initialize content structure
        else if (data.type === 'model' && data.event?.type === 'response.content_part.added') {
          const part = data.event.part;
          if (currentMessageId && part?.type === 'output_text') {
            // Emit content part added event with initial structure
            yield {
              type: 'thread.item.updated',
              item_id: currentMessageId,
              update: {
                type: 'assistant_message.content_part.added',
                content_index: data.event.content_index,
                content: {
                  type: 'output_text',
                  text: part.text || '',
                  annotations: [],
                },
              },
            };
          }
        }

        // Handle text delta events
        else if (data.type === 'output_text_delta') {
          if (currentMessageId) {
            const delta = data.delta || '';

            if (delta) {
              currentMessageText += delta;

              // Emit text delta event wrapped in thread.item.updated
              yield {
                type: 'thread.item.updated',
                item_id: currentMessageId,
                update: {
                  type: 'assistant_message.content_part.text_delta',
                  content_index: contentIndex,
                  delta,
                },
              };
            }
          }
        }

        // Handle message completion (response.output_item.done for type "message")
        else if (data.type === 'model' && data.event?.type === 'response.output_item.done') {
          const item = data.event.item;
          if (item && item.type === 'message' && item.role === 'assistant' && currentMessageId) {
            // Create final AssistantMessageItem
            const finalItem: AssistantMessageItem = {
              type: 'assistant_message',
              id: currentMessageId,
              thread_id: context.thread.id,
              created_at: new Date().toISOString(),
              content: [
                {
                  type: 'output_text',
                  text: currentMessageText,
                  annotations: [],
                },
              ],
            };

            // Save to store
            await context.store.addThreadItem(
              context.thread.id,
              finalItem,
              context.requestContext
            );

            // Emit thread.item.done event
            yield {
              type: 'thread.item.done',
              item: finalItem,
            };

            // Reset state
            currentMessageId = null;
            currentMessageText = '';
          }
        }
      }
    }
  } catch (error) {
    // Emit error event
    yield {
      type: 'error',
      code: 'agent_error',
      message:
        error instanceof Error
          ? error.message
          : 'An error occurred while processing agent response',
      allow_retry: true,
    };
  }
}
