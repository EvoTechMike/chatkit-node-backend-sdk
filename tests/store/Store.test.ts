/**
 * Tests for Store abstract class using MockStore implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockStore } from '../helpers/MockStore.js';
import { NotFoundError } from '../../src/errors/index.js';
import type {
  ThreadMetadata,
  UserMessageItem,
  StoreItemType,
} from '../../src/types/index.js';

describe('Store (MockStore implementation)', () => {
  let store: MockStore<{ userId: string }>;
  let context: { userId: string };

  beforeEach(() => {
    store = new MockStore();
    context = { userId: 'test-user' };
  });

  describe('Thread Lifecycle', () => {
    it('should save and load a thread', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };

      await store.saveThread(thread, context);
      const loaded = await store.loadThread('thr_123', context);

      expect(loaded).toEqual(thread);
    });

    it('should update a thread when saved with same ID', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Original Title',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };

      await store.saveThread(thread, context);

      const updated: ThreadMetadata = {
        ...thread,
        title: 'Updated Title',
      };

      await store.saveThread(updated, context);
      const loaded = await store.loadThread('thr_123', context);

      expect(loaded.title).toBe('Updated Title');
    });

    it('should throw NotFoundError when loading non-existent thread', async () => {
      await expect(
        store.loadThread('thr_nonexistent', context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should delete a thread', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };

      await store.saveThread(thread, context);
      await store.deleteThread('thr_123', context);

      await expect(
        store.loadThread('thr_123', context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw when deleting non-existent thread', async () => {
      await expect(
        store.deleteThread('thr_nonexistent', context)
      ).resolves.not.toThrow();
    });
  });

  describe('Thread Pagination', () => {
    beforeEach(async () => {
      // Create 25 threads
      for (let i = 0; i < 25; i++) {
        const thread: ThreadMetadata = {
          id: `thr_${i}`,
          title: `Thread ${i}`,
          created_at: new Date(2025, 0, i + 1).toISOString(),
          status: { type: 'active' },
          metadata: {},
        };
        await store.saveThread(thread, context);
      }
    });

    it('should load first page with has_more=true', async () => {
      const page = await store.loadThreads(10, null, 'desc', context);

      expect(page.data).toHaveLength(10);
      expect(page.has_more).toBe(true);
      expect(page.after).not.toBeNull();
    });

    it('should load second page using after cursor', async () => {
      const page1 = await store.loadThreads(10, null, 'desc', context);
      const page2 = await store.loadThreads(10, page1.after, 'desc', context);

      expect(page2.data).toHaveLength(10);
      expect(page2.has_more).toBe(true);
      expect(page2.data[0].id).not.toBe(page1.data[0].id);
    });

    it('should have has_more=false on last page', async () => {
      const page1 = await store.loadThreads(10, null, 'desc', context);
      const page2 = await store.loadThreads(10, page1.after, 'desc', context);
      const page3 = await store.loadThreads(10, page2.after, 'desc', context);

      expect(page3.data).toHaveLength(5);
      expect(page3.has_more).toBe(false);
      expect(page3.after).toBeNull();
    });

    it('should sort threads by created_at desc', async () => {
      const page = await store.loadThreads(25, null, 'desc', context);

      expect(page.data[0].id).toBe('thr_24'); // Newest first
      expect(page.data[24].id).toBe('thr_0'); // Oldest last
    });

    it('should sort threads by created_at asc', async () => {
      const page = await store.loadThreads(25, null, 'asc', context);

      expect(page.data[0].id).toBe('thr_0'); // Oldest first
      expect(page.data[24].id).toBe('thr_24'); // Newest last
    });
  });

  describe('Item Lifecycle', () => {
    let thread: ThreadMetadata;

    beforeEach(async () => {
      thread = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };
      await store.saveThread(thread, context);
    });

    it('should add and load an item', async () => {
      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_123',
        thread_id: 'thr_123',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'Hello' }],
        attachments: [],
        inference_options: {},
      };

      await store.addThreadItem('thr_123', item, context);
      const loaded = await store.loadItem('thr_123', 'msg_123', context);

      expect(loaded).toEqual(item);
    });

    it('should throw when adding item to non-existent thread', async () => {
      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_123',
        thread_id: 'thr_nonexistent',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'Hello' }],
        attachments: [],
        inference_options: {},
      };

      await expect(
        store.addThreadItem('thr_nonexistent', item, context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should update an existing item', async () => {
      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_123',
        thread_id: 'thr_123',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'Hello' }],
        attachments: [],
        inference_options: {},
      };

      await store.addThreadItem('thr_123', item, context);

      const updated: UserMessageItem = {
        ...item,
        content: [{ type: 'input_text', text: 'Updated' }],
      };

      await store.saveItem('thr_123', updated, context);
      const loaded = await store.loadItem('thr_123', 'msg_123', context);

      expect(loaded.content[0]).toEqual({ type: 'input_text', text: 'Updated' });
    });

    it('should throw when updating non-existent item', async () => {
      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_nonexistent',
        thread_id: 'thr_123',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'Hello' }],
        attachments: [],
        inference_options: {},
      };

      await expect(
        store.saveItem('thr_123', item, context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should delete an item', async () => {
      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_123',
        thread_id: 'thr_123',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'Hello' }],
        attachments: [],
        inference_options: {},
      };

      await store.addThreadItem('thr_123', item, context);
      await store.deleteThreadItem('thr_123', 'msg_123', context);

      await expect(
        store.loadItem('thr_123', 'msg_123', context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw when deleting non-existent item', async () => {
      await expect(
        store.deleteThreadItem('thr_123', 'msg_nonexistent', context)
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundError when loading item from non-existent thread', async () => {
      await expect(
        store.loadItem('thr_nonexistent', 'msg_123', context)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Item Pagination', () => {
    beforeEach(async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };
      await store.saveThread(thread, context);

      // Add 25 items
      for (let i = 0; i < 25; i++) {
        const item: UserMessageItem = {
          type: 'user_message',
          id: `msg_${i}`,
          thread_id: 'thr_123',
          created_at: new Date(2025, 0, i + 1).toISOString(),
          content: [{ type: 'input_text', text: `Message ${i}` }],
          attachments: [],
          inference_options: {},
        };
        await store.addThreadItem('thr_123', item, context);
      }
    });

    it('should paginate items', async () => {
      const page1 = await store.loadThreadItems('thr_123', null, 10, 'asc', context);
      expect(page1.data).toHaveLength(10);
      expect(page1.has_more).toBe(true);

      const page2 = await store.loadThreadItems('thr_123', page1.after, 10, 'asc', context);
      expect(page2.data).toHaveLength(10);
      expect(page2.has_more).toBe(true);

      const page3 = await store.loadThreadItems('thr_123', page2.after, 10, 'asc', context);
      expect(page3.data).toHaveLength(5);
      expect(page3.has_more).toBe(false);
    });

    it('should sort items by created_at asc', async () => {
      const page = await store.loadThreadItems('thr_123', null, 25, 'asc', context);

      expect(page.data[0].id).toBe('msg_0');
      expect(page.data[24].id).toBe('msg_24');
    });

    it('should sort items by created_at desc', async () => {
      const page = await store.loadThreadItems('thr_123', null, 25, 'desc', context);

      expect(page.data[0].id).toBe('msg_24');
      expect(page.data[24].id).toBe('msg_0');
    });
  });

  describe('Attachment Lifecycle', () => {
    it('should save and load an attachment', async () => {
      const attachment = {
        type: 'file' as const,
        id: 'atc_123',
        name: 'test.pdf',
        mime_type: 'application/pdf',
        upload_url: 'https://example.com/upload',
      };

      await store.saveAttachment(attachment, context);
      const loaded = await store.loadAttachment('atc_123', context);

      expect(loaded).toEqual(attachment);
    });

    it('should throw when loading non-existent attachment', async () => {
      await expect(
        store.loadAttachment('atc_nonexistent', context)
      ).rejects.toThrow(NotFoundError);
    });

    it('should delete an attachment', async () => {
      const attachment = {
        type: 'file' as const,
        id: 'atc_123',
        name: 'test.pdf',
        mime_type: 'application/pdf',
        upload_url: 'https://example.com/upload',
      };

      await store.saveAttachment(attachment, context);
      await store.deleteAttachment('atc_123', context);

      await expect(
        store.loadAttachment('atc_123', context)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Cascade Delete', () => {
    it('should cascade delete items when thread is deleted', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };
      await store.saveThread(thread, context);

      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_123',
        thread_id: 'thr_123',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'Hello' }],
        attachments: [],
        inference_options: {},
      };
      await store.addThreadItem('thr_123', item, context);

      expect(store.getItemCount('thr_123')).toBe(1);

      await store.deleteThread('thr_123', context);

      expect(store.getItemCount('thr_123')).toBe(0);
    });
  });

  describe('Null Title Handling', () => {
    it('should save and load thread with null title', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: null,
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: { test: 'data' },
      };

      await store.saveThread(thread, context);
      const loaded = await store.loadThread('thr_123', context);

      expect(loaded.id).toBe(thread.id);
      expect(loaded.title).toBeNull();
      expect(loaded.metadata).toEqual({ test: 'data' });
    });
  });

  describe('Context Isolation (Multi-tenancy)', () => {
    let defaultContext: { userId: string };
    let alternativeContext: { userId: string };

    beforeEach(() => {
      defaultContext = { userId: 'user1' };
      alternativeContext = { userId: 'user2' };
    });

    it('should isolate threads by user context', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_user1',
        title: 'User 1 Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };

      // Save thread for user1
      await store.saveThread(thread, defaultContext);

      // Should be accessible by user1
      const loadedDefault = await store.loadThread(thread.id, defaultContext);
      expect(loadedDefault.title).toBe('User 1 Thread');

      // Should NOT be accessible by user2 (different context)
      await expect(
        store.loadThread(thread.id, alternativeContext)
      ).rejects.toThrow(NotFoundError);
    });

    it('should isolate thread items by user context', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_shared',
        title: 'Shared Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };

      // Save thread for user1
      await store.saveThread(thread, defaultContext);

      // Add items for user1
      const item: UserMessageItem = {
        type: 'user_message',
        id: 'msg_user1',
        thread_id: 'thr_shared',
        created_at: '2025-01-01T00:00:00Z',
        content: [{ type: 'input_text', text: 'User 1 message' }],
        attachments: [],
        inference_options: {},
      };
      await store.addThreadItem(thread.id, item, defaultContext);

      // Should be accessible by user1
      const itemsUser1 = await store.loadThreadItems(
        thread.id,
        null,
        10,
        'asc',
        defaultContext
      );
      expect(itemsUser1.data).toHaveLength(1);
      expect(itemsUser1.data[0].id).toBe('msg_user1');

      // Should NOT be accessible by user2 (should return empty list)
      const itemsUser2 = await store.loadThreadItems(
        thread.id,
        null,
        10,
        'asc',
        alternativeContext
      );
      expect(itemsUser2.data).toHaveLength(0);

      // Loading specific item with wrong context should throw
      await expect(
        store.loadItem(thread.id, 'msg_user1', alternativeContext)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Helper Methods', () => {
    it('should return thread count', async () => {
      expect(store.getThreadCount()).toBe(0);

      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };
      await store.saveThread(thread, context);

      expect(store.getThreadCount()).toBe(1);
    });

    it('should clear all data', async () => {
      const thread: ThreadMetadata = {
        id: 'thr_123',
        title: 'Test Thread',
        created_at: '2025-01-01T00:00:00Z',
        status: { type: 'active' },
        metadata: {},
      };
      await store.saveThread(thread, context);

      const attachment = {
        type: 'file' as const,
        id: 'atc_123',
        name: 'test.pdf',
        mime_type: 'application/pdf',
        upload_url: 'https://example.com/upload',
      };
      await store.saveAttachment(attachment, context);

      expect(store.getThreadCount()).toBe(1);
      expect(store.getAttachmentCount()).toBe(1);

      store.clear();

      expect(store.getThreadCount()).toBe(0);
      expect(store.getAttachmentCount()).toBe(0);
    });
  });
});

/**
 * Test suite for custom ID generator overrides
 * Translates test_store.py::TestSqliteStoreCustomIds
 */
