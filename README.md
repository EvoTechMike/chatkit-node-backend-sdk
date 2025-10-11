# ChatKit Node.js SDK

Node.js/TypeScript SDK for building ChatKit custom backend integrations with OpenAI Agents SDK.

[![npm version](https://badge.fury.io/js/%40chatkit%2Fnode.svg)](https://www.npmjs.com/package/@chatkit/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🤖 **OpenAI Agents SDK Integration** - Seamless integration with the OpenAI Agents SDK for AI-powered conversations
- 🔄 **Streaming Support** - Real-time Server-Sent Events (SSE) for streaming responses
- 🎨 **Rich Widgets** - Display charts, cards, forms, and interactive UI components
- 🛠️ **Client-Side Tools** - Execute tools on the client side with automatic synchronization
- 📦 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🔌 **Framework Agnostic** - Works with Express, Fastify, or any Node.js HTTP framework

## Installation

```bash
npm install @chatkit/node @openai/agents zod
```

## Quick Start

### 1. Implement the Store

Create a custom store implementation to persist threads and messages:

```typescript
import { Store, ThreadMetadata, ThreadItem } from '@chatkit/node';

class MyStore extends Store {
  async loadThread(threadId: string, context: any) {
    // Load thread from your database
    return await db.threads.findById(threadId);
  }

  async saveThread(thread: ThreadMetadata, context: any) {
    await db.threads.save(thread);
  }

  async loadThreadItems(threadId: string, after: string | null, limit: number, order: string, context: any) {
    const items = await db.items.findByThread(threadId, { after, limit, order });
    return {
      data: items,
      has_more: items.length === limit,
      after: items[items.length - 1]?.id || null
    };
  }

  async addThreadItem(threadId: string, item: ThreadItem, context: any) {
    await db.items.create({ threadId, ...item });
  }

  // Implement other required Store methods...
}
```

### 2. Create Your ChatKit Server

Extend `ChatKitServer` and implement the `respond` method:

```typescript
import { ChatKitServer, agents } from '@chatkit/node';
import { Agent, run } from '@openai/agents';

class MyChatKitServer extends ChatKitServer {
  constructor(store: Store) {
    super(store);

    this.agent = new Agent({
      model: 'gpt-5',
      name: 'Assistant',
      instructions: 'You are a helpful AI assistant.',
      tools: [/* your tools */]
    });
  }

  async *respond(thread, inputUserMessage, context) {
    if (!inputUserMessage) return;

    // Create AgentContext with widget support
    const agentContext = agents.createAgentContext(thread, this.store, context);

    // Convert ChatKit message to Agent SDK format
    const agentInput = await agents.simpleToAgentInput(inputUserMessage);

    // Run the agent with streaming
    const runnerStream = await run(this.agent, agentInput, {
      stream: true,
      context: agentContext
    });

    // Stream events to the client
    for await (const event of agents.streamAgentResponse(agentContext, runnerStream)) {
      yield event;
    }

    // Auto-generate thread title
    if (!thread.title) {
      thread.title = this.generateTitle(inputUserMessage);
    }
  }

  generateTitle(message) {
    const text = message.content
      .filter(c => c.type === 'input_text')
      .map(c => c.text)
      .join(' ');
    return text.slice(0, 50) + (text.length > 50 ? '...' : '');
  }
}
```

### 3. Set Up the HTTP Endpoint

Use with Express (or any framework):

```typescript
import express from 'express';

const app = express();
app.use(express.json());

const store = new MyStore();
const server = new MyChatKitServer(store);

app.post('/chatkit', async (req, res) => {
  const context = { userId: req.headers['x-user-id'] || 'anonymous' };
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
    res.json(result.toJSON());
  }
});

app.listen(3000, () => {
  console.log('ChatKit server running on http://localhost:3000');
});
```

## Widgets

Display rich UI components in your chat:

```typescript
import { tool } from '@openai/agents';
import { z } from 'zod';

const showChartTool = tool({
  name: 'show_chart',
  description: 'Display a chart to the user',
  parameters: z.object({
    title: z.string()
  }),
  execute: async ({ title }, { context }) => {
    await context.streamWidget({
      type: 'Card',
      children: [
        { type: 'Title', value: title },
        {
          type: 'Chart',
          data: [
            { month: 'Jan', sales: 30 },
            { month: 'Feb', sales: 45 },
            { month: 'Mar', sales: 60 }
          ],
          series: [
            { type: 'bar', dataKey: 'sales', label: 'Sales', color: 'blue' }
          ],
          xAxis: 'month',
          showLegend: true
        }
      ]
    });

    return 'Chart displayed';
  }
});
```

## Client-Side Tools

Execute tools on the client side:

```typescript
const addToTodoTool = tool({
  name: 'add_to_todo_list',
  description: 'Add a task to the user\'s todo list',
  parameters: z.object({
    task: z.string(),
    priority: z.enum(['low', 'medium', 'high'])
  }),
  execute: async ({ task, priority }, { context }) => {
    // Trigger client-side execution
    context.clientToolCall = {
      name: 'add_to_todo_list',
      arguments: { task, priority }
    };

    return `I'll add "${task}" to your todo list`;
  }
});
```

## Documentation

- **[Full Documentation](https://evotechmike.github.io/chatkit-node-backend-sdk/)** - Complete guides and API reference
- **[Server Integration Guide](https://evotechmike.github.io/chatkit-node-backend-sdk/server/)** - Detailed server setup
- **[Widgets Guide](https://evotechmike.github.io/chatkit-node-backend-sdk/widgets/)** - Widget components and examples
- **[Actions Guide](https://evotechmike.github.io/chatkit-node-backend-sdk/actions/)** - Client-side interactions

## Examples

See the [`examples/`](./examples) directory for complete working examples:

- **Basic Server** - Simple ChatKit server setup
- **Advanced Server** - Full-featured server with widgets, tools, and reasoning
- **Custom Store** - Database-backed store implementation

## Requirements

- Node.js >= 18.0.0
- OpenAI API key (for Agents SDK)

## API Reference

Full TypeScript API documentation is available at:
**https://evotechmike.github.io/chatkit-node-backend-sdk/api/**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © EvoTechMike

## Links

- [GitHub Repository](https://github.com/EvoTechMike/chatkit-node-backend-sdk)
- [Documentation](https://evotechmike.github.io/chatkit-node-backend-sdk/)
- [Issue Tracker](https://github.com/EvoTechMike/chatkit-node-backend-sdk/issues)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-js)
- [ChatKit JS Docs](https://openai.github.io/chatkit-js/)
