/**
 * Hello World ChatKit Server Example
 *
 * This is the simplest possible ChatKit server that echoes back what the user says.
 * Use this to verify the integration between your Node.js backend and ChatKit frontend.
 *
 * Usage:
 *   1. Build the SDK: npm run build (from root)
 *   2. Run this file: node examples/hello-world.ts
 *   3. Configure your ChatKit frontend to point to: http://localhost:3000/chatkit
 *   4. Send a test message
 */

import express from 'express';
import { ChatKitServer } from '../src/server/ChatKitServer.js';
import { MockStore } from '../tests/helpers/MockStore.js';
import type {
  ThreadMetadata,
  UserMessageItem,
  ThreadStreamEvent,
  AssistantMessageItem,
} from '../src/types/index.js';

/**
 * Simple server that echoes back user messages
 */
class HelloWorldServer extends ChatKitServer<{ userId: string }> {
  async *respond(
    thread: ThreadMetadata,
    inputUserMessage: UserMessageItem | null,
    context: { userId: string }
  ): AsyncGenerator<ThreadStreamEvent> {
    if (!inputUserMessage) {
      // This shouldn't happen in threads.create, but handle it gracefully
      return;
    }

    // Extract user's text from the message
    const userText = inputUserMessage.content
      .filter((c) => c.type === 'input_text')
      .map((c) => c.text)
      .join(' ');

    console.log(`[${context.userId}] User said: "${userText}"`);

    // Generate a simple echo response
    const assistantMessage: AssistantMessageItem = {
      type: 'assistant_message',
      id: this.store.generateItemId('message', thread, context),
      thread_id: thread.id,
      created_at: new Date().toISOString(),
      content: [
        {
          type: 'output_text',
          text: `Hello! You said: "${userText}"`,
          annotations: [],
        },
      ],
    };

    // Emit the assistant message
    yield {
      type: 'thread.item.done',
      item: assistantMessage,
    };
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

// Create in-memory store and server
const store = new MockStore<{ userId: string }>();
const server = new HelloWorldServer(store);

// ChatKit endpoint
app.post('/chatkit', async (req, res) => {
  const context = { userId: req.body.user_id || 'anonymous' };

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
  } catch (error: any) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Hello World ChatKit Server                                    ║
╠════════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                       ║
║  ChatKit endpoint:  http://localhost:${PORT}/chatkit               ║
║  Health check:      http://localhost:${PORT}/health                ║
╠════════════════════════════════════════════════════════════════╣
║  Next steps:                                                   ║
║  1. Open http://localhost:3000 in your browser                 ║
║  2. The frontend will connect to this backend automatically    ║
║  3. Send a test message and verify you get an echo response    ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
