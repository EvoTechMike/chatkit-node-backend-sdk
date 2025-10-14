import type {
  RunStreamEvent,
  RunItemStreamEvent,
  RunToolCallItem,
  RunToolCallOutputItem,
  RunHandoffCallItem,
  RunHandoffOutputItem
} from '@openai/agents';
import type { ThreadStreamEvent } from '../types/events.js';
import type { AssistantMessageItem, Annotation, WorkflowItem, ClientToolCallItem } from '../types/items.js';
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
  const fallbackShowThinking = options.showThinking ?? true;
  let currentMessageId: string | null = null;

  // Track current agent for dynamic showThinking lookup
  let currentAgentName: string = (context as any).currentAgent || 'unknown';

  // Helper to get showThinking for current agent
  const getShowThinking = (): boolean => {
    const agentConfigs = (context as any).agentConfigs;
    if (agentConfigs && Array.isArray(agentConfigs)) {
      const agentConfig = agentConfigs.find((a: any) => a.name === currentAgentName);
      if (agentConfig) {
        return agentConfig.showThinking || false;
      }
    }
    return fallbackShowThinking;
  };

  // Track text accumulation for each content part separately
  // Map of content_index -> accumulated text
  const contentPartTexts = new Map<number, string>();

  // Workflow/reasoning tracking
  let currentWorkflowId: string | null = null;
  let currentWorkflowCreatedAt: string | null = null;
  let currentWorkflowTasks: Array<{ type: 'thought'; content: string; title?: string | null }> = [];
  let streamingThoughtIndex: number | null = null;

  // Tool call tracking for client-side tool execution
  let currentToolCall: string | null = null;
  let currentToolCallItemId: string | null = null;

  // Tool call tracking for database logging (maps callId -> start timestamp)
  const toolCallTimestamps = new Map<string, number>();

  try {
    // Merge Agent SDK stream with custom event queue
    // Convert AsyncIterables to AsyncIterators
    const agentIterator = agentRunner[Symbol.asyncIterator]();
    const eventsIterator = context._events[Symbol.asyncIterator]();

    // Complete the events queue when the agent stream finishes
    const mergedStream = mergeAsyncGenerators(
      agentIterator,
      eventsIterator,
      () => {
        console.log('[StreamConverter] 🎯 Agent stream completed, closing event queue...');
        context._events.complete();
      }
    );

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
            getShowThinking()
          ) {
            // End workflow before emitting custom item (always emit if showThinking is true)
            const workflowItem: WorkflowItem = {
              type: 'workflow',
              id: currentWorkflowId,
              thread_id: context.thread.id,
              created_at: currentWorkflowCreatedAt || new Date().toISOString(),
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
            currentWorkflowCreatedAt = null;
            currentWorkflowTasks = [];
            streamingThoughtIndex = null;
          }
        }

        // Emit the custom event
        yield customEvent;
        continue;
      }

      // Handle Agent SDK events
      // Type guard: if not EventWrapper, it must be RunStreamEvent
      const agentEvent = event as RunStreamEvent;

      // Handle tool call events for client-side tool execution
      if (agentEvent.type === 'run_item_stream_event') {
        const item = agentEvent.item;

        // Check if this is a tool call item with a function call
        if (
          item &&
          item.type === 'tool_call_item' &&
          (item as any).raw_item?.type === 'function_call'
        ) {
          const rawItem = (item as any).raw_item;
          currentToolCall = rawItem.call_id || null;
          currentToolCallItemId = rawItem.id || null;
        }

        // Log tool calls from SDK stream to database
        const itemEvent = agentEvent as RunItemStreamEvent;

        // Tool call started
        if (itemEvent.name === 'tool_called' && itemEvent.item.type === 'tool_call_item') {
          const toolItem = itemEvent.item as RunToolCallItem;
          const rawItem = toolItem.rawItem;

          if (rawItem.type === 'function_call') {
            const callId = rawItem.callId;
            toolCallTimestamps.set(callId, Date.now());

            const toolCallItem = {
              id: `tool_${callId}`,
              type: 'server_tool_call',
              thread_id: context.thread.id,
              name: rawItem.name,
              status: 'running',
              arguments: JSON.parse(rawItem.arguments || '{}'),
              created_at: new Date().toISOString()
            };

            console.log(`[StreamConverter] 🔧 Tool called: ${rawItem.name} (${callId})`);

            await context.store.addThreadItem(
              context.thread.id,
              toolCallItem as any,
              context.requestContext
            );
          }
        }

        // Tool call finished
        else if (itemEvent.name === 'tool_output' && itemEvent.item.type === 'tool_call_output_item') {
          const outputItem = itemEvent.item as RunToolCallOutputItem;
          const rawItem = outputItem.rawItem;

          if (rawItem.type === 'function_call_result') {
            const callId = rawItem.callId;
            const startTime = toolCallTimestamps.get(callId);
            const duration = startTime ? Date.now() - startTime : null;

            const toolResultItem = {
              id: `tool_${callId}_result`,
              type: 'server_tool_call',
              thread_id: context.thread.id,
              name: rawItem.name,
              status: rawItem.status === 'completed' ? 'completed' : 'failed',
              result: outputItem.output,
              duration_ms: duration,
              created_at: new Date().toISOString()
            };

            console.log(`[StreamConverter] ✅ Tool completed: ${rawItem.name} (${duration}ms)`);

            await context.store.addThreadItem(
              context.thread.id,
              toolResultItem as any,
              context.requestContext
            );

            toolCallTimestamps.delete(callId);
          }
        }

        // Handoff requested
        else if (itemEvent.name === 'handoff_requested' && itemEvent.item.type === 'handoff_call_item') {
          const handoffItem = itemEvent.item as RunHandoffCallItem;
          const rawItem = handoffItem.rawItem;

          if (rawItem.type === 'function_call') {
            const callId = rawItem.callId;
            const targetAgent = rawItem.name; // Handoff function name is the target agent

            // Parse arguments to get reason
            const args = JSON.parse(rawItem.arguments || '{}');
            const reason = args.reason || `Handoff to ${targetAgent}`;

            const handoffRequestItem = {
              id: `handoff_${callId}`,
              type: 'handoff',
              thread_id: context.thread.id,
              from: handoffItem.agent.name,
              to: targetAgent,
              reason,
              status: 'requested',
              created_at: new Date().toISOString()
            };

            console.log(`[StreamConverter] 🔄 Handoff requested: ${handoffItem.agent.name} → ${targetAgent}`);

            await context.store.addThreadItem(
              context.thread.id,
              handoffRequestItem as any,
              context.requestContext
            );
          }
        }

        // Handoff occurred (completed)
        else if (itemEvent.name === 'handoff_occurred' && itemEvent.item.type === 'handoff_output_item') {
          const handoffOutputItem = itemEvent.item as RunHandoffOutputItem;
          const rawItem = handoffOutputItem.rawItem;

          if (rawItem.type === 'function_call_result') {
            const callId = rawItem.callId;

            // Update current agent tracking
            currentAgentName = handoffOutputItem.targetAgent.name;
            console.log(`[StreamConverter] 🔄 Agent switched to: ${currentAgentName} (showThinking: ${getShowThinking()})`);

            const handoffCompleteItem = {
              id: `handoff_${callId}`,
              type: 'handoff',
              thread_id: context.thread.id,
              from: handoffOutputItem.sourceAgent.name,
              to: handoffOutputItem.targetAgent.name,
              reason: '', // Reason was already in the request
              status: rawItem.status === 'completed' ? 'completed' : 'failed',
              created_at: new Date().toISOString()
            };

            console.log(`[StreamConverter] ✅ Handoff completed: ${handoffOutputItem.sourceAgent.name} → ${handoffOutputItem.targetAgent.name}`);

            await context.store.saveItem(
              context.thread.id,
              handoffCompleteItem as any,
              context.requestContext
            );
          }
        }
      }

      // Handle Agent SDK raw model stream events
      if (agentEvent.type === 'raw_model_stream_event') {
        const { data } = agentEvent;

        // Handle item creation (response.output_item.added)
        if (data.type === 'model' && data.event?.type === 'response.output_item.added') {
          const item = data.event.item;

          // Handle reasoning item added - create workflow now so delta handlers can populate it
          if (item && item.type === 'reasoning') {
            console.log('[StreamConverter] Reasoning item ADDED - creating workflow for thinking');

            // Create workflow immediately if showThinking is true
            // Summary will be populated by response.reasoning_summary_text.delta/done events
            if (getShowThinking()) {
              // Close any existing workflow before starting new one (always emit if showThinking is true)
              if (currentWorkflowId) {
                const workflowItem: WorkflowItem = {
                  type: 'workflow',
                  id: currentWorkflowId,
                  thread_id: context.thread.id,
                  created_at: currentWorkflowCreatedAt || new Date().toISOString(),
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
              currentWorkflowCreatedAt = new Date().toISOString();
              currentWorkflowTasks = [];
              streamingThoughtIndex = null;

              const workflowItem: WorkflowItem = {
                type: 'workflow',
                id: currentWorkflowId,
                thread_id: context.thread.id,
                created_at: currentWorkflowCreatedAt,
                workflow: {
                  type: 'reasoning',
                  tasks: [],
                  expanded: true,
                  summary: null,
                },
              };

              console.log('[StreamConverter] ✅ Creating workflow item with ID:', currentWorkflowId);

              yield {
                type: 'thread.item.added',
                item: workflowItem,
              };
            }
          }

          // Handle message creation
          else if (item && item.type === 'message' && item.role === 'assistant') {
            // Close workflow if one is active (message comes after reasoning)
            // Note: currentWorkflowId only exists if showThinking was true, so always emit it
            if (currentWorkflowId) {
              const workflowItem: WorkflowItem = {
                type: 'workflow',
                id: currentWorkflowId,
                thread_id: context.thread.id,
                created_at: currentWorkflowCreatedAt || new Date().toISOString(),
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
              currentWorkflowCreatedAt = null;
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
          if (currentWorkflowId && getShowThinking()) {
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
          if (currentWorkflowId && getShowThinking()) {
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

          // Handle reasoning item completion - workflow already created at 'added' time
          if (item && item.type === 'reasoning') {
            console.log('[StreamConverter] Reasoning item DONE - workflow already populated by delta/done handlers');
            // Workflow was created at response.output_item.added time
            // Tasks were populated by response.reasoning_summary_text.delta/done events
            // No action needed here
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

    // Re-throw to exit
    return;
  }

  // NOTE: No need to call complete() here - it's called by mergeAsyncGenerators callback
  // when the agent stream finishes, which ensures the events queue drains before the loop exits

  // Emit client tool call if one was set by a tool
  // This must happen AFTER the try block completes and AFTER completing the queue
  if (context.clientToolCall) {
    console.log('[StreamConverter] 🔔 Client tool call detected! Emitting event...');
    const itemId = currentToolCallItemId || context.store.generateItemId(
      'tool_call',
      context.thread,
      context.requestContext
    );

    const callId = currentToolCall || context.store.generateItemId(
      'tool_call',
      context.thread,
      context.requestContext
    );

    const clientToolCallItem: ClientToolCallItem = {
      type: 'client_tool_call',
      id: itemId,
      thread_id: context.thread.id,
      created_at: new Date().toISOString(),
      status: 'pending',
      call_id: callId,
      name: context.clientToolCall.name,
      arguments: context.clientToolCall.arguments,
    };

    console.log('[StreamConverter] 📤 Emitting client_tool_call:', JSON.stringify(clientToolCallItem, null, 2));

    // Emit the client tool call item
    yield {
      type: 'thread.item.done',
      item: clientToolCallItem,
    };

    console.log('[StreamConverter] ✅ Client tool call event emitted successfully');
  }

  console.log('[StreamConverter] 🏁 Stream complete - generator ending');
}
