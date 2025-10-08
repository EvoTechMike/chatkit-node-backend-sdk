/**
 * In-memory MockStore implementation for testing
 */

import { Store, NotFoundError } from '../../src/store/Store.js';
import { AttachmentStore } from '../../src/store/AttachmentStore.js';
import type {
  ThreadMetadata,
  ThreadItem,
  Attachment,
  Page,
  StoreItemType,
  AttachmentCreateParams,
} from '../../src/types/index.js';
import {
  defaultGenerateThreadId,
  defaultGenerateItemId,
  defaultGenerateAttachmentId,
} from '../../src/utils/id.js';

/**
 * Context key helper - creates a unique key for multi-tenant isolation
 */
function getContextKey<TContext>(context: TContext): string {
  if (context && typeof context === 'object' && 'userId' in context) {
    return (context as { userId: string }).userId;
  }
  return 'default';
}

/**
 * In-memory Store implementation for testing with context isolation
 */
export class MockStore<TContext = unknown> extends Store<TContext> {
  // Keyed by: threadId -> contextKey -> ThreadMetadata
  private threads: Map<string, Map<string, ThreadMetadata>> = new Map();
  // Keyed by: threadId -> contextKey -> ThreadItem[]
  private items: Map<string, Map<string, ThreadItem[]>> = new Map();
  // Attachments are not context-isolated in this simple implementation
  private attachments: Map<string, Attachment> = new Map();

  /**
   * Generate a thread ID
   */
  generateThreadId(_context: TContext): string {
    return defaultGenerateThreadId();
  }

  /**
   * Generate an item ID
   */
  generateItemId(
    type: StoreItemType,
    _thread: ThreadMetadata,
    _context: TContext
  ): string {
    return defaultGenerateItemId(type);
  }

  // ==================== Thread Methods ====================

  /**
   * Load a thread by ID
   */
  async loadThread(threadId: string, context: TContext): Promise<ThreadMetadata> {
    const contextKey = getContextKey(context);
    const threadByContext = this.threads.get(threadId);

    if (!threadByContext) {
      throw new NotFoundError(`Thread not found: ${threadId}`);
    }

    const thread = threadByContext.get(contextKey);
    if (!thread) {
      throw new NotFoundError(`Thread not found: ${threadId}`);
    }

    return thread;
  }

  /**
   * Save (upsert) a thread
   */
  async saveThread(thread: ThreadMetadata, context: TContext): Promise<void> {
    const contextKey = getContextKey(context);

    if (!this.threads.has(thread.id)) {
      this.threads.set(thread.id, new Map());
    }

    this.threads.get(thread.id)!.set(contextKey, thread);
  }

  /**
   * Delete a thread (cascade deletes items)
   */
  async deleteThread(threadId: string, context: TContext): Promise<void> {
    const contextKey = getContextKey(context);

    // Delete thread for this context
    const threadByContext = this.threads.get(threadId);
    if (threadByContext) {
      threadByContext.delete(contextKey);
      if (threadByContext.size === 0) {
        this.threads.delete(threadId);
      }
    }

    // Cascade delete items for this context
    const itemsByContext = this.items.get(threadId);
    if (itemsByContext) {
      itemsByContext.delete(contextKey);
      if (itemsByContext.size === 0) {
        this.items.delete(threadId);
      }
    }
  }

  /**
   * Load threads with pagination
   */
  async loadThreads(
    limit: number,
    after: string | null,
    order: 'asc' | 'desc',
    context: TContext
  ): Promise<Page<ThreadMetadata>> {
    const contextKey = getContextKey(context);

    // Get all threads for this context
    const threads: ThreadMetadata[] = [];
    for (const [_, threadByContext] of this.threads) {
      const thread = threadByContext.get(contextKey);
      if (thread) {
        threads.push(thread);
      }
    }

    // Sort by created_at
    threads.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Apply cursor pagination
    let startIndex = 0;
    if (after) {
      startIndex = threads.findIndex((t) => t.id === after);
      if (startIndex === -1) {
        startIndex = 0;
      } else {
        startIndex++; // Start after the cursor
      }
    }

    // Slice the page
    const page = threads.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < threads.length;
    const lastId = page.length > 0 ? page[page.length - 1].id : null;

    return {
      data: page,
      has_more: hasMore,
      after: hasMore ? lastId : null,
    };
  }

  // ==================== Item Methods ====================

  /**
   * Load items for a thread with pagination
   */
  async loadThreadItems(
    threadId: string,
    after: string | null,
    limit: number,
    order: 'asc' | 'desc',
    context: TContext
  ): Promise<Page<ThreadItem>> {
    const contextKey = getContextKey(context);

    // If thread doesn't exist for this context, return empty list (not error)
    // This matches Python SDK behavior where listing operations return empty results
    const threadByContext = this.threads.get(threadId);
    if (!threadByContext || !threadByContext.has(contextKey)) {
      return {
        data: [],
        has_more: false,
        after: null,
      };
    }

    // Get items for this thread and context
    const itemsByContext = this.items.get(threadId);
    let items: ThreadItem[] = [];
    if (itemsByContext) {
      items = itemsByContext.get(contextKey) || [];
    }

    // Sort by created_at
    const sorted = [...items].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Apply cursor pagination
    let startIndex = 0;
    if (after) {
      startIndex = sorted.findIndex((item) => item.id === after);
      if (startIndex === -1) {
        startIndex = 0;
      } else {
        startIndex++; // Start after the cursor
      }
    }

    // Slice the page
    const page = sorted.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < sorted.length;
    const lastId = page.length > 0 ? page[page.length - 1].id : null;

    return {
      data: page,
      has_more: hasMore,
      after: hasMore ? lastId : null,
    };
  }