describe('Store with Custom ID Generators', () => {
  /**
   * Custom MockStore that overrides ID generation with counter-based IDs
   */
  class CustomMockStore extends MockStore<{ userId: string }> {
    private counter = 0;

    generateThreadId(_context: { userId: string }): string {
      this.counter++;
      return `thr_custom_${this.counter}`;
    }

    generateItemId(
      type: StoreItemType,
      thread: ThreadMetadata,
      _context: { userId: string }
    ): string {
      this.counter++;
      return `${type}_custom_${this.counter}_${thread.id}`;
    }
  }

  let store: CustomMockStore;
  let context: { userId: string };

  beforeEach(() => {
    store = new CustomMockStore();
    context = { userId: 'test-user' };
  });

  it('should use overridden ID generators', () => {
    // Generate thread ID
    const threadId = store.generateThreadId(context);
    expect(threadId).toBe('thr_custom_1');

    // Create thread metadata
    const thread: ThreadMetadata = {
      id: threadId,
      title: 'Test Thread',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };

    // Generate item IDs for different types
    const msgId = store.generateItemId('message', thread, context);
    const toolCallId = store.generateItemId('tool_call', thread, context);
    const taskId = store.generateItemId('task', thread, context);

    expect(msgId).toBe('message_custom_2_thr_custom_1');
    expect(toolCallId).toBe('tool_call_custom_3_thr_custom_1');
    expect(taskId).toBe('task_custom_4_thr_custom_1');

    // Generate second thread ID
    const threadId2 = store.generateThreadId(context);
    expect(threadId2).toBe('thr_custom_5');

    const thread2: ThreadMetadata = {
      id: threadId2,
      title: 'Test Thread 2',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };

    // Generate item IDs for second thread
    const msgId2 = store.generateItemId('message', thread2, context);
    const toolCallId2 = store.generateItemId('tool_call', thread2, context);
    const taskId2 = store.generateItemId('task', thread2, context);

    expect(msgId2).toBe('message_custom_6_thr_custom_5');
    expect(toolCallId2).toBe('tool_call_custom_7_thr_custom_5');
    expect(taskId2).toBe('task_custom_8_thr_custom_5');
  });
});
