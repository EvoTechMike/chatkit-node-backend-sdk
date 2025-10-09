/**
 * ChatKit Node.js SDK
 *
 * TypeScript SDK for building custom ChatKit backends
 */

// ========== BASE TYPES ==========
export type {
  Page,
  InferenceOptions,
  ToolChoice,
  FeedbackKind,
  IconName,
} from './types/base.js';

// ========== THREAD TYPES ==========
export type {
  ThreadStatus,
  ActiveStatus,
  LockedStatus,
  ClosedStatus,
  ThreadMetadata,
  Thread,
} from './types/thread.js';
export {
  isActiveStatus,
  isLockedStatus,
  isClosedStatus,
} from './types/thread.js';

// ========== ATTACHMENT TYPES ==========
export type {
  Attachment,
  FileAttachment,
  ImageAttachment,
  AttachmentCreateParams,
} from './types/attachments.js';
export {
  isFileAttachment,
  isImageAttachment,
} from './types/attachments.js';

// ========== SOURCE TYPES ==========
export type {
  Source,
  URLSource,
  FileSource,
  EntitySource,
} from './types/sources.js';
export {
  isURLSource,
  isFileSource,
  isEntitySource,
} from './types/sources.js';

// ========== WORKFLOW AND TASK TYPES ==========
export type {
  Task,
  CustomTask,
  SearchTask,
  ThoughtTask,
  FileTask,
  ImageTask,
  Workflow,
  WorkflowSummary,
  CustomSummary,
  DurationSummary,
} from './types/workflow.js';
export {
  isCustomTask,
  isSearchTask,
  isThoughtTask,
  isFileTask,
  isImageTask,
} from './types/workflow.js';

// ========== ITEM TYPES ==========
export type {
  ThreadItem,
  UserMessageItem,
  AssistantMessageItem,
  ClientToolCallItem,
  WidgetItem,
  TaskItem,
  WorkflowItem,
  EndOfTurnItem,
  HiddenContextItem,
  UserMessageContent,
  UserMessageTextContent,
  UserMessageTagContent,
  UserMessageInput,
  AssistantMessageContent,
  Annotation,
} from './types/items.js';
export {
  isUserMessage,
  isAssistantMessage,
  isClientToolCall,
  isWidgetItem,
  isTaskItem,
  isWorkflowItem,
  isEndOfTurn,
  isHiddenContext,
} from './types/items.js';

// ========== REQUEST TYPES ==========
export type {
  ChatKitReq,
  StreamingReq,
  NonStreamingReq,
  ThreadsCreateReq,
  ThreadsAddUserMessageReq,
  ThreadsAddClientToolOutputReq,
  ThreadsRetryAfterItemReq,
  ThreadsCustomActionReq,
  ThreadsGetByIdReq,
  ThreadsListReq,
  ThreadsUpdateReq,
  ThreadsDeleteReq,
  ItemsListReq,
  ItemsFeedbackReq,
  AttachmentsCreateReq,
  AttachmentsDeleteReq,
  ThreadCreateParams,
  ThreadAddUserMessageParams,
  ThreadAddClientToolOutputParams,
  ThreadRetryAfterItemParams,
  ThreadCustomActionParams,
  ThreadGetByIdParams,
  ThreadListParams,
  ThreadUpdateParams,
  ThreadDeleteParams,
  ItemsListParams,
  ItemFeedbackParams,
  AttachmentDeleteParams,
} from './types/requests.js';
export {
  isStreamingReq,
  isNonStreamingReq,
} from './types/requests.js';

// ========== EVENT TYPES ==========
export type {
  ThreadStreamEvent,
  ThreadCreatedEvent,
  ThreadUpdatedEvent,
  ThreadItemAddedEvent,
  ThreadItemDoneEvent,
  ThreadItemReplacedEvent,
  ThreadItemRemovedEvent,
  ThreadItemUpdated,
  ThreadItemUpdate,
  AssistantMessageContentPartAdded,
  AssistantMessageContentPartTextDelta,
  AssistantMessageContentPartAnnotationAdded,
  AssistantMessageContentPartDone,
  WidgetStreamingTextValueDelta,
  WidgetRootUpdated,
  WidgetComponentUpdated,
  WorkflowTaskAdded,
  WorkflowTaskUpdated,
  ProgressUpdateEvent,
  ErrorEvent,
  NoticeEvent,
} from './types/events.js';
export {
  isThreadCreatedEvent,
  isThreadUpdatedEvent,
  isThreadItemAddedEvent,
  isThreadItemDoneEvent,
  isThreadItemReplacedEvent,
  isThreadItemRemovedEvent,
  isErrorEvent,
  isProgressUpdateEvent,
  isNoticeEvent,
} from './types/events.js';

// ========== ACTION TYPES ==========
export type {
  Handler,
  LoadingBehavior,
  ActionConfig,
} from './types/actions.js';

// ========== WIDGET TYPES ==========
export type {
  WidgetComponent,
  WidgetRoot,
  WidgetIcon,
} from './types/widgets.js';

// ========== STORE TYPES ==========
export type {
  StoreItemType,
} from './types/store.js';
export {
  NotFoundError,
} from './types/store.js';

// ========== ERROR TYPES ==========
export {
  ErrorCode,
  StreamError,
  CustomStreamError,
} from './errors/index.js';

// ========== SERVER CLASSES ==========
export {
  ChatKitServer,
  StreamingResult,
  NonStreamingResult,
} from './server/index.js';

// ========== STORE CLASSES ==========
export {
  Store,
  AttachmentStore,
  NotFoundError as StoreNotFoundError,
} from './store/index.js';

// ========== UTILITIES ==========
export {
  generateId,
  defaultGenerateThreadId,
  defaultGenerateItemId,
  defaultGenerateAttachmentId,
} from './utils/id.js';
export type {
  Logger,
} from './utils/logger.js';
export {
  defaultLogger,
} from './utils/logger.js';

// ========== AGENTS SDK INTEGRATION ==========
/**
 * Agents SDK integration helpers for using @openai/agents with ChatKit.
 *
 * @example
 * ```typescript
 * import { Agent, Runner } from '@openai/agents';
 * import { agents } from 'chatkit-node';
 *
 * const agentContext: agents.AgentContext<MyContext> = {
 *   thread: currentThread,
 *   store: myStore,
 *   requestContext: { userId: 'user123' }
 * };
 *
 * const input = await agents.simpleToAgentInput(userMessage);
 * const runnerStream = Runner.runStreamed(myAgent, input);
 *
 * for await (const event of agents.streamAgentResponse(agentContext, runnerStream)) {
 *   yield event;
 * }
 * ```
 */
export * as agents from './agents/index.js';
