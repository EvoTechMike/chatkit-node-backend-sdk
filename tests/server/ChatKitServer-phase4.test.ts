/**
 * Tests for Phase 4 streaming request handlers:
 * - threads.add_client_tool_output
 * - threads.retry_after_item
 * - threads.custom_action
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChatKitServer } from '../../src/server/ChatKitServer.js';
import { MockStore } from '../helpers/MockStore.js';
import type {
  ThreadMetadata,
  UserMessageItem,
  ThreadStreamEvent,
  AssistantMessageItem,
  ClientToolCallItem,
  WidgetItem,
  Action,
} from '../../src/types/index.js';

/**
 * Test server implementation
 */
class TestServer extends ChatKitServer<{ userId: string }> {
  // Track calls to respond() for verification
  public respondCalls: Array<{
    thread: ThreadMetadata;
    message: UserMessageItem | null;
  }> = [];

  // Track calls to action() for verification
  public actionCalls: Array<{
    thread: ThreadMetadata;
    action: Action;
    sender: WidgetItem | null;
  }> = [];

  // Control what respond() yields
  public respondEvents: ThreadStreamEvent[] = [];

  // Control what action() yields
  public actionEvents: ThreadStreamEvent[] = [];

  async *respond(
    thread: ThreadMetadata,
    inputUserMessage: UserMessageItem | null,
    _context: { userId: string }
  ): AsyncGenerator<ThreadStreamEvent> {
    // Record the call
    this.respondCalls.push({ thread, message: inputUserMessage });

    // Yield configured events
    for (const event of this.respondEvents) {
      yield event;
    }
  }

  async *action(
    thread: ThreadMetadata,
    action: Action,
    sender: WidgetItem | null,
    _context: { userId: string }
  ): AsyncGenerator<ThreadStreamEvent> {
    // Record the call
    this.actionCalls.push({ thread, action, sender });

    // Yield configured events
    for (const event of this.actionEvents) {
      yield event;
    }
  }

  // Reset tracking between tests
  reset() {
    this.respondCalls = [];
    this.actionCalls = [];
    this.respondEvents = [];
    this.actionEvents = [];
  }
}

