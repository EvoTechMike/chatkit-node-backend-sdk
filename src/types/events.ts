/**
 * Event types - streaming events emitted to clients
 */

import type { IconName } from './base.js';
import type { Annotation, AssistantMessageContent, ThreadItem } from './items.js';
import type { Thread } from './thread.js';
import type { Task } from './workflow.js';
import type { WidgetComponent, WidgetRoot } from './widgets.js';

// ========== THREAD STREAM EVENTS ==========

/**
 * Event emitted when a thread is created.
 */
export interface ThreadCreatedEvent {
  type: 'thread.created';
  thread: Thread;
}

/**
 * Event emitted when a thread is updated.
 */
export interface ThreadUpdatedEvent {
  type: 'thread.updated';
  thread: Thread;
}

/**
 * Event emitted when a new item is added to a thread.
 */
export interface ThreadItemAddedEvent {
  type: 'thread.item.added';
  item: ThreadItem;
}

/**
 * Event emitted when a thread item is marked complete.
 */
export interface ThreadItemDoneEvent {
  type: 'thread.item.done';
  item: ThreadItem;
}

/**
 * Event emitted when a thread item is replaced.
 */
export interface ThreadItemReplacedEvent {
  type: 'thread.item.replaced';
  item: ThreadItem;
}

/**
 * Event emitted when a thread item is removed.
 */
export interface ThreadItemRemovedEvent {
  type: 'thread.item.removed';
  item_id: string;
}

// ========== THREAD ITEM UPDATE EVENTS ==========

/**
 * Event describing an update to an existing thread item.
 */
export interface ThreadItemUpdated {
  type: 'thread.item.updated';
  item_id: string;
  update: ThreadItemUpdate;
}

/**
 * Event emitted when new assistant content is appended.
 */
export interface AssistantMessageContentPartAdded {
  type: 'assistant_message.content_part.added';
  content_index: number;
  content: AssistantMessageContent;
}

/**
 * Event carrying incremental assistant text output.
 */
export interface AssistantMessageContentPartTextDelta {
  type: 'assistant_message.content_part.text_delta';
  content_index: number;
  delta: string;
}

/**
 * Event announcing a new annotation on assistant content.
 */
export interface AssistantMessageContentPartAnnotationAdded {
  type: 'assistant_message.content_part.annotation_added';
  content_index: number;
  annotation_index: number;
  annotation: Annotation;
}

/**
 * Event indicating an assistant content part is finalized.
 */
export interface AssistantMessageContentPartDone {
  type: 'assistant_message.content_part.done';
  content_index: number;
  content: AssistantMessageContent;
}

/**
 * Event streaming widget text deltas.
 */
export interface WidgetStreamingTextValueDelta {
  type: 'widget.streaming_text.value_delta';
  component_id: string;
  delta: string;
  done: boolean;
}

/**
 * Event published when the widget root changes.
 */
export interface WidgetRootUpdated {
  type: 'widget.root.updated';
  widget: WidgetRoot;
}

/**
 * Event emitted when a widget component updates.
 */
export interface WidgetComponentUpdated {
  type: 'widget.component.updated';
  component_id: string;
  component: WidgetComponent;
}

/**
 * Event emitted when a workflow task is added.
 */
export interface WorkflowTaskAdded {
  type: 'workflow.task.added';
  task_index: number;
  task: Task;
}

/**
 * Event emitted when a workflow task is updated.
 */
export interface WorkflowTaskUpdated {
  type: 'workflow.task.updated';
  task_index: number;
  task: Task;
}

/**
 * Union of possible updates applied to thread items.
 */
export type ThreadItemUpdate =
  | AssistantMessageContentPartAdded
  | AssistantMessageContentPartTextDelta
  | AssistantMessageContentPartAnnotationAdded
  | AssistantMessageContentPartDone
  | WidgetStreamingTextValueDelta
  | WidgetComponentUpdated
  | WidgetRootUpdated
  | WorkflowTaskAdded
  | WorkflowTaskUpdated;

// ========== STATUS EVENTS ==========

/**
 * Event providing incremental progress from the assistant.
 */
export interface ProgressUpdateEvent {
  type: 'progress_update';
  text: string;
  icon?: IconName | null;
}

/**
 * Event indicating an error occurred while processing a thread.
 */
export interface ErrorEvent {
  type: 'error';
  code?: string;
  message?: string | null;
  allow_retry: boolean;
}

/**
 * Event conveying a user-facing notice.
 */
export interface NoticeEvent {
  type: 'notice';
  level: 'info' | 'warning' | 'danger';
  /**
   * Supports markdown e.g. "You've reached your limit of 100 messages. [Upgrade](https://...) to a paid plan."
   */
  message: string;
  title?: string | null;
}

/**
 * Union of all streaming events emitted to clients.
 */
export type ThreadStreamEvent =
  | ThreadCreatedEvent
  | ThreadUpdatedEvent
  | ThreadItemDoneEvent
  | ThreadItemAddedEvent
  | ThreadItemUpdated
  | ThreadItemRemovedEvent
  | ThreadItemReplacedEvent
  | ProgressUpdateEvent
  | ErrorEvent
  | NoticeEvent;

// ========== TYPE GUARDS ==========

/**
 * Type guard for ThreadCreatedEvent.
 */
export function isThreadCreatedEvent(event: ThreadStreamEvent): event is ThreadCreatedEvent {
  return event.type === 'thread.created';
}

/**
 * Type guard for ThreadUpdatedEvent.
 */
export function isThreadUpdatedEvent(event: ThreadStreamEvent): event is ThreadUpdatedEvent {
  return event.type === 'thread.updated';
}

/**
 * Type guard for ThreadItemAddedEvent.
 */
export function isThreadItemAddedEvent(event: ThreadStreamEvent): event is ThreadItemAddedEvent {
  return event.type === 'thread.item.added';
}

/**
 * Type guard for ThreadItemDoneEvent.
 */
export function isThreadItemDoneEvent(event: ThreadStreamEvent): event is ThreadItemDoneEvent {
  return event.type === 'thread.item.done';
}

/**
 * Type guard for ThreadItemReplacedEvent.
 */
export function isThreadItemReplacedEvent(
  event: ThreadStreamEvent
): event is ThreadItemReplacedEvent {
  return event.type === 'thread.item.replaced';
}

/**
 * Type guard for ThreadItemRemovedEvent.
 */
export function isThreadItemRemovedEvent(
  event: ThreadStreamEvent
): event is ThreadItemRemovedEvent {
  return event.type === 'thread.item.removed';
}

/**
 * Type guard for ErrorEvent.
 */
export function isErrorEvent(event: ThreadStreamEvent): event is ErrorEvent {
  return event.type === 'error';
}

/**
 * Type guard for ProgressUpdateEvent.
 */
export function isProgressUpdateEvent(event: ThreadStreamEvent): event is ProgressUpdateEvent {
  return event.type === 'progress_update';
}

/**
 * Type guard for NoticeEvent.
 */
export function isNoticeEvent(event: ThreadStreamEvent): event is NoticeEvent {
  return event.type === 'notice';
}
