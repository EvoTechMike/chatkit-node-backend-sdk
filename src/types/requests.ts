/**
 * Request types - all ChatKit API request payloads
 */

import type { ActionConfig } from './actions.js';
import type { AttachmentCreateParams } from './attachments.js';
import type { FeedbackKind } from './base.js';
import type { UserMessageInput } from './items.js';
import type { ThreadStatus } from './thread.js';

/**
 * Base class for all request payloads.
 */
export interface BaseReq {
  /**
   * Arbitrary integration-specific metadata.
   */
  metadata?: Record<string, unknown>;
}

// ========== STREAMING REQUESTS ==========

/**
 * User input required to create a thread.
 */
export interface ThreadCreateParams {
  input: UserMessageInput;
}

/**
 * Request to create a new thread from a user message.
 */
export interface ThreadsCreateReq extends BaseReq {
  type: 'threads.create';
  params: ThreadCreateParams;
}

/**
 * Parameters for adding a user message to a thread.
 */
export interface ThreadAddUserMessageParams {
  thread_id: string;
  input: UserMessageInput;
}

/**
 * Request to append a user message to a thread.
 */
export interface ThreadsAddUserMessageReq extends BaseReq {
  type: 'threads.add_user_message';
  params: ThreadAddUserMessageParams;
}

/**
 * Parameters for recording tool output in a thread.
 */
export interface ThreadAddClientToolOutputParams {
  thread_id: string;
  result: unknown;
}

/**
 * Request to add a client tool's output to a thread.
 */
export interface ThreadsAddClientToolOutputReq extends BaseReq {
  type: 'threads.add_client_tool_output';
  params: ThreadAddClientToolOutputParams;
}

/**
 * Parameters specifying which item to retry.
 */
export interface ThreadRetryAfterItemParams {
  thread_id: string;
  item_id: string;
}

/**
 * Request to retry processing after a specific thread item.
 */
export interface ThreadsRetryAfterItemReq extends BaseReq {
  type: 'threads.retry_after_item';
  params: ThreadRetryAfterItemParams;
}

/**
 * Parameters describing the custom action to execute.
 */
export interface ThreadCustomActionParams {
  thread_id: string;
  item_id?: string | null;
  action: ActionConfig;
}

/**
 * Request to execute a custom action within a thread.
 */
export interface ThreadsCustomActionReq extends BaseReq {
  type: 'threads.custom_action';
  params: ThreadCustomActionParams;
}

/**
 * Union of request types that produce streaming responses.
 */
export type StreamingReq =
  | ThreadsCreateReq
  | ThreadsAddUserMessageReq
  | ThreadsAddClientToolOutputReq
  | ThreadsRetryAfterItemReq
  | ThreadsCustomActionReq;

// ========== NON-STREAMING REQUESTS ==========

/**
 * Parameters for retrieving a thread by id.
 */
export interface ThreadGetByIdParams {
  thread_id: string;
}

/**
 * Request to fetch a single thread by its identifier.
 */
export interface ThreadsGetByIdReq extends BaseReq {
  type: 'threads.get_by_id';
  params: ThreadGetByIdParams;
}

/**
 * Pagination parameters for listing threads.
 */
export interface ThreadListParams {
  limit?: number | null;
  order?: 'asc' | 'desc';
  after?: string | null;
}

/**
 * Request to list threads.
 */
export interface ThreadsListReq extends BaseReq {
  type: 'threads.list';
  params: ThreadListParams;
}

/**
 * Parameters for updating a thread's properties.
 */
export interface ThreadUpdateParams {
  thread_id: string;
  title: string;
  status?: ThreadStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Request to update thread metadata.
 */
export interface ThreadsUpdateReq extends BaseReq {
  type: 'threads.update';
  params: ThreadUpdateParams;
}

/**
 * Parameters identifying a thread to delete.
 */
export interface ThreadDeleteParams {
  thread_id: string;
}

/**
 * Request to delete a thread.
 */
export interface ThreadsDeleteReq extends BaseReq {
  type: 'threads.delete';
  params: ThreadDeleteParams;
}

/**
 * Pagination parameters for listing thread items.
 */
export interface ItemsListParams {
  thread_id: string;
  limit?: number | null;
  order?: 'asc' | 'desc';
  after?: string | null;
}

/**
 * Request to list items inside a thread.
 */
export interface ItemsListReq extends BaseReq {
  type: 'items.list';
  params: ItemsListParams;
}

/**
 * Parameters describing feedback targets and sentiment.
 */
export interface ItemFeedbackParams {
  thread_id: string;
  item_ids: string[];
  kind: FeedbackKind;
}

/**
 * Request to submit feedback on specific items.
 */
export interface ItemsFeedbackReq extends BaseReq {
  type: 'items.feedback';
  params: ItemFeedbackParams;
}

/**
 * Request to register a new attachment.
 */
export interface AttachmentsCreateReq extends BaseReq {
  type: 'attachments.create';
  params: AttachmentCreateParams;
}

/**
 * Parameters identifying an attachment to delete.
 */
export interface AttachmentDeleteParams {
  attachment_id: string;
}

/**
 * Request to remove an attachment.
 */
export interface AttachmentsDeleteReq extends BaseReq {
  type: 'attachments.delete';
  params: AttachmentDeleteParams;
}

/**
 * Union of request types that yield immediate responses.
 */
export type NonStreamingReq =
  | ThreadsGetByIdReq
  | ThreadsListReq
  | ThreadsUpdateReq
  | ThreadsDeleteReq
  | ItemsListReq
  | ItemsFeedbackReq
  | AttachmentsCreateReq
  | AttachmentsDeleteReq;

/**
 * Union of all ChatKit request types.
 */
export type ChatKitReq = StreamingReq | NonStreamingReq;

/**
 * Type guard to check if the given request should be processed as streaming.
 */
export function isStreamingReq(request: ChatKitReq): request is StreamingReq {
  return [
    'threads.create',
    'threads.add_user_message',
    'threads.add_client_tool_output',
    'threads.retry_after_item',
    'threads.custom_action',
  ].includes(request.type);
}

/**
 * Type guard to check if the given request should be processed as non-streaming.
 */
export function isNonStreamingReq(request: ChatKitReq): request is NonStreamingReq {
  return !isStreamingReq(request);
}
