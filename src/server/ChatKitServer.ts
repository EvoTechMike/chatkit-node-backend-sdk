/**
 * ChatKitServer - Abstract base class for implementing ChatKit backend servers
 *
 * Users extend this class and implement the abstract `respond()` method to handle
 * incoming messages. The server handles request routing, event streaming, error
 * handling, and storage integration.
 */

import type { Store } from '../store/Store.js';
import type { AttachmentStore } from '../store/AttachmentStore.js';
import type { Logger } from '../utils/logger.js';
import { defaultLogger } from '../utils/logger.js';
import { StreamingResult, NonStreamingResult } from './results.js';
import { StreamError, CustomStreamError, ErrorCode } from '../errors/index.js';
import type {
  ChatKitReq,
  StreamingReq,
  NonStreamingReq,
  ThreadsCreateReq,
  ThreadsAddUserMessageReq,
  // Unused in Phase 2, will be used in Phase 4:
  // ThreadsAddClientToolOutputReq,
  // ThreadsRetryAfterItemReq,
  // ThreadsCustomActionReq,
  ThreadsGetByIdReq,
  ThreadsListReq,
  ThreadsUpdateReq,
  ThreadsDeleteReq,
  ItemsListReq,
  ItemsFeedbackReq,
  AttachmentsCreateReq,
  AttachmentsDeleteReq,
} from '../types/requests.js';
import { isStreamingReq } from '../types/requests.js';
import type {
  ThreadStreamEvent,
  ThreadCreatedEvent,
  ThreadItemDoneEvent,
  ThreadItemReplacedEvent,
  ThreadItemRemovedEvent,
  ErrorEvent,
  ThreadUpdatedEvent,
} from '../types/events.js';
import type {
  ThreadMetadata,
  Thread,
  UserMessageItem,
  FeedbackKind,
  Action,
  WidgetItem,
  Page,
  // HiddenContextItem - unused, just checking type string instead
} from '../types/index.js';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Abstract ChatKitServer class
 *
 * @example
 * ```typescript
 * class MyServer extends ChatKitServer<{ userId: string }> {
 *   async *respond(thread, inputUserMessage, context) {
 *     // Your implementation here
 *     yield {
 *       type: 'thread.item.done',
 *       item: {
 *         type: 'assistant_message',
 *         // ... message details
 *       }
 *     };
 *   }
 * }
 * ```
 */
export abstract class ChatKitServer<TContext = unknown> {
  protected store: Store<TContext>;
  protected attachmentStore?: AttachmentStore<TContext>;
  protected logger: Logger;

  constructor(
    store: Store<TContext>,
    attachmentStore?: AttachmentStore<TContext>,
    logger?: Logger
  ) {
    this.store = store;
    this.attachmentStore = attachmentStore;
    this.logger = logger || defaultLogger;
  }

  /**
   * Get the configured attachment store or throw if not configured
   */
  protected getAttachmentStore(): AttachmentStore<TContext> {
    if (!this.attachmentStore) {
      throw new Error(
        'AttachmentStore is not configured. Provide an AttachmentStore to ChatKitServer to handle file operations.'
      );
    }
    return this.attachmentStore;
  }

  /**
   * Abstract method: Stream ThreadStreamEvent instances for a new user message
   *
   * This is the primary method users must implement to handle incoming messages
   * and generate responses.
   *
   * @param thread - Metadata for the thread being processed
   * @param inputUserMessage - The incoming message to respond to, or null for retry/tool output
   * @param context - Per-request context provided by the caller
   * @returns AsyncGenerator yielding ThreadStreamEvent instances
   */
  abstract respond(
    thread: ThreadMetadata,
    inputUserMessage: UserMessageItem | null,
    context: TContext
  ): AsyncGenerator<ThreadStreamEvent>;

