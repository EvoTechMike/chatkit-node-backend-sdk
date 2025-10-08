/**
 * Tests for StreamingResult and NonStreamingResult classes
 */

import { describe, it, expect } from 'vitest';
import { StreamingResult, NonStreamingResult } from '../../src/server/results.js';
import type { ThreadStreamEvent } from '../../src/types/events.js';

describe('StreamingResult', () => {
  it('should have isStreaming property set to true', () => {
    async function* gen() {
      // Empty generator
    }
    const result = new StreamingResult(gen());
    expect(result.isStreaming).toBe(true);
  });

  it('should format events as SSE with data prefix and double newline', async () => {
    async function* mockEvents(): AsyncGenerator<ThreadStreamEvent> {
      yield {
        type: 'thread.created',
        thread: {
          id: 'thr_123',
          title: 'Test Thread',
          created_at: '2025-01-01T00:00:00Z',
          status: { type: 'active' },
          metadata: {},
          items: { data: [], has_more: false, after: null },
        },
      };
    }

    const result = new StreamingResult(mockEvents());
    const chunks: string[] = [];

    for await (const chunk of result) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatch(/^data: /);
    expect(chunks[0]).toMatch(/\n\n$/);
  });

  it('should serialize events as JSON', async () => {
    async function* mockEvents(): AsyncGenerator<ThreadStreamEvent> {
      yield {
        type: 'error',
        code: 'test.error',
        allow_retry: true,
      };
    }

    const result = new StreamingResult(mockEvents());
    const chunks: string[] = [];

    for await (const chunk of result) {
      chunks.push(chunk);
    }

    const jsonPart = chunks[0].replace(/^data: /, '').replace(/\n\n$/, '');
    const parsed = JSON.parse(jsonPart);

    expect(parsed.type).toBe('error');
    expect(parsed.code).toBe('test.error');
    expect(parsed.allow_retry).toBe(true);
  });

  it('should exclude null values from JSON', async () => {
    async function* mockEvents(): AsyncGenerator<ThreadStreamEvent> {
      yield {
        type: 'notice',
        level: 'info',
        title: null,
        message: 'Test notice',
      } as any;
    }

    const result = new StreamingResult(mockEvents());
    const chunks: string[] = [];

    for await (const chunk of result) {
      chunks.push(chunk);
    }

    const jsonPart = chunks[0].replace(/^data: /, '').replace(/\n\n$/, '');
    const parsed = JSON.parse(jsonPart);

    expect(parsed.title).toBeUndefined();
    expect(parsed.message).toBe('Test notice');
  });

  it('should handle multiple events', async () => {
    async function* mockEvents(): AsyncGenerator<ThreadStreamEvent> {
      yield { type: 'error', code: 'error1', allow_retry: false };
      yield { type: 'error', code: 'error2', allow_retry: true };
      yield { type: 'error', code: 'error3', allow_retry: false };
    }

    const result = new StreamingResult(mockEvents());
    const chunks: string[] = [];

    for await (const chunk of result) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(3);
    chunks.forEach((chunk) => {
      expect(chunk).toMatch(/^data: /);
      expect(chunk).toMatch(/\n\n$/);
    });
  });
});

describe('NonStreamingResult', () => {
  it('should have isStreaming property set to false', () => {
    const result = new NonStreamingResult({ test: 'data' });
    expect(result.isStreaming).toBe(false);
  });

  it('should return data via toJSON()', () => {
    const data = { id: '123', name: 'Test' };
    const result = new NonStreamingResult(data);
    expect(result.toJSON()).toEqual(data);
  });

  it('should serialize to JSON string via toString()', () => {
    const data = { id: '123', name: 'Test' };
    const result = new NonStreamingResult(data);
    const jsonString = result.toString();
    expect(JSON.parse(jsonString)).toEqual(data);
  });

  it('should exclude null values in toString()', () => {
    const data = { id: '123', name: 'Test', optional: null };
    const result = new NonStreamingResult(data);
    const jsonString = result.toString();
    const parsed = JSON.parse(jsonString);

    expect(parsed.id).toBe('123');
    expect(parsed.name).toBe('Test');
    expect(parsed.optional).toBeUndefined();
  });

  it('should handle nested objects', () => {
    const data = {
      thread: {
        id: 'thr_123',
        metadata: {
          tags: ['test', 'demo'],
        },
      },
    };
    const result = new NonStreamingResult(data);
    expect(result.toJSON()).toEqual(data);
  });

  it('should handle arrays', () => {
    const data = {
      threads: [
        { id: 'thr_1', title: 'First' },
        { id: 'thr_2', title: 'Second' },
      ],
    };
    const result = new NonStreamingResult(data);
    expect(result.toJSON()).toEqual(data);
  });
});
