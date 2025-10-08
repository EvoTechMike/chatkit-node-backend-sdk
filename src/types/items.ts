/**
 * Thread item types - messages, widgets, tasks, etc.
 */

import type { InferenceOptions } from './base.js';
import type { Attachment } from './attachments.js';
import type { Source } from './sources.js';
import type { WidgetRoot } from './widgets.js';
import type { Task, Workflow } from './workflow.js';

/**
 * Base fields shared by all thread items.
 */
export interface ThreadItemBase {
  id: string;
  thread_id: string;
  created_at: string; // ISO 8601 datetime string
}

/**
 * User message content containing plaintext.
 */
export interface UserMessageTextContent {
  type: 'input_text';
  text: string;
}

/**
 * User message content representing an interactive tag.
 */
export interface UserMessageTagContent {
  type: 'input_tag';
  id: string;
  text: string;
  data: Record<string, unknown>;
  interactive: boolean;
}

/**
 * Union of allowed user message content payloads.
 */
export type UserMessageContent = UserMessageTextContent | UserMessageTagContent;

/**
 * Payload describing a user message submission.
 */
export interface UserMessageInput {
  content: UserMessageContent[];
  attachments: string[];
  quoted_text?: string | null;
  inference_options: InferenceOptions;
}

/**
 * Thread item representing a user message.
 */
export interface UserMessageItem extends ThreadItemBase {
  type: 'user_message';
  content: UserMessageContent[];
  attachments: Attachment[];
  quoted_text?: string | null;
  inference_options: InferenceOptions;
}

/**
 * Reference to supporting context attached to assistant output.
 */
export interface Annotation {
  type: 'annotation';
  source: Source;
  index?: number | null;
}

/**
 * Assistant message content consisting of text and annotations.
 */
export interface AssistantMessageContent {
  type: 'output_text';
  text: string;
  annotations: Annotation[];
}

/**
 * Thread item representing an assistant message.
 */
export interface AssistantMessageItem extends ThreadItemBase {
  type: 'assistant_message';
  content: AssistantMessageContent[];
}

/**
 * Thread item capturing a client tool call.
 */
export interface ClientToolCallItem extends ThreadItemBase {
  type: 'client_tool_call';
  status: 'pending' | 'completed';
  call_id: string;
  name: string;
  arguments: Record<string, unknown>;
  output?: unknown;
}

/**
 * Thread item containing widget content.
 */
export interface WidgetItem extends ThreadItemBase {
  type: 'widget';
  widget: WidgetRoot;
  copy_text?: string | null;
}

/**
 * Thread item containing a task.
 */
export interface TaskItem extends ThreadItemBase {
  type: 'task';
  task: Task;
}

/**
 * Thread item representing a workflow.
 */
export interface WorkflowItem extends ThreadItemBase {
  type: 'workflow';
  workflow: Workflow;
}

/**
 * Marker item indicating the assistant ends its turn.
 */
export interface EndOfTurnItem extends ThreadItemBase {
  type: 'end_of_turn';
}

/**
 * HiddenContext is never sent to the client. It's not officially part of ChatKit.
 * It is only used internally to store additional context in a specific place in the thread.
 */
export interface HiddenContextItem extends ThreadItemBase {
  type: 'hidden_context_item';
  content: unknown;
}

/**
 * Union of all thread item variants.
 */
export type ThreadItem =
  | UserMessageItem
  | AssistantMessageItem
  | ClientToolCallItem
  | WidgetItem
  | WorkflowItem
  | TaskItem
  | HiddenContextItem
  | EndOfTurnItem;

/**
 * Type guard for UserMessageItem.
 */
export function isUserMessage(item: ThreadItem): item is UserMessageItem {
  return item.type === 'user_message';
}

/**
 * Type guard for AssistantMessageItem.
 */
export function isAssistantMessage(item: ThreadItem): item is AssistantMessageItem {
  return item.type === 'assistant_message';
}

/**
 * Type guard for ClientToolCallItem.
 */
export function isClientToolCall(item: ThreadItem): item is ClientToolCallItem {
  return item.type === 'client_tool_call';
}

/**
 * Type guard for WidgetItem.
 */
export function isWidgetItem(item: ThreadItem): item is WidgetItem {
  return item.type === 'widget';
}

/**
 * Type guard for TaskItem.
 */
export function isTaskItem(item: ThreadItem): item is TaskItem {
  return item.type === 'task';
}

/**
 * Type guard for WorkflowItem.
 */
export function isWorkflowItem(item: ThreadItem): item is WorkflowItem {
  return item.type === 'workflow';
}

/**
 * Type guard for EndOfTurnItem.
 */
export function isEndOfTurn(item: ThreadItem): item is EndOfTurnItem {
  return item.type === 'end_of_turn';
}

/**
 * Type guard for HiddenContextItem.
 */
export function isHiddenContext(item: ThreadItem): item is HiddenContextItem {
  return item.type === 'hidden_context_item';
}
