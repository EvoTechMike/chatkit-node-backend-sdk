/**
 * Input Thread Item Converter
 *
 * Converts ChatKit ThreadItems to Agent SDK input format.
 * This is the INPUT direction (Database → Agent).
 *
 * This is the missing piece from the TypeScript SDK that exists in Python SDK.
 * Enables the AI to see widgets, workflows, and tasks from conversation history.
 *
 * Based on: chatkit-python/chatkit/agents.py lines 628-933
 */

import type {
  ThreadItem,
  UserMessageItem,
  AssistantMessageItem,
  WidgetItem,
  WorkflowItem,
  TaskItem,
  ClientToolCallItem,
  EndOfTurnItem,
  HiddenContextItem,
  UserMessageContent,
} from '../types/items.js';
import type { Attachment } from '../types/attachments.js';

/**
 * Type representing Agent SDK input items.
 * Matches OpenAI Responses API input format.
 */
export type ResponseInputItem =
  | ResponseInputMessage
  | ResponseFunctionToolCall
  | ResponseFunctionCallOutput;

export interface ResponseInputMessage {
  type: 'message';
  role: 'user' | 'assistant';
  content: ResponseInputContentParam[];
}

export type ResponseInputContentParam =
  | ResponseInputTextParam
  | ResponseInputImageParam;

export interface ResponseInputTextParam {
  type: 'input_text';
  text: string;
}

export interface ResponseInputImageParam {
  type: 'input_image';
  source: {
    type: 'url';
    url: string;
  };
}

export interface ResponseFunctionToolCall {
  type: 'function_call';
  call_id: string;
  name: string;
  arguments: string;
}

export interface ResponseFunctionCallOutput {
  type: 'function_call_output';
  call_id: string;
  output: string;
}

/**
 * Converts ChatKit thread items to Agent SDK input format.
 *
 * This class provides the missing INPUT conversion functionality that exists
 * in Python SDK but was missing in TypeScript SDK.
 *
 * Key capabilities:
 * - Convert widgets to descriptive text for the AI
 * - Convert workflows to task summaries
 * - Convert full thread history to agent input
 * - Handle attachments, tags, and special content types
 *
 * @example Basic usage
 * ```typescript
 * const converter = new InputThreadItemConverter();
 *
 * // Load thread history
 * const items = await store.loadThreadItems(threadId, null, 50, 'asc', context);
 *
 * // Convert to agent input
 * const agentInput = await converter.toAgentInput(items.data);
 *
 * // Pass to Agent SDK
 * const result = await run(agent, agentInput, { context });
 * ```
 *
 * @example Custom attachment handling
 * ```typescript
 * class MyConverter extends InputThreadItemConverter {
 *   async attachmentToMessageContent(attachment: Attachment): Promise<ResponseInputContentParam> {
 *     if (attachment.mime_type.startsWith('image/')) {
 *       return {
 *         type: 'input_image',
 *         source: { type: 'url', url: attachment.url }
 *       };
 *     }
 *     return {
 *       type: 'input_text',
 *       text: `[File: ${attachment.filename}]`
 *     };
 *   }
 * }
 * ```
 */
export class InputThreadItemConverter {
  /**
   * Convert an attachment to message content.
   *
   * REQUIRED when attachments are used in your application.
   * Override this method to handle your attachment storage system.
   *
   * @param attachment - The attachment to convert
   * @returns Message content representing the attachment
   * @throws Error if not implemented and attachments are present
   */
  async attachmentToMessageContent(
    _attachment: Attachment
  ): Promise<ResponseInputContentParam> {
    throw new Error(
      'An Attachment was included in a UserMessageItem but ' +
      'InputThreadItemConverter.attachmentToMessageContent() was not implemented. ' +
      'Override this method to handle attachments.'
    );
  }