  /**
   * Add a new item to a thread
   */
  async addThreadItem(
    threadId: string,
    item: ThreadItem,
    context: TContext
  ): Promise<void> {
    const contextKey = getContextKey(context);

    // Verify thread exists for this context
    const threadByContext = this.threads.get(threadId);
    if (!threadByContext || !threadByContext.has(contextKey)) {
      throw new NotFoundError(`Thread not found: ${threadId}`);
    }

    // Get or create items map for this thread
    if (!this.items.has(threadId)) {
      this.items.set(threadId, new Map());
    }

    const itemsByContext = this.items.get(threadId)!;
    if (!itemsByContext.has(contextKey)) {
      itemsByContext.set(contextKey, []);
    }

    const items = itemsByContext.get(contextKey)!;
    items.push(item);
  }

  /**
   * Save (update) an existing item
   */
  async saveItem(
    threadId: string,
    item: ThreadItem,
    context: TContext
  ): Promise<void> {
    const contextKey = getContextKey(context);

    const itemsByContext = this.items.get(threadId);
    if (!itemsByContext) {
      throw new NotFoundError(`Thread not found: ${threadId}`);
    }

    const items = itemsByContext.get(contextKey);
    if (!items) {
      throw new NotFoundError(`Thread not found for context: ${threadId}`);
    }

    const index = items.findIndex((i) => i.id === item.id);
    if (index === -1) {
      throw new NotFoundError(`Item not found: ${item.id}`);
    }

    items[index] = item;
  }

  /**
   * Load a specific item by ID
   */
  async loadItem(
    threadId: string,
    itemId: string,
    context: TContext
  ): Promise<ThreadItem> {
    const contextKey = getContextKey(context);

    const itemsByContext = this.items.get(threadId);
    if (!itemsByContext) {
      throw new NotFoundError(`Thread not found: ${threadId}`);
    }

    const items = itemsByContext.get(contextKey);
    if (!items) {
      throw new NotFoundError(`Thread not found for context: ${threadId}`);
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundError(`Item not found: ${itemId}`);
    }

    return item;
  }

  /**
   * Delete an item from a thread
   */
  async deleteThreadItem(
    threadId: string,
    itemId: string,
    context: TContext
  ): Promise<void> {
    const contextKey = getContextKey(context);

    const itemsByContext = this.items.get(threadId);
    if (!itemsByContext) {
      return; // Thread doesn't exist, nothing to delete
    }

    const items = itemsByContext.get(contextKey);
    if (!items) {
      return; // No items for this context
    }

    const index = items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      items.splice(index, 1);
    }
  }

  // ==================== Attachment Methods ====================

  /**
   * Save an attachment
   */
  async saveAttachment(attachment: Attachment, _context: TContext): Promise<void> {
    this.attachments.set(attachment.id, attachment);
  }

  /**
   * Load an attachment by ID
   */
  async loadAttachment(
    attachmentId: string,
    _context: TContext
  ): Promise<Attachment> {
    const attachment = this.attachments.get(attachmentId);
    if (!attachment) {
      throw new NotFoundError(`Attachment not found: ${attachmentId}`);
    }
    return attachment;
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(
    attachmentId: string,
    _context: TContext
  ): Promise<void> {
    this.attachments.delete(attachmentId);
  }

  // ==================== Helper Methods for Testing ====================

  /**
   * Clear all data (useful for test cleanup)
   */
  clear(): void {
    this.threads.clear();
    this.items.clear();
    this.attachments.clear();
  }

  /**
   * Get thread count (across all contexts)
   */
  getThreadCount(): number {
    let count = 0;
    for (const threadByContext of this.threads.values()) {
      count += threadByContext.size;
    }
    return count;
  }

  /**
   * Get item count for a thread (across all contexts)
   */
  getItemCount(threadId: string): number {
    const itemsByContext = this.items.get(threadId);
    if (!itemsByContext) return 0;

    let count = 0;
    for (const items of itemsByContext.values()) {
      count += items.length;
    }
    return count;
  }

  /**
   * Get attachment count
   */
  getAttachmentCount(): number {
    return this.attachments.size;
  }
}

/**
 * In-memory AttachmentStore implementation for testing
 */
export class MockAttachmentStore<TContext = unknown> extends AttachmentStore<TContext> {
  /**
   * Generate an attachment ID
   */
  generateAttachmentId(_mimeType: string, _context: TContext): string {
    return defaultGenerateAttachmentId();
  }

  /**
   * Create an attachment with mock upload URL
   */
  async createAttachment(
    params: AttachmentCreateParams,
    context: TContext
  ): Promise<Attachment> {
    const id = this.generateAttachmentId(params.mime_type, context);
    const isImage = params.mime_type.startsWith('image/');

    // Generate mock upload URL
    const uploadUrl = `https://mock-storage.example.com/upload/${id}`;

    if (isImage) {
      // Image attachment with preview URL
      return {
        type: 'image',
        id,
        name: params.name,
        mime_type: params.mime_type,
        upload_url: uploadUrl,
        preview_url: `https://mock-storage.example.com/preview/${id}`,
      };
    } else {
      // File attachment
      return {
        type: 'file',
        id,
        name: params.name,
        mime_type: params.mime_type,
        upload_url: uploadUrl,
      };
    }
  }

  /**
   * Delete an attachment (no-op for mock)
   */
  async deleteAttachment(_attachmentId: string, _context: TContext): Promise<void> {
    // No-op for mock implementation
  }
}