describe('ChatKitServer - Phase 4: threads.add_client_tool_output', () => {
  let store: MockStore<{ userId: string }>;
  let server: TestServer;
  const context = { userId: 'test-user' };

  beforeEach(() => {
    store = new MockStore();
    server = new TestServer(store);
    server.reset();
  });

  it('should update pending client tool call with result', async () => {
    // Create thread
    const thread: ThreadMetadata = {
      id: 'thr_123',
      title: 'Test Thread',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Add a pending client tool call
    const toolCall: ClientToolCallItem = {
      type: 'client_tool_call',
      id: 'tool_123',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      status: 'pending',
      call_id: 'call_xyz',
      name: 'calculator',
      arguments: { operation: 'add', a: 5, b: 3 },
    };
    await store.addThreadItem(thread.id, toolCall, context);

    // Configure server to yield a response
    const assistantResponse: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_456',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:02Z',
      content: [{ type: 'output_text', text: 'The result is 8', annotations: [] }],
    };
    server.respondEvents = [
      { type: 'thread.item.done', item: assistantResponse },
    ];

    // Send threads.add_client_tool_output request
    const request = {
      type: 'threads.add_client_tool_output',
      params: {
        thread_id: thread.id,
        result: { answer: 8 },
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    expect(result.isStreaming).toBe(true);

    // Collect events
    const events: ThreadStreamEvent[] = [];
    for await (const chunk of result) {
      const match = chunk.match(/^data: (.+)\n\n$/);
      if (match) {
        events.push(JSON.parse(match[1]));
      }
    }

    // Verify thread.item.replaced event was emitted
    const replacedEvent = events.find((e) => e.type === 'thread.item.replaced');
    expect(replacedEvent).toBeDefined();
    expect(replacedEvent).toMatchObject({
      type: 'thread.item.replaced',
      item: {
        type: 'client_tool_call',
        id: 'tool_123',
        status: 'completed',
        output: { answer: 8 },
      },
    });

    // Verify respond() was called with null message
    expect(server.respondCalls).toHaveLength(1);
    expect(server.respondCalls[0].message).toBeNull();

    // Verify assistant response was emitted
    const doneEvent = events.find((e) => e.type === 'thread.item.done');
    expect(doneEvent).toBeDefined();
  });

  it('should throw error when no pending tool call found', async () => {
    // Create thread with no pending tool calls
    const thread: ThreadMetadata = {
      id: 'thr_456',
      title: 'Empty Thread',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    const request = {
      type: 'threads.add_client_tool_output',
      params: {
        thread_id: thread.id,
        result: { answer: 42 },
      },
    };

    await expect(async () => {
      const result = await server.process(JSON.stringify(request), context);
      for await (const _ of result) {
        // Consume stream
      }
    }).rejects.toThrow('No pending client tool call found');
  });

  it('should only update pending tool calls, not completed ones', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_789',
      title: 'Test Thread',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Add a completed tool call (should be ignored)
    const completedTool: ClientToolCallItem = {
      type: 'client_tool_call',
      id: 'tool_old',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      status: 'completed',
      call_id: 'call_old',
      name: 'calculator',
      arguments: { operation: 'add', a: 1, b: 1 },
      output: { answer: 2 },
    };
    await store.addThreadItem(thread.id, completedTool, context);

    // Add a pending tool call
    const pendingTool: ClientToolCallItem = {
      type: 'client_tool_call',
      id: 'tool_new',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:02Z',
      status: 'pending',
      call_id: 'call_new',
      name: 'calculator',
      arguments: { operation: 'multiply', a: 5, b: 7 },
    };
    await store.addThreadItem(thread.id, pendingTool, context);

    server.respondEvents = [];

    const request = {
      type: 'threads.add_client_tool_output',
      params: {
        thread_id: thread.id,
        result: { answer: 35 },
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    const events: ThreadStreamEvent[] = [];
    for await (const chunk of result) {
      const match = chunk.match(/^data: (.+)\n\n$/);
      if (match) {
        events.push(JSON.parse(match[1]));
      }
    }

    // Should update the pending tool, not the completed one
    const replacedEvent = events.find(
      (e) => e.type === 'thread.item.replaced'
    ) as any;
    expect(replacedEvent.item.id).toBe('tool_new');
    expect(replacedEvent.item.status).toBe('completed');
    expect(replacedEvent.item.output).toEqual({ answer: 35 });
  });
});

describe('ChatKitServer - Phase 4: threads.retry_after_item', () => {
  let store: MockStore<{ userId: string }>;
  let server: TestServer;
  const context = { userId: 'test-user' };

  beforeEach(() => {
    store = new MockStore();
    server = new TestServer(store);
    server.reset();
  });

  it('should find and retry from last user message before specified item', async () => {
    // Create thread
    const thread: ThreadMetadata = {
      id: 'thr_retry',
      title: 'Retry Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Add user message
    const userMsg: UserMessageItem = {
      type: 'user_message',
      id: 'msg_user',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      content: [{ type: 'input_text', text: 'What is 2+2?' }],
      attachments: [],
      quoted_text: null,
      inference_options: {},
    };
    await store.addThreadItem(thread.id, userMsg, context);

    // Add assistant message (this is the item we want to retry after)
    const assistantMsg: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_assistant',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:02Z',
      content: [{ type: 'output_text', text: 'Error occurred', annotations: [] }],
    };
    await store.addThreadItem(thread.id, assistantMsg, context);

    // Configure retry response
    const retryResponse: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_retry',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:03Z',
      content: [{ type: 'output_text', text: '2+2 equals 4', annotations: [] }],
    };
    server.respondEvents = [{ type: 'thread.item.done', item: retryResponse }];

    const request = {
      type: 'threads.retry_after_item',
      params: {
        thread_id: thread.id,
        item_id: assistantMsg.id,
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    const events: ThreadStreamEvent[] = [];
    for await (const chunk of result) {
      const match = chunk.match(/^data: (.+)\n\n$/);
      if (match) {
        events.push(JSON.parse(match[1]));
      }
    }

    // Verify respond() was called with the user message
    expect(server.respondCalls).toHaveLength(1);
    expect(server.respondCalls[0].message).toMatchObject({
      id: 'msg_user',
      type: 'user_message',
      content: [{ type: 'input_text', text: 'What is 2+2?' }],
    });

    // Verify retry response was emitted
    const doneEvent = events.find((e) => e.type === 'thread.item.done');
    expect(doneEvent).toBeDefined();
  });

  it('should throw error when item not found', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_notfound',
      title: 'Not Found Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    const request = {
      type: 'threads.retry_after_item',
      params: {
        thread_id: thread.id,
        item_id: 'nonexistent_item',
      },
    };

    await expect(async () => {
      const result = await server.process(JSON.stringify(request), context);
      for await (const _ of result) {
        // Consume stream
      }
    }).rejects.toThrow('Item nonexistent_item not found in thread');
  });

  it('should throw error when no user message found before item', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_nouser',
      title: 'No User Message Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Add only an assistant message (no user message before it)
    const assistantMsg: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_assistant_only',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      content: [{ type: 'output_text', text: 'Hello', annotations: [] }],
    };
    await store.addThreadItem(thread.id, assistantMsg, context);

    const request = {
      type: 'threads.retry_after_item',
      params: {
        thread_id: thread.id,
        item_id: assistantMsg.id,
      },
    };

    await expect(async () => {
      const result = await server.process(JSON.stringify(request), context);
      for await (const _ of result) {
        // Consume stream
      }
    }).rejects.toThrow('No user message found before the specified item');
  });

  it('should find user message in thread with multiple items', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_multi',
      title: 'Multi Item Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Build conversation: user -> assistant -> user -> assistant (error)
    const msg1: UserMessageItem = {
      type: 'user_message',
      id: 'msg_user1',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      content: [{ type: 'input_text', text: 'First question' }],
      attachments: [],
      quoted_text: null,
      inference_options: {},
    };
    await store.addThreadItem(thread.id, msg1, context);

    const msg2: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_asst1',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:02Z',
      content: [{ type: 'output_text', text: 'First answer', annotations: [] }],
    };
    await store.addThreadItem(thread.id, msg2, context);

    const msg3: UserMessageItem = {
      type: 'user_message',
      id: 'msg_user2',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:03Z',
      content: [{ type: 'input_text', text: 'Second question' }],
      attachments: [],
      quoted_text: null,
      inference_options: {},
    };
    await store.addThreadItem(thread.id, msg3, context);

    const msg4: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_asst2',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:04Z',
      content: [{ type: 'output_text', text: 'Error', annotations: [] }],
    };
    await store.addThreadItem(thread.id, msg4, context);

    server.respondEvents = [];

    const request = {
      type: 'threads.retry_after_item',
      params: {
        thread_id: thread.id,
        item_id: msg4.id, // Retry after the error
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    for await (const _ of result) {
      // Consume stream
    }

    // Should retry with the second user message (msg_user2)
    expect(server.respondCalls).toHaveLength(1);
    expect(server.respondCalls[0].message?.id).toBe('msg_user2');
  });
});