  /**
   * Convert a tag (@-mention) to message content.
   *
   * REQUIRED when tags are used in your application.
   * Tags allow users to reference entities like "@customer-123" or "@ticket-456".
   *
   * @param tag - The tag content from user message
   * @returns Message content providing context about the tagged entity
   * @throws Error if not implemented and tags are present
   *
   * @example
   * ```typescript
   * async tagToMessageContent(tag: { type: 'input_tag'; text: string }): Promise<ResponseInputContentParam> {
   *   // Lookup entity by tag
   *   const customer = await db.customers.findByTag(tag.text);
   *   return {
   *     type: 'input_text',
   *     text: `Customer: ${customer.name} (ID: ${customer.id})`
   *   };
   * }
   * ```
   */
  tagToMessageContent(
    _tag: Extract<UserMessageContent, { type: 'input_tag' }>
  ): ResponseInputContentParam {
    throw new Error(
      'A Tag was included in a UserMessageItem but ' +
      'InputThreadItemConverter.tagToMessageContent() is not implemented. ' +
      'Override this method to handle tags.'
    );
  }

  /**
   * Convert a HiddenContextItem to agent input.
   *
   * REQUIRED when HiddenContextItems are used.
   * These are system-level context items not visible to users.
   *
   * @param item - The hidden context item
   * @returns Input items for the agent, or null to skip
   * @throws Error if not implemented and hidden context items are present
   */
  hiddenContextToInput(
    _item: HiddenContextItem
  ): ResponseInputItem | ResponseInputItem[] | null {
    throw new Error(
      'HiddenContextItem was present but ' +
      'InputThreadItemConverter.hiddenContextToInput() was not implemented. ' +
      'Override this method to handle hidden context items.'
    );
  }

