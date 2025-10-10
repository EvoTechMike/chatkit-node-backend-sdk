import type { RunStreamEvent } from '@openai/agents';
import type { ThreadStreamEvent } from '../types/events.js';
import type { AssistantMessageItem, Annotation, WorkflowItem } from '../types/items.js';
import type { AgentContext } from './types.js';
import { defaultGenerateItemId } from '../utils/id.js';
import { mergeAsyncGenerators, EventWrapper } from './merge-streams.js';

/**
 * Convert Agent SDK annotations to ChatKit annotation format.
 * Handles file citations and URL citations from the Agent SDK.
 */
function convertAnnotations(sdkAnnotations: any[]): Annotation[] {
  const result: Annotation[] = [];

  for (const annotation of sdkAnnotations) {
    if (annotation.type === 'file_citation') {
      const filename = annotation.filename;
      if (filename) {
        result.push({
          type: 'annotation',
          source: {
            type: 'file',
            filename,
            title: filename,
          },
          index: annotation.index ?? null,
        });
      }
    } else if (annotation.type === 'url_citation') {
      result.push({
        type: 'annotation',
        source: {
          type: 'url',
          url: annotation.url,
          title: annotation.title || annotation.url,
        },
        index: annotation.end_index ?? null,
      });
    }
  }

  return result;
}

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
 * @param options - Optional configuration
 * @param options.showThinking - Whether to emit reasoning/workflow events (default: true)
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
 * // Show thinking (default)
 * for await (const event of streamAgentResponse(agentContext, runnerStream)) {
 *   yield event;
 * }
 *
 * // Hide thinking
 * for await (const event of streamAgentResponse(agentContext, runnerStream, { showThinking: false })) {
 *   yield event;
 * }
 * ```
 */
export async function* streamAgentResponse<TContext = unknown>(
  context: AgentContext<TContext>,
  agentRunner: AsyncIterable<RunStreamEvent>,
  options: { showThinking?: boolean } = {}
): AsyncGenerator<ThreadStreamEvent> {
  const showThinking = options.showThinking ?? true;
  let currentMessageId: string | null = null;

  // Track text accumulation for each content part separately
  // Map of content_index -> accumulated text
  const contentPartTexts = new Map<number, string>();

  // Workflow/reasoning tracking
  let currentWorkflowId: string | null = null;
  let currentWorkflowTasks: Array<{ type: 'thought'; content: string; title?: string | null }> = [];
  let streamingThoughtIndex: number | null = null;

  try {
    // Merge Agent SDK stream with custom event queue
    // Convert AsyncIterables to AsyncIterators
    const agentIterator = agentRunner[Symbol.asyncIterator]();
    const eventsIterator = context._events[Symbol.asyncIterator]();
    const mergedStream = mergeAsyncGenerators(agentIterator, eventsIterator);

    for await (const event of mergedStream) {
      // Handle custom events from AgentContext (widgets, workflows, etc.)
      if (event instanceof EventWrapper) {
        const customEvent = event.event as ThreadStreamEvent;

        // Close workflow if a visible item is added after it
        if (
          customEvent.type === 'thread.item.added' ||
          customEvent.type === 'thread.item.done'
        ) {
          const item = customEvent.item;
          if (
            currentWorkflowId &&
            item.type !== 'client_tool_call' &&
            item.type !== 'hidden_context_item' &&
            showThinking
          ) {
            // End workflow before emitting custom item
            const workflowItem: WorkflowItem = {
              type: 'workflow',
              id: currentWorkflowId,
              thread_id: context.thread.id,
              created_at: new Date().toISOString(),
              workflow: {
                type: 'reasoning',
                tasks: currentWorkflowTasks,
                expanded: false,
                summary: null,
              },
            };

            yield {
              type: 'thread.item.done',
              item: workflowItem,
            };

            currentWorkflowId = null;
            currentWorkflowTasks = [];
            streamingThoughtIndex = null;
          }
        }

        // Emit the custom event
        yield customEvent;
        continue;
      }

      // Handle Agent SDK raw model stream events
      // Type guard: if not EventWrapper, it must be RunStreamEvent
      const agentEvent = event as RunStreamEvent;
      if (agentEvent.type === 'raw_model_stream_event') {
        const { data } = agentEvent;

        // Handle item creation (response.output_item.added)
        if (data.type === 'model' && data.event?.type === 'response.output_item.added') {
          const item = data.event.item;

          // Handle reasoning workflow creation
          if (item && item.type === 'reasoning') {
            // 🐛 DEBUG: Log the reasoning item to see what data it contains
            console.log('[StreamConverter] Reasoning item:', JSON.stringify(item, null, 2));

            // Only emit workflow events if showThinking is true
            if (showThinking) {
              // Close any existing workflow before starting new one
              if (currentWorkflowId) {
                const workflowItem: WorkflowItem = {
                  type: 'workflow',
                  id: currentWorkflowId,
                  thread_id: context.thread.id,
                  created_at: new Date().toISOString(),
                  workflow: {
                    type: 'reasoning',
                    tasks: currentWorkflowTasks,
                    expanded: false,
                    summary: null,
                  },
                };

                yield {
                  type: 'thread.item.done',
                  item: workflowItem,
                };
              }

              // Create new reasoning workflow
              currentWorkflowId = defaultGenerateItemId('workflow');
              currentWorkflowTasks = [];
              streamingThoughtIndex = null;

              const workflowItem: WorkflowItem = {
                type: 'workflow',
                id: currentWorkflowId,
                thread_id: context.thread.id,
                created_at: new Date().toISOString(),
                workflow: {
                  type: 'reasoning',
                  tasks: [],
                  expanded: true,
                  summary: null,
                },
              };

              yield {
                type: 'thread.item.added',
                item: workflowItem,
              };
            }
          }

          // Handle message creation
          else if (item && item.type === 'message' && item.role === 'assistant') {
            // Close workflow if one is active (message comes after reasoning)
            if (currentWorkflowId && showThinking) {
              const workflowItem: WorkflowItem = {
                type: 'workflow',
                id: currentWorkflowId,
                thread_id: context.thread.id,
                created_at: new Date().toISOString(),
                workflow: {
                  type: 'reasoning',
                  tasks: currentWorkflowTasks,
                  expanded: false,
                  summary: null,
                },
              };

              yield {
                type: 'thread.item.done',
                item: workflowItem,
              };

              currentWorkflowId = null;
              currentWorkflowTasks = [];
              streamingThoughtIndex = null;
            }

            // Reuse the Agent SDK's message ID for consistency
            currentMessageId = item.id || defaultGenerateItemId('message');

            // Clear content part text tracking for new message
            contentPartTexts.clear();

            // Guard: currentMessageId should always be set at this point
            if (!currentMessageId) {
              continue;
            }

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
            // Convert Agent SDK annotations to ChatKit format
            const annotations = part.annotations ? convertAnnotations(part.annotations) : [];

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
                  annotations,
                },
              },
            };
          }
        }

        // Handle text delta events
        else if (data.type === 'output_text_delta') {
          if (currentMessageId) {
            const delta = data.delta || '';
            const contentIndex = (data as any).content_index ?? 0;

            if (delta) {
              // Accumulate text for this specific content part
              const currentText = contentPartTexts.get(contentIndex) || '';
              contentPartTexts.set(contentIndex, currentText + delta);

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

        // Handle content part completion (response.output_text.done)
        else if (data.type === 'model' && data.event?.type === 'response.output_text.done') {
          if (currentMessageId) {
            const contentIndex = data.event.content_index ?? 0;
            const finalText = contentPartTexts.get(contentIndex) || '';

            // Emit content part done event with final text
            yield {
              type: 'thread.item.updated',
              item_id: currentMessageId,
              update: {
                type: 'assistant_message.content_part.done',
                content_index: contentIndex,
                content: {
                  type: 'output_text',
                  text: finalText,
                  annotations: [],
                },
              },
            };
          }
        }

        // Handle reasoning summary delta (streaming thoughts)
        else if (data.type === 'model' && data.event?.type === 'response.reasoning_summary_text.delta') {
          if (currentWorkflowId && showThinking) {
            const delta = data.event.delta || '';
            const summaryIndex = data.event.summary_index ?? 0;

            // Stream the first thought to show it immediately
            if (currentWorkflowTasks.length === 0) {
              streamingThoughtIndex = summaryIndex;
              const thought = {
                type: 'thought' as const,
                content: delta,
                title: null,
              };
              currentWorkflowTasks.push(thought);

              yield {
                type: 'thread.item.updated',
                item_id: currentWorkflowId,
                update: {
                  type: 'workflow.task.added',
                  task_index: 0,
                  task: thought,
                },
              };
            }
            // Continue streaming the current thought
            else if (streamingThoughtIndex === summaryIndex && currentWorkflowTasks[0]) {
              currentWorkflowTasks[0].content += delta;

              yield {
                type: 'thread.item.updated',
                item_id: currentWorkflowId,
                update: {
                  type: 'workflow.task.updated',
                  task_index: 0,
                  task: currentWorkflowTasks[0],
                },
              };
            }
          }
        }

        // Handle reasoning summary done (finalize thought)
        else if (data.type === 'model' && data.event?.type === 'response.reasoning_summary_text.done') {
          if (currentWorkflowId && showThinking) {
            const text = data.event.text || '';
            const summaryIndex = data.event.summary_index ?? 0;

            // Finalize the streaming thought
            if (streamingThoughtIndex === summaryIndex && currentWorkflowTasks[0]) {
              currentWorkflowTasks[0].content = text;

              yield {
                type: 'thread.item.updated',
                item_id: currentWorkflowId,
                update: {
                  type: 'workflow.task.updated',
                  task_index: 0,
                  task: currentWorkflowTasks[0],
                },
              };

              streamingThoughtIndex = null;
            }
            // Add a new thought (wasn't streamed)
            else {
              const thought = {
                type: 'thought' as const,
                content: text,
                title: null,
              };
              const taskIndex = currentWorkflowTasks.length;
              currentWorkflowTasks.push(thought);

              yield {
                type: 'thread.item.updated',
                item_id: currentWorkflowId,
                update: {
                  type: 'workflow.task.added',
                  task_index: taskIndex,
                  task: thought,
                },
              };
            }
          }
        }

        // Handle message completion (response.output_item.done for type "message")
        else if (data.type === 'model' && data.event?.type === 'response.output_item.done') {
          const item = data.event.item;

          // 🐛 DEBUG: Check if this is a reasoning item being completed
          if (item && item.type === 'reasoning') {
            console.log('[StreamConverter] Reasoning item DONE:', JSON.stringify(item, null, 2));
          }

          if (item && item.type === 'message' && item.role === 'assistant' && currentMessageId) {
            // Extract content parts with annotations from the SDK's complete item
            const contentParts = item.content?.map((part: any) => {
              if (part.type === 'output_text') {
                const annotations = part.annotations ? convertAnnotations(part.annotations) : [];
                return {
                  type: 'output_text' as const,
                  text: part.text || '',
                  annotations,
                };
              }
              // Handle other content types (refusal, etc.)
              return {
                type: 'output_text' as const,
                text: part.text || '',
                annotations: [],
              };
            }) || [];

            // Create final AssistantMessageItem
            const finalItem: AssistantMessageItem = {
              type: 'assistant_message',
              id: currentMessageId,
              thread_id: context.thread.id,
              created_at: new Date().toISOString(),
              content: contentParts,
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
            contentPartTexts.clear();
          }
        }
      }
    }
  } catch (error) {
    // Complete the queue to stop waiting for events
    context._events.complete();

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
  } finally {
    // Always complete the queue when done
    context._events.complete();
  }
}