  /**
   * Optional: Handle feedback on thread items
   *
   * Override this method to store or process user feedback (thumbs up/down).
   * Default implementation does nothing.
   *
   * @param threadId - Thread ID
   * @param itemIds - List of item IDs receiving feedback
   * @param feedback - 'positive' or 'negative'
   * @param context - Request context
   */
  async addFeedback(
    threadId: string,
    itemIds: string[],
    feedback: FeedbackKind,
    _context: TContext
  ): Promise<void> {
    // Default: do nothing
    this.logger.debug('Feedback received', { threadId, itemIds, feedback });
  }

  /**
   * Optional: Handle custom actions from widgets
   *
   * Override this method to react to button clicks and form submissions from widgets.
   * Default implementation throws NotImplementedError.
   *
   * @param thread - Thread metadata
   * @param action - Action payload from widget
   * @param sender - Widget item that sent the action, if any
   * @param context - Request context
   * @returns AsyncGenerator yielding ThreadStreamEvent instances
   */
  async *action(
    _thread: ThreadMetadata,
    _action: Action,
    _sender: WidgetItem | null,
    _context: TContext
  ): AsyncGenerator<ThreadStreamEvent> {
    throw new Error(
      'The action() method must be overridden to react to actions. ' +
        'See ChatKit documentation for widget actions.'
    );
  }

  /**
   * Main entry point: Process a ChatKit request
   *
   * Parses the request JSON, routes to appropriate handler, and returns
   * either a StreamingResult or NonStreamingResult.
   *
   * @param request - JSON request string or buffer
   * @param context - Per-request context
   * @returns StreamingResult or NonStreamingResult
   */
  async process(
    request: string | Buffer,
    context: TContext
  ): Promise<StreamingResult | NonStreamingResult> {
    // Parse request
    const requestStr = typeof request === 'string' ? request : request.toString('utf-8');
    const parsedRequest: ChatKitReq = JSON.parse(requestStr) as ChatKitReq;

    this.logger.info(`Received request op: ${parsedRequest.type}`);

    // Route to streaming or non-streaming handler
    if (isStreamingReq(parsedRequest)) {
      return new StreamingResult(this.processStreaming(parsedRequest, context));
    } else {
      const result = await this.processNonStreaming(parsedRequest, context);
      return new NonStreamingResult(result);
    }
  }

  /**
   * Process non-streaming requests (returns JSON)
   */
  protected async processNonStreaming(
    request: NonStreamingReq,
    context: TContext
  ): Promise<unknown> {
    switch (request.type) {
      case 'threads.get_by_id': {
        const req = request as ThreadsGetByIdReq;
        const thread = await this.loadFullThread(req.params.thread_id, context);
        return this.toThreadResponse(thread);
      }

      case 'threads.list': {
        const req = request as ThreadsListReq;
        const params = req.params;
        const threads = await this.store.loadThreads(
          params.limit || DEFAULT_PAGE_SIZE,
          params.after || null,
          params.order || 'desc',
          context
        );
        return {
          has_more: threads.has_more,
          after: threads.after,
          data: threads.data.map((thread) => this.toThreadResponse(thread)),
        };
      }

      case 'threads.update': {
        const req = request as ThreadsUpdateReq;
        const thread = await this.store.loadThread(req.params.thread_id, context);
        if (req.params.title !== undefined) {
          thread.title = req.params.title;
        }
        await this.store.saveThread(thread, context);
        return this.toThreadResponse(thread);
      }

      case 'threads.delete': {
        const req = request as ThreadsDeleteReq;
        await this.store.deleteThread(req.params.thread_id, context);
        return {};
      }

      case 'items.list': {
        const req = request as ItemsListReq;
        const params = req.params;
        const items = await this.store.loadThreadItems(
          params.thread_id,
          params.after || null,
          params.limit || DEFAULT_PAGE_SIZE,
          params.order || 'asc',
          context
        );
        // Filter out HiddenContextItems
        items.data = items.data.filter((item) => item.type !== 'hidden_context_item');
        return items;
      }

      case 'items.feedback': {
        const req = request as ItemsFeedbackReq;
        await this.addFeedback(
          req.params.thread_id,
          req.params.item_ids,
          req.params.kind,
          context
        );
        return {};
      }

      case 'attachments.create': {
        const req = request as AttachmentsCreateReq;
        const attachmentStore = this.getAttachmentStore();
        const attachment = await attachmentStore.createAttachment(req.params, context);
        await this.store.saveAttachment(attachment, context);
        return attachment;
      }

      case 'attachments.delete': {
        const req = request as AttachmentsDeleteReq;
        const attachmentStore = this.getAttachmentStore();
        await attachmentStore.deleteAttachment(req.params.attachment_id, context);
        await this.store.deleteAttachment(req.params.attachment_id, context);
        return {};
      }

      default: {
        const exhaustiveCheck: never = request;
        throw new Error(`Unknown request type: ${(exhaustiveCheck as any).type}`);
      }
    }
  }

