/**
 * Store - Abstract storage interface for ChatKit server
 *
 * Users must implement this interface to provide persistence for threads,
 * items, and attachments. Can use any storage backend (memory, SQL, NoSQL, etc.)
 */

import type {
  ThreadMetadata,
  ThreadItem,
  Attachment,
  Page,
  StoreItemType,
} from '../types/index.js';
import { defaultGenerateThreadId, defaultGenerateItemId } from '../utils/id.js';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Abstract Store class
 *
 * Implement all abstract methods to provide persistence for your ChatKit server.
 *
 * @example
 * ```typescript
 * class MyStore extends Store<{ userId: string }> {
 *   async loadThread(threadId, context) {
 *     // Load from database
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export abstract class Store<TContext = unknown> {
  /**
   * Generate a thread ID
   *
   * Override to customize ID format. Default: 'thr_' + 8 random hex chars
   */
  generateThreadId(_context: TContext): string {
    return defaultGenerateThreadId();
  }

  /**
   * Generate an item ID
   *
   * Override to customize ID format. Default: type-specific prefix + 8 random hex chars
   */
  generateItemId(type: StoreItemType, _thread: ThreadMetadata, _context: TContext): string {
    return defaultGenerateItemId(type);
  }

  // ============================================================================
  // Thread Methods (Must Implement)
  // ============================================================================

  /**
   * Load a thread by ID
   *
   * @throws NotFoundError if thread doesn't exist
   */
  abstract loadThread(threadId: string, context: TContext): Promise<ThreadMetadata>;

  /**
   * Save a thread (insert or update)
   */
  abstract saveThread(thread: ThreadMetadata, context: TContext): Promise<void>;

  /**
   * Delete a thread and all its items
   */
  abstract deleteThread(threadId: string, context: TContext): Promise<void>;

  /**
   * Load a paginated list of threads
   *
   * @param limit - Max number of threads to return
   * @param after - Cursor for pagination (null for first page)
   * @param order - Sort order: 'asc' or 'desc' by created_at
   * @param context - Request context
   */
  abstract loadThreads(
    limit: number,
    after: string | null,
    order: 'asc' | 'desc',
    context: TContext
  ): Promise<Page<ThreadMetadata>>;

  // ============================================================================
  // Item Methods (Must Implement)
  // ============================================================================

  /**
   * Load items for a thread
   *
   * @param threadId - Thread ID
   * @param after - Cursor for pagination (null for first page)
   * @param limit - Max number of items to return
   * @param order - Sort order: 'asc' or 'desc' by created_at
   * @param context - Request context
   */
  abstract loadThreadItems(
    threadId: string,
    after: string | null,
    limit: number,
    order: 'asc' | 'desc',
    context: TContext
  ): Promise<Page<ThreadItem>>;

  /**
   * Add a new item to a thread
   */
  abstract addThreadItem(
    threadId: string,
    item: ThreadItem,
    context: TContext
  ): Promise<void>;

  /**
   * Update an existing item
   */
  abstract saveItem(threadId: string, item: ThreadItem, context: TContext): Promise<void>;

  /**
   * Load a specific item
   *
   * @throws NotFoundError if item doesn't exist
   */
  abstract loadItem(
    threadId: string,
    itemId: string,
    context: TContext
  ): Promise<ThreadItem>;

  /**
   * Delete an item from a thread
   */
  abstract deleteThreadItem(
    threadId: string,
    itemId: string,
    context: TContext
  ): Promise<void>;

  // ============================================================================
  // Attachment Methods (Must Implement)
  // ============================================================================

  /**
   * Save attachment metadata
   */
  abstract saveAttachment(attachment: Attachment, context: TContext): Promise<void>;

  /**
   * Load attachment metadata
   *
   * @throws NotFoundError if attachment doesn't exist
   */
  abstract loadAttachment(attachmentId: string, context: TContext): Promise<Attachment>;

  /**
   * Delete attachment metadata
   */
  abstract deleteAttachment(attachmentId: string, context: TContext): Promise<void>;
}
