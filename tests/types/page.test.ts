/**
 * Tests for Page type
 */

import { describe, it, expect } from 'vitest';
import type { Page, ThreadMetadata } from '../../src/index.js';

describe('Page Type', () => {
  it('should create a page of threads with no more results', () => {
    const page: Page<ThreadMetadata> = {
      data: [
        {
          id: 'thr_1',
          title: 'Test Thread',
          created_at: '2025-01-01T00:00:00Z',
          status: { type: 'active' },
          metadata: {},
        },
      ],
      has_more: false,
      after: null,
    };

    expect(page.data).toHaveLength(1);
    expect(page.has_more).toBe(false);
    expect(page.after).toBeNull();
  });

  it('should create a page with pagination cursor', () => {
    const page: Page<ThreadMetadata> = {
      data: [
        {
          id: 'thr_1',
          title: 'Thread 1',
          created_at: '2025-01-01T00:00:00Z',
          status: { type: 'active' },
          metadata: {},
        },
        {
          id: 'thr_2',
          title: 'Thread 2',
          created_at: '2025-01-02T00:00:00Z',
          status: { type: 'active' },
          metadata: {},
        },
      ],
      has_more: true,
      after: 'cursor_abc123',
    };

    expect(page.data).toHaveLength(2);
    expect(page.has_more).toBe(true);
    expect(page.after).toBe('cursor_abc123');
  });

  it('should create an empty page', () => {
    const page: Page<ThreadMetadata> = {
      data: [],
      has_more: false,
      after: null,
    };

    expect(page.data).toHaveLength(0);
    expect(page.has_more).toBe(false);
    expect(page.after).toBeNull();
  });

  it('should work with generic types', () => {
    interface TestItem {
      id: string;
      name: string;
    }

    const page: Page<TestItem> = {
      data: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ],
      has_more: false,
      after: null,
    };

    expect(page.data[0].name).toBe('Item 1');
    expect(page.data[1].name).toBe('Item 2');
  });

  it('should handle has_more true with non-null cursor', () => {
    const page: Page<string> = {
      data: ['item1', 'item2', 'item3'],
      has_more: true,
      after: 'next_page_token',
    };

    expect(page.has_more).toBe(true);
    expect(page.after).not.toBeNull();
    expect(typeof page.after).toBe('string');
  });

  it('should allow has_more false with null cursor', () => {
    const page: Page<number> = {
      data: [1, 2, 3],
      has_more: false,
      after: null,
    };

    expect(page.has_more).toBe(false);
    expect(page.after).toBeNull();
  });
});