  /**
   * Process streaming requests (returns SSE stream)
   */
  protected async *processStreaming(
    request: StreamingReq,
    context: TContext
  ): AsyncGenerator<ThreadStreamEvent> {
    try {
      yield* this.processStreamingImpl(request, context);
    } catch (error) {
      this.logger.error('Error while generating streamed response', { error });
      throw error;
    }
  }

  /**
   * Implementation of streaming request processing
   */
  protected async *processStreamingImpl(
    request: StreamingReq,
    context: TContext
  ): AsyncGenerator<ThreadStreamEvent> {
    switch (request.type) {
      case 'threads.create': {
        const req = request as ThreadsCreateReq;
        // Create thread
        const thread: ThreadMetadata = {
          id: this.store.generateThreadId(context),
          title: null,
          created_at: new Date().toISOString(),
          status: { type: 'active' },
          metadata: {},
        };
        await this.store.saveThread(thread, context);

        // Emit thread.created
        yield {
          type: 'thread.created',
          thread: this.toThreadResponse(thread),
        } as ThreadCreatedEvent;

        // Build user message
        const userMessage = await this.buildUserMessageItem(req.params.input, thread, context);

        // Process and respond
        yield* this.processNewThreadItemRespond(thread, userMessage, context);
        break;
      }

      case 'threads.add_user_message': {
        const req = request as ThreadsAddUserMessageReq;
        const thread = await this.store.loadThread(req.params.thread_id, context);
        const userMessage = await this.buildUserMessageItem(req.params.input, thread, context);
        yield* this.processNewThreadItemRespond(thread, userMessage, context);
        break;
      }

      case 'threads.add_client_tool_output':
      case 'threads.retry_after_item':
      case 'threads.custom_action': {
        throw new Error(`Handler for ${request.type} not yet implemented (Phase 4)`);
      }

      default: {
        const exhaustiveCheck: never = request;
        throw new Error(`Unknown request type: ${(exhaustiveCheck as any).type}`);
      }
    }
  }

  /**
   * Process a new user message and generate response
   */
  protected async *processNewThreadItemRespond(
    thread: ThreadMetadata,
    item: UserMessageItem,
    context: TContext
  ): AsyncGenerator<ThreadStreamEvent> {
    // Save user message
    await this.store.addThreadItem(thread.id, item, context);

    // Emit thread.item.done for user message
    yield {
      type: 'thread.item.done',
      item,
    } as ThreadItemDoneEvent;

    // Call user's respond() method and process events
    yield* this.processEvents(thread, context, () => this.respond(thread, item, context));
  }

