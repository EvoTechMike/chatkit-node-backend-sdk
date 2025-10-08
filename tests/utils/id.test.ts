/**
 * Tests for ID generation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  defaultGenerateThreadId,
  defaultGenerateItemId,
  defaultGenerateAttachmentId,
} from '../../src/utils/id.js';

describe('generateId', () => {
  it('should generate ID with correct format: prefix_XXXXXXXX', () => {
    const id = generateId('test');
    expect(id).toMatch(/^test_[0-9a-f]{8}$/);
  });

  it('should generate different IDs on subsequent calls', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');
    const id3 = generateId('test');

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should use the provided prefix', () => {
    const id1 = generateId('foo');
    const id2 = generateId('bar');

    expect(id1).toMatch(/^foo_/);
    expect(id2).toMatch(/^bar_/);
  });

  it('should generate hex characters only', () => {
    const id = generateId('test');
    const hexPart = id.split('_')[1];
    expect(hexPart).toMatch(/^[0-9a-f]+$/);
    expect(hexPart).toHaveLength(8);
  });

  it('should generate unique IDs (collision test)', () => {
    const ids = new Set<string>();
    const count = 10000;

    for (let i = 0; i < count; i++) {
      ids.add(generateId('test'));
    }

    // Should have no collisions in 10000 generations
    expect(ids.size).toBe(count);
  });
});

describe('defaultGenerateThreadId', () => {
  it('should generate ID with thr prefix', () => {
    const id = defaultGenerateThreadId();
    expect(id).toMatch(/^thr_[0-9a-f]{8}$/);
  });

  it('should generate unique thread IDs', () => {
    const id1 = defaultGenerateThreadId();
    const id2 = defaultGenerateThreadId();
    expect(id1).not.toBe(id2);
  });
});

describe('defaultGenerateItemId', () => {
  it('should generate message ID with msg prefix', () => {
    const id = defaultGenerateItemId('message');
    expect(id).toMatch(/^msg_[0-9a-f]{8}$/);
  });

  it('should generate tool_call ID with tc prefix', () => {
    const id = defaultGenerateItemId('tool_call');
    expect(id).toMatch(/^tc_[0-9a-f]{8}$/);
  });

  it('should generate task ID with task prefix', () => {
    const id = defaultGenerateItemId('task');
    expect(id).toMatch(/^task_[0-9a-f]{8}$/);
  });

  it('should generate workflow ID with wf prefix', () => {
    const id = defaultGenerateItemId('workflow');
    expect(id).toMatch(/^wf_[0-9a-f]{8}$/);
  });

  it('should generate attachment ID with atc prefix', () => {
    const id = defaultGenerateItemId('attachment');
    expect(id).toMatch(/^atc_[0-9a-f]{8}$/);
  });

  it('should generate unique IDs for each type', () => {
    const messageId1 = defaultGenerateItemId('message');
    const messageId2 = defaultGenerateItemId('message');
    const taskId = defaultGenerateItemId('task');

    expect(messageId1).not.toBe(messageId2);
    expect(messageId1).not.toBe(taskId);
  });
});

describe('defaultGenerateAttachmentId', () => {
  it('should generate ID with atc prefix', () => {
    const id = defaultGenerateAttachmentId();
    expect(id).toMatch(/^atc_[0-9a-f]{8}$/);
  });

  it('should generate unique attachment IDs', () => {
    const id1 = defaultGenerateAttachmentId();
    const id2 = defaultGenerateAttachmentId();
    expect(id1).not.toBe(id2);
  });
});

describe('ID format consistency', () => {
  it('all ID generators should produce 8-character hex suffix', () => {
    const threadId = defaultGenerateThreadId();
    const messageId = defaultGenerateItemId('message');
    const attachmentId = defaultGenerateAttachmentId();

    const threadHex = threadId.split('_')[1];
    const messageHex = messageId.split('_')[1];
    const attachmentHex = attachmentId.split('_')[1];

    expect(threadHex).toHaveLength(8);
    expect(messageHex).toHaveLength(8);
    expect(attachmentHex).toHaveLength(8);

    expect(threadHex).toMatch(/^[0-9a-f]{8}$/);
    expect(messageHex).toMatch(/^[0-9a-f]{8}$/);
    expect(attachmentHex).toMatch(/^[0-9a-f]{8}$/);
  });
});
