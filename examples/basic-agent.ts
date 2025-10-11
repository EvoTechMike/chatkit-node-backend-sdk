/**
 * Basic Agent Example
 *
 * This example demonstrates how to integrate the OpenAI Agents SDK with ChatKit.
 * It shows the minimal setup needed to create an agent-powered chat application.
 *
 * Key concepts:
 * - Agent creation with model and instructions
 * - run() function with { stream: true } for streaming responses
 * - AgentContext to bridge Agent SDK and ChatKit
 * - streamAgentResponse() to convert Agent events to ChatKit events
 */

import express from 'express';
import { Agent, run } from '@openai/agents';
import {
  ChatKitServer,
  Store,
  agents,
  type ThreadMetadata,
  type UserMessageItem,
  type ThreadStreamEvent,
} from '../dist/index.js';

// Simple in-memory store for demo purposes
class MockStore extends Store {
  private threads = new Map();
  private items = new Map();
  private attachments = new Map();

  async loadThread(threadId: string) {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error(`Thread not found: ${threadId}`);
    return thread;
  }

  async saveThread(thread: any) {
    this.threads.set(thread.id, thread);
  }

  async deleteThread(threadId: string) {
    this.threads.delete(threadId);
    this.items.delete(threadId);
  }

  async loadThreads(limit: number, after: string | null, order: 'asc' | 'desc') {
    const threads = Array.from(this.threads.values());
    threads.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    let startIndex = 0;
    if (after) {
      startIndex = threads.findIndex((t: any) => t.id === after);
      if (startIndex !== -1) startIndex++;
    }

    const page = threads.slice(startIndex, startIndex + limit);
    return {
      data: page,
      has_more: startIndex + limit < threads.length,
      after: page.length > 0 ? page[page.length - 1].id : null,
    };
  }

  async loadThreadItems(
    threadId: string,
    after: string | null,
    limit: number,
    order: 'asc' | 'desc'
  ) {
    const items = this.items.get(threadId) || [];
    const sorted = [...items].sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    let startIndex = 0;
    if (after) {
      startIndex = sorted.findIndex((i: any) => i.id === after);
      if (startIndex !== -1) startIndex++;
    }

    const page = sorted.slice(startIndex, startIndex + limit);
    return {
      data: page,
      has_more: startIndex + limit < sorted.length,
      after: page.length > 0 ? page[page.length - 1].id : null,
    };
  }

  async addThreadItem(threadId: string, item: any) {
    if (!this.items.has(threadId)) {
      this.items.set(threadId, []);
    }
    this.items.get(threadId).push(item);
  }

  async saveItem(threadId: string, item: any) {
    const items = this.items.get(threadId) || [];
    const index = items.findIndex((i: any) => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
    }
  }

  async loadItem(threadId: string, itemId: string) {
    const items = this.items.get(threadId) || [];
    const item = items.find((i: any) => i.id === itemId);
    if (!item) throw new Error(`Item not found: ${itemId}`);
    return item;
  }

  async deleteThreadItem(threadId: string, itemId: string) {
    const items = this.items.get(threadId) || [];
    const index = items.findIndex((i: any) => i.id === itemId);
    if (index !== -1) {
      items.splice(index, 1);
    }
  }

  async saveAttachment(attachment: any) {
    this.attachments.set(attachment.id, attachment);
  }

  async loadAttachment(attachmentId: string) {
    const attachment = this.attachments.get(attachmentId);
    if (!attachment) throw new Error(`Attachment not found: ${attachmentId}`);
    return attachment;
  }

  async deleteAttachment(attachmentId: string) {
    this.attachments.delete(attachmentId);
  }
}

/**
 * ChatKit server powered by OpenAI Agents SDK
 */
class AgentChatKitServer extends ChatKitServer<{ userId: string }> {
  // Create an Agent with model and instructions
  private assistantAgent = new Agent({
    model: 'gpt-4o',
    name: 'Assistant',
    instructions: `You are a helpful AI assistant integrated with ChatKit using the OpenAI Agents SDK.

You have a friendly, conversational personality. You're knowledgeable about:
- Programming and software development
- Science and technology
- General knowledge and problem-solving

Keep your responses concise but informative. Be engaging and helpful!`,
  });

  async *respond(
    thread: ThreadMetadata,
    input: UserMessageItem | null,
    context: { userId: string }
  ): AsyncGenerator<ThreadStreamEvent> {
    if (!input) {
      return;
    }

    console.log(`[${context.userId}] Processing user message in thread ${thread.id}`);

    try {
      // ✅ IMPORTANT: Use createAgentContext() helper
      // This sets up the internal event queue needed for widget streaming
      const agentContext = agents.createAgentContext<{ userId: string }>(
        thread,
        this.store,
        context
      );

      // Convert ChatKit user message to Agent SDK input format
      const agentInput = await agents.simpleToAgentInput(input);

      // Run the agent with streaming
      const runnerStream = await run(
        this.assistantAgent,
        agentInput,
        { stream: true, context: agentContext }
      );

      // Convert Agent SDK stream events to ChatKit events
      for await (const event of agents.streamAgentResponse(agentContext, runnerStream)) {
        yield event;
      }

      // Auto-generate thread title from first exchange
      if (!thread.title) {
        const userText = input.content
          .filter((c) => c.type === 'input_text')
          .map((c) => c.text)
          .join(' ');
        thread.title = userText.slice(0, 50) + (userText.length > 50 ? '...' : '');
      }
    } catch (error) {
      console.error(`[${context.userId}] Error:`, error);

      // Emit error event
      yield {
        type: 'error',
        code: 'agent_error',
        message: error instanceof Error ? error.message : 'An error occurred',
        allow_retry: true,
      };
    }
  }
}

// Create Express app
const app = express();
app.use(express.json());

// Enable CORS for frontend development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, chatkit-frame-instance-id, X-User-ID');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Create store and server
const store = new MockStore();
const server = new AgentChatKitServer(store);

// ChatKit endpoint
app.post('/chatkit', async (req, res) => {
  const context = { userId: req.headers['x-user-id'] as string || 'anonymous' };

  try {
    const result = await server.process(JSON.stringify(req.body), context);

    if (result.isStreaming) {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream events
      for await (const chunk of result) {
        res.write(chunk);
      }
      res.end();
    } else {
      // Non-streaming response
      res.json(result.toJSON());
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    integration: 'agents-sdk',
    model: 'gpt-4o',
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🤖 Basic Agent Example - ChatKit + OpenAI Agents SDK         ║
╠════════════════════════════════════════════════════════════════╣
║  Server:     http://localhost:${PORT}                              ║
║  Endpoint:   http://localhost:${PORT}/chatkit                      ║
║  Health:     http://localhost:${PORT}/health                       ║
╠════════════════════════════════════════════════════════════════╣
║  Integration: OpenAI Agents SDK                                ║
║  Model:       GPT-4o                                           ║
║  Features:    Streaming responses, Auto-titles                 ║
╠════════════════════════════════════════════════════════════════╣
║  Next: Point your ChatKit frontend to this endpoint!          ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