  /**
   * Process events from user's respond() method
   *
   * Handles:
   * - Saving items to store
   * - Error handling
   * - Thread updates
   * - Filtering hidden context items
   */
  protected async *processEvents(
    thread: ThreadMetadata,
    context: TContext,
    streamFn: () => AsyncGenerator<ThreadStreamEvent>
  ): AsyncGenerator<ThreadStreamEvent> {
    let lastThread: ThreadMetadata = { ...thread };

    try {
      for await (const event of streamFn()) {
        // Save items to store based on event type
        switch (event.type) {
          case 'thread.item.done': {
            const doneEvent = event as ThreadItemDoneEvent;
            await this.store.addThreadItem(thread.id, doneEvent.item, context);
            break;
          }
          case 'thread.item.removed': {
            const removedEvent = event as ThreadItemRemovedEvent;
            await this.store.deleteThreadItem(thread.id, removedEvent.item_id, context);
            break;
          }
          case 'thread.item.replaced': {
            const replacedEvent = event as ThreadItemReplacedEvent;
            await this.store.saveItem(thread.id, replacedEvent.item, context);
            break;
          }
        }

        // Filter out hidden context items from client
        const shouldSwallowEvent =
          event.type === 'thread.item.done' &&
          (event as ThreadItemDoneEvent).item.type === 'hidden_context_item';

        if (!shouldSwallowEvent) {
          yield event;
        }

        // Check if thread was updated
        if (JSON.stringify(thread) !== JSON.stringify(lastThread)) {
          lastThread = { ...thread } as ThreadMetadata;
          await this.store.saveThread(thread, context);
          yield {
            type: 'thread.updated',
            thread: this.toThreadResponse(thread),
          } as ThreadUpdatedEvent;
        }
      }

      // Final thread update check
      if (JSON.stringify(thread) !== JSON.stringify(lastThread)) {
        lastThread = { ...thread } as ThreadMetadata;
        await this.store.saveThread(thread, context);
        yield {
          type: 'thread.updated',
          thread: this.toThreadResponse(thread),
        } as ThreadUpdatedEvent;
      }
    } catch (error) {
      if (error instanceof CustomStreamError) {
        yield {
          type: 'error',
          code: 'custom',
          message: error.message,
          allow_retry: error.allowRetry,
        } as ErrorEvent;
      } else if (error instanceof StreamError) {
        yield {
          type: 'error',
          code: error.code,
          allow_retry: error.allowRetry,
        } as ErrorEvent;
      } else {
        yield {
          type: 'error',
          code: ErrorCode.STREAM_ERROR,
          allow_retry: true,
        } as ErrorEvent;
        this.logger.error('Unhandled error in stream', { error });
      }
    }
  }

  /**
   * Build a UserMessageItem from input
   */
  protected async buildUserMessageItem(
    input: any,
    thread: ThreadMetadata,
    context: TContext
  ): Promise<UserMessageItem> {
    // Load attachments
    const attachments = await Promise.all(
      (input.attachments || []).map((id: string) => this.store.loadAttachment(id, context))
    );

    return {
      type: 'user_message',
      id: this.store.generateItemId('message', thread, context),
      thread_id: thread.id,
      created_at: new Date().toISOString(),
      content: input.content,
      attachments,
      quoted_text: input.quoted_text || null,
      inference_options: input.inference_options || {},
    };
  }

  /**
   * Load a full thread with items
   */
  protected async loadFullThread(threadId: string, context: TContext): Promise<Thread> {
    const threadMeta = await this.store.loadThread(threadId, context);
    const threadItems = await this.store.loadThreadItems(
      threadId,
      null,
      DEFAULT_PAGE_SIZE,
      'asc',
      context
    );

    return {
      ...threadMeta,
      items: threadItems,
    };
  }

  /**
   * Convert ThreadMetadata or Thread to Thread response
   * (filters out hidden context items)
   */
  protected toThreadResponse(thread: ThreadMetadata | Thread): Thread {
    const isThread = (t: ThreadMetadata | Thread): t is Thread => 'items' in t;

    const items: Page<any> = isThread(thread)
      ? thread.items
      : { data: [], has_more: false, after: null };

    // Filter out hidden context items
    items.data = items.data.filter((item: any) => item.type !== 'hidden_context_item');

    return {
      id: thread.id,
      title: thread.title,
      created_at: thread.created_at,
      status: thread.status,
      metadata: thread.metadata,
      items,
    };
  }
}