describe('ChatKitServer - Phase 4: threads.custom_action', () => {
  let store: MockStore<{ userId: string }>;
  let server: TestServer;
  const context = { userId: 'test-user' };

  beforeEach(() => {
    store = new MockStore();
    server = new TestServer(store);
    server.reset();
  });

  it('should call action() with widget sender', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_action',
      title: 'Action Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Add a widget item
    const widget: WidgetItem = {
      type: 'widget',
      id: 'widget_123',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      widget: {
        type: 'container',
        children: [
          {
            type: 'button',
            text: 'Click me',
            action: {
              type: 'submit_form',
              payload: { form_id: 'test_form' },
            },
          },
        ],
      },
      copy_text: null,
    };
    await store.addThreadItem(thread.id, widget, context);

    // Configure action response
    const actionResponse: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_response',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:02Z',
      content: [{ type: 'output_text', text: 'Action processed', annotations: [] }],
    };
    server.actionEvents = [{ type: 'thread.item.done', item: actionResponse }];

    const request = {
      type: 'threads.custom_action',
      params: {
        thread_id: thread.id,
        item_id: widget.id,
        action: {
          type: 'submit_form',
          payload: { form_data: { name: 'Alice' } },
        },
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    const events: ThreadStreamEvent[] = [];
    for await (const chunk of result) {
      const match = chunk.match(/^data: (.+)\n\n$/);
      if (match) {
        events.push(JSON.parse(match[1]));
      }
    }

    // Verify action() was called with widget sender
    expect(server.actionCalls).toHaveLength(1);
    expect(server.actionCalls[0].action).toMatchObject({
      type: 'submit_form',
      payload: { form_data: { name: 'Alice' } },
    });
    expect(server.actionCalls[0].sender).toMatchObject({
      id: 'widget_123',
      type: 'widget',
    });

    // Verify response was emitted
    const doneEvent = events.find((e) => e.type === 'thread.item.done');
    expect(doneEvent).toBeDefined();
  });

  it('should handle action without sender widget', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_nosender',
      title: 'No Sender Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    server.actionEvents = [];

    const request = {
      type: 'threads.custom_action',
      params: {
        thread_id: thread.id,
        item_id: null, // No sender widget
        action: {
          type: 'custom_action',
          payload: { action: 'refresh' },
        },
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    for await (const _ of result) {
      // Consume stream
    }

    // Verify action() was called with null sender
    expect(server.actionCalls).toHaveLength(1);
    expect(server.actionCalls[0].sender).toBeNull();
  });

  it('should ignore non-widget items as sender', async () => {
    const thread: ThreadMetadata = {
      id: 'thr_wrongtype',
      title: 'Wrong Type Test',
      created_at: '2025-01-01T00:00:00Z',
      status: { type: 'active' },
      metadata: {},
    };
    await store.saveThread(thread, context);

    // Add a message (not a widget)
    const message: AssistantMessageItem = {
      type: 'assistant_message',
      id: 'msg_notwidget',
      thread_id: thread.id,
      created_at: '2025-01-01T00:00:01Z',
      content: [{ type: 'output_text', text: 'Hello', annotations: [] }],
    };
    await store.addThreadItem(thread.id, message, context);

    server.actionEvents = [];

    const request = {
      type: 'threads.custom_action',
      params: {
        thread_id: thread.id,
        item_id: message.id, // Reference a non-widget item
        action: {
          type: 'test_action',
        },
      },
    };

    const result = await server.process(JSON.stringify(request), context);
    for await (const _ of result) {
      // Consume stream
    }

    // Should treat as null sender since item is not a widget
    expect(server.actionCalls).toHaveLength(1);
    expect(server.actionCalls[0].sender).toBeNull();
  });
});
