/**
 * Tests for type guards and discriminated unions
 */

import { describe, it, expect } from 'vitest';
import {
  type ThreadStatus,
  isActiveStatus,
  isLockedStatus,
  isClosedStatus,
  type ThreadItem,
  isUserMessage,
  isAssistantMessage,
  isClientToolCall,
  isWidgetItem,
  type ChatKitReq,
  isStreamingReq,
  isNonStreamingReq,
  type Attachment,
  isFileAttachment,
  isImageAttachment,
} from '../../src/index.js';

describe('ThreadStatus Type Guards', () => {
  it('should identify active status', () => {
    const status: ThreadStatus = { type: 'active' };
    expect(isActiveStatus(status)).toBe(true);
    expect(isLockedStatus(status)).toBe(false);
    expect(isClosedStatus(status)).toBe(false);
  });

  it('should identify locked status', () => {
    const status: ThreadStatus = { type: 'locked', reason: 'Test' };
    expect(isActiveStatus(status)).toBe(false);
    expect(isLockedStatus(status)).toBe(true);
    expect(isClosedStatus(status)).toBe(false);
  });

  it('should identify closed status', () => {
    const status: ThreadStatus = { type: 'closed', reason: 'Test' };
    expect(isActiveStatus(status)).toBe(false);
    expect(isLockedStatus(status)).toBe(false);
    expect(isClosedStatus(status)).toBe(true);
  });
});

describe('ThreadItem Type Guards', () => {
  it('should identify user message', () => {
    const item: ThreadItem = {
      type: 'user_message',
      id: 'msg_1',
      thread_id: 'thr_1',
      created_at: '2025-01-01T00:00:00Z',
      content: [{ type: 'input_text', text: 'Hello' }],
      attachments: [],
      inference_options: {},
    };
    expect(isUserMessage(item)).toBe(true);
    expect(isAssistantMessage(item)).toBe(false);
  });

  it('should identify assistant message', () => {
    const item: ThreadItem = {
      type: 'assistant_message',
      id: 'msg_2',
      thread_id: 'thr_1',
      created_at: '2025-01-01T00:00:00Z',
      content: [{ type: 'output_text', text: 'Hi', annotations: [] }],
    };
    expect(isAssistantMessage(item)).toBe(true);
    expect(isUserMessage(item)).toBe(false);
  });

  it('should identify client tool call', () => {
    const item: ThreadItem = {
      type: 'client_tool_call',
      id: 'tc_1',
      thread_id: 'thr_1',
      created_at: '2025-01-01T00:00:00Z',
      status: 'pending',
      call_id: 'call_1',
      name: 'get_weather',
      arguments: {},
    };
    expect(isClientToolCall(item)).toBe(true);
    expect(isUserMessage(item)).toBe(false);
  });

  it('should identify widget item', () => {
    const item: ThreadItem = {
      type: 'widget',
      id: 'wid_1',
      thread_id: 'thr_1',
      created_at: '2025-01-01T00:00:00Z',
      widget: { type: 'Card' },
    };
    expect(isWidgetItem(item)).toBe(true);
    expect(isUserMessage(item)).toBe(false);
  });
});

describe('Request Type Guards', () => {
  it('should identify streaming requests', () => {
    const req: ChatKitReq = {
      type: 'threads.create',
      params: {
        input: {
          content: [],
          attachments: [],
          inference_options: {},
        },
      },
    };
    expect(isStreamingReq(req)).toBe(true);
    expect(isNonStreamingReq(req)).toBe(false);
  });

  it('should identify non-streaming requests', () => {
    const req: ChatKitReq = {
      type: 'threads.get_by_id',
      params: {
        thread_id: 'thr_1',
      },
    };
    expect(isNonStreamingReq(req)).toBe(true);
    expect(isStreamingReq(req)).toBe(false);
  });

  it('should identify all streaming request types', () => {
    const streamingTypes = [
      'threads.create',
      'threads.add_user_message',
      'threads.add_client_tool_output',
      'threads.retry_after_item',
      'threads.custom_action',
    ];

    streamingTypes.forEach((type) => {
      const req = { type, params: {} } as ChatKitReq;
      expect(isStreamingReq(req)).toBe(true);
    });
  });
});

describe('Attachment Type Guards', () => {
  it('should identify file attachment', () => {
    const attachment: Attachment = {
      type: 'file',
      id: 'atc_1',
      name: 'document.pdf',
      mime_type: 'application/pdf',
    };
    expect(isFileAttachment(attachment)).toBe(true);
    expect(isImageAttachment(attachment)).toBe(false);
  });

  it('should identify image attachment', () => {
    const attachment: Attachment = {
      type: 'image',
      id: 'atc_2',
      name: 'photo.jpg',
      mime_type: 'image/jpeg',
      preview_url: 'https://example.com/preview.jpg',
    };
    expect(isImageAttachment(attachment)).toBe(true);
    expect(isFileAttachment(attachment)).toBe(false);
  });
});