  /**
   * Convert a WidgetItem to agent input.
   *
   * By default, converts widget to JSON description so AI knows it was displayed.
   * Override to customize how widgets are described to the AI.
   *
   * @param item - The widget item from thread history
   * @returns Input message describing the widget, or null to skip
   *
   * @example Default behavior
   * ```typescript
   * // Widget item with id "wid_123" becomes:
   * {
   *   type: 'message',
   *   role: 'user',
   *   content: [{
   *     type: 'input_text',
   *     text: 'The following graphical UI widget (id: wid_123) was displayed to the user: {"type":"Card","children":[...]}'
   *   }]
   * }
   * ```
   */
  widgetToInput(item: WidgetItem): ResponseInputItem | null {
    return {
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `The following graphical UI widget (id: ${item.id}) was displayed to the user: ${JSON.stringify(item.widget)}`,
        },
      ],
    };
  }

  /**
   * Convert a WorkflowItem to agent input messages.
   *
   * By default, workflows are SKIPPED from AI context (returns empty array).
   * Workflows are visual progress indicators - the AI doesn't need to see them in history.
   * The actual tool result contains the important information.
   *
   * Note: Workflows remain visible in the UI when loading thread history.
   * They're only skipped from the AI's conversation context.
   *
   * @param item - The workflow item from thread history
   * @returns Empty array (workflows skipped by default)
   *
   * @example To include workflows in AI context, override this method:
   * ```typescript
   * workflowToInput(item: WorkflowItem): ResponseInputItem[] {
   *   if (item.workflow.type === 'reasoning') {
   *     return []; // Skip AI's own thinking
   *   }
   *
   *   const messages: ResponseInputItem[] = [];
   *   for (const task of item.workflow.tasks) {
   *     if (task.type === 'custom' && (task.title || task.content)) {
   *       const taskText = task.title && task.content
   *         ? `${task.title}: ${task.content}`
   *         : task.title || task.content;
   *       messages.push({
   *         type: 'message',
   *         role: 'user',
   *         content: [{
   *           type: 'input_text',
   *           text: `Task performed: ${taskText}`
   *         }]
   *       });
   *     }
   *   }
   *   return messages;
   * }
   * ```
   */
  workflowToInput(_item: WorkflowItem): ResponseInputItem[] {
    // Skip all workflows by default - they're UI progress indicators
    // The actual tool result contains the important information
    return [];
  }

  /**
   * Convert a TaskItem to agent input.
   *
   * By default, converts custom tasks to a message describing the work performed.
   *
   * @param item - The task item from thread history
   * @returns Input message describing the task, or null to skip
   */
  taskToInput(item: TaskItem): ResponseInputItem | null {
    if (item.task.type !== 'custom' || (!item.task.title && !item.task.content)) {
      return null;
    }

    const title = item.task.title || '';
    const content = item.task.content || '';
    const taskText = title && content ? `${title}: ${content}` : title || content;

    return {
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `A message was displayed to the user that the following task was performed:\n<Task>${taskText}</Task>`,
        },
      ],
    };
  }

  /**
   * Convert a UserMessageItem to agent input.
   *
   * Handles:
   * - Text content
   * - Attachments (images, files)
   * - Tags (@-mentions)
   * - Quoted text (reply-to context)
   *
   * @param item - The user message item
   * @param isLastMessage - Whether this is the last message in the sequence (affects quoted text handling)
   * @returns Array of input messages (user text + optional context messages)
   *
   * @example
   * ```typescript
   * // User message with text and tag becomes:
   * [
   *   {
   *     type: 'message',
   *     role: 'user',
   *     content: [
   *       { type: 'input_text', text: 'Show me details for @customer-123' }
   *     ]
   *   },
   *   {
   *     type: 'message',
   *     role: 'user',
   *     content: [
   *       {
   *         type: 'input_text',
   *         text: '# User-provided context for @-mentions\n...\nCustomer: John Doe (ID: 123)'
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  async userMessageToInput(
    item: UserMessageItem,
    isLastMessage: boolean = true
  ): Promise<ResponseInputItem[]> {
    // Build user text exactly as typed, rendering tags as @key
    const messageTextParts: string[] = [];
    const rawTags: Array<Extract<UserMessageContent, { type: 'input_tag' }>> = [];

    for (const part of item.content) {
      if (part.type === 'input_text') {
        messageTextParts.push(part.text);
      } else if (part.type === 'input_tag') {
        messageTextParts.push(`@${part.text}`);
        rawTags.push(part);
      }
    }

    // Build main user message with text and attachments
    const userTextItem: ResponseInputMessage = {
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: messageTextParts.join(''),
        },
        // Add attachment content
        ...(await Promise.all(
          item.attachments.map((a) => this.attachmentToMessageContent(a))
        )),
      ],
    };

    // Build context items (prepend later): quoted text and @-mention context
    const contextItems: ResponseInputItem[] = [];

    // Add quoted text context (only for last message)
    if (item.quoted_text && isLastMessage) {
      contextItems.push({
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `The user is referring to this in particular:\n${item.quoted_text}`,
          },
        ],
      });
    }

    // Add @-mention context
    if (rawTags.length > 0) {
      // Dedupe tags (preserve order)
      const seen = new Set<string>();
      const uniqueTags: typeof rawTags = [];
      for (const tag of rawTags) {
        if (!seen.has(tag.text)) {
          seen.add(tag.text);
          uniqueTags.push(tag);
        }
      }

      // Resolve tags to content
      const tagContent: ResponseInputContentParam[] = uniqueTags.map((tag) =>
        this.tagToMessageContent(tag)
      );

      if (tagContent.length > 0) {
        contextItems.push({
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                '# User-provided context for @-mentions\n' +
                '- When referencing resolved entities, use their canonical names **without** \'@\'.\n' +
                '- The \'@\' form appears only in user text and should not be echoed.',
            },
            ...tagContent,
          ],
        });
      }
    }

    // Return: [user text, ...context items]
    return [userTextItem, ...contextItems];
  }

  /**
   * Convert an AssistantMessageItem to agent input.
   *
   * By default, SKIPS assistant messages (returns null) to avoid conflicts with previousResponseId.
   * The Agents SDK doesn't handle explicit assistant messages well in conversation history.
   *
   * Override this method if you need assistant messages in history (not recommended).
   *
   * @param item - The assistant message item
   * @returns null (assistant messages skipped by default)
   */
  async assistantMessageToInput(
    _item: AssistantMessageItem
  ): Promise<ResponseInputItem | null> {
    // Skip assistant messages - they conflict with previousResponseId
    // and the Agents SDK doesn't handle them well anyway
    return null;
  }

  /**
   * Convert a ClientToolCallItem to agent input.
   *
   * Converts both the tool call and its result to agent input format.
   * Skips pending tool calls (not yet completed).
   *
   * @param item - The client tool call item
   * @returns Array of [function_call, function_call_output], or empty array if pending
   */
  async clientToolCallToInput(
    item: ClientToolCallItem
  ): Promise<ResponseInputItem[]> {
    if (item.status === 'pending') {
      // Filter out pending tool calls - they cannot be sent to the model
      return [];
    }

    return [
      {
        type: 'function_call',
        call_id: item.call_id,
        name: item.name,
        arguments: JSON.stringify(item.arguments),
      },
      {
        type: 'function_call_output',
        call_id: item.call_id,
        output: JSON.stringify(item.output),
      },
    ];
  }

  /**
   * Convert an EndOfTurnItem to agent input.
   *
   * These are UI hints for turn boundaries - not sent to the model.
   *
   * @param item - The end of turn item
   * @returns null (always skipped)
   */
  async endOfTurnToInput(_item: EndOfTurnItem): Promise<null> {
    // Only used for UI hints - you shouldn't need to override this
    return null;
  }

  /**
   * Internal: Convert a single thread item to agent input items.
   * Routes to appropriate conversion method based on item type.
   */
  private async threadItemToInputItems(
    item: ThreadItem,
    isLastMessage: boolean = true
  ): Promise<ResponseInputItem[]> {
    let result: ResponseInputItem | ResponseInputItem[] | null;

    switch (item.type) {
      case 'user_message':
        result = await this.userMessageToInput(item, isLastMessage);
        break;
      case 'assistant_message':
        result = await this.assistantMessageToInput(item);
        break;
      case 'client_tool_call':
        result = await this.clientToolCallToInput(item);
        break;
      case 'end_of_turn':
        result = await this.endOfTurnToInput(item);
        break;
      case 'widget':
        result = this.widgetToInput(item);
        break;
      case 'workflow':
        result = this.workflowToInput(item);
        break;
      case 'task':
        result = this.taskToInput(item);
        break;
      case 'hidden_context_item':
        result = this.hiddenContextToInput(item);
        break;
      default:
        // Exhaustive check
        const _exhaustive: never = item;
        throw new Error(`Unknown thread item type: ${(_exhaustive as any).type}`);
    }

    // Normalize to array
    if (result === null) {
      return [];
    }
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Convert full thread history to agent input.
   *
   * This is the main method you'll use. Pass in an array of ThreadItems
   * (typically loaded from your store) and get back agent input ready
   * to send to the Agent SDK.
   *
   * @param items - Array of thread items (usually from store.loadThreadItems())
   * @returns Array of input items for Agent SDK
   *
   * @example
   * ```typescript
   * // Load recent thread history
   * const historyResult = await store.loadThreadItems(
   *   threadId,
   *   null,  // after
   *   50,    // limit
   *   'asc', // chronological order
   *   context
   * );
   *
   * // Convert to agent input (includes widgets, workflows, tasks!)
   * const converter = new InputThreadItemConverter();
   * const agentInput = await converter.toAgentInput(historyResult.data);
   *
   * // Pass to agent
   * const result = await run(agent, agentInput, {
   *   stream: true,
   *   context: agentContext
   *   // Note: Don't use previousResponseId when using manual history
   * });
   * ```
   */
  async toAgentInput(items: ThreadItem[]): Promise<ResponseInputItem[]> {
    // Shallow copy in case caller mutates the list while we're iterating
    const itemsCopy = [...items];
    const output: ResponseInputItem[] = [];

    for (let i = 0; i < itemsCopy.length; i++) {
      const item = itemsCopy[i]!;
      const isLast = i === itemsCopy.length - 1;

      const converted = await this.threadItemToInputItems(item, isLast);
      output.push(...converted);
    }

    return output;
  }
}

/**
 * Default converter instance.
 * Use this for simple cases without custom attachment/tag handling.
 */
export const defaultInputConverter = new InputThreadItemConverter();
