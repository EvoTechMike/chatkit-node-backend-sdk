# ChatKit server integration

ChatKit's server integration offers a flexible and framework-agnostic approach for building realtime chat experiences. By implementing the `ChatKitServer` base class and its `respond` method, you can configure how your workflow responds to user inputs, from using tools to returning rich display widgets. The ChatKit server integration exposes a single endpoint and supports JSON and server‑sent events (SSE) to stream real-time updates.

## Installation

Install the `chatkit-node` package with the following command:

```bash
npm install chatkit-node
```

## Quick Start Checklist

Before you begin:

1. ✅ **Model**: Examples use `gpt-5` (OpenAI's latest reasoning model). Use `gpt-4o` or other models as needed.
2. ✅ **AgentContext**: Always use `agents.createAgentContext()` - don't create context objects manually. The helper sets up internal event queues required for widget streaming.
3. ✅ **Store**: You must implement the `Store` interface yourself. No concrete implementation is provided.
4. ✅ **Agents SDK**: Install `@openai/agents` separately: `npm install @openai/agents`

## Defining a server class

The `ChatKitServer` base class is the main building block of the ChatKit server implementation.

The `respond` method is executed each time a user sends a message. It is responsible for providing an answer by streaming a set of events. The `respond` method can return assistant messages, tool status messages, workflows, tasks, and widgets.

ChatKit also provides helpers to implement `respond` using Agents SDK. The main one is `streamAgentResponse`, which converts a streamed Agents SDK run into ChatKit events.

If you've enabled model or tool options in the composer, they'll appear in `respond` under `inputUserMessage.inferenceOptions`. Your integration is responsible for handling these values when performing inference.

Example server implementation that calls the Agent SDK runner and streams the result to the ChatKit UI:

```typescript
import { ChatKitServer, Store, ThreadMetadata, UserMessageItem, ThreadStreamEvent } from 'chatkit-node';
import { Agent, run } from '@openai/agents';
import { agents } from 'chatkit-node';

class MyChatKitServer<TContext> extends ChatKitServer<TContext> {
  constructor(dataStore: Store<TContext>, attachmentStore?: AttachmentStore<TContext>) {
    super(dataStore, attachmentStore);
  }

  assistantAgent = new Agent({
    model: 'gpt-5',
    name: 'Assistant',
    instructions: 'You are a helpful assistant'
  });

  async *respond(
    thread: ThreadMetadata,
    input: UserMessageItem | null,
    context: TContext
  ): AsyncGenerator<ThreadStreamEvent> {
    // ✅ IMPORTANT: Use createAgentContext() helper
    // This sets up the internal event queue needed for widget streaming
    const agentContext = agents.createAgentContext(
      thread,
      this.store,
      context
    );

    const result = await run(
      this.assistantAgent,
      input ? await agents.simpleToAgentInput(input) : [],
      { stream: true, context: agentContext }
    );

    for await (const event of agents.streamAgentResponse(agentContext, result)) {
      yield event;
    }
  }

  // ...
}
```

## Setting up the endpoint

ChatKit is server-agnostic. All communication happens through a single POST endpoint that returns either JSON directly or streams SSE JSON events.

You are responsible for defining the endpoint using the web server framework of your choice.

Example using ChatKit with Express:

```typescript
import express from 'express';
import { MyChatKitServer } from './MyChatKitServer';
import { MyStore } from './MyStore'; // Your Store implementation
import { MyAttachmentStore } from './MyAttachmentStore'; // Your AttachmentStore implementation (optional)

const app = express();
const dataStore = new MyStore();
const attachmentStore = new MyAttachmentStore(); // Optional - only needed for file uploads
const server = new MyChatKitServer(dataStore, attachmentStore);

app.post('/chatkit', async (req, res) => {
  const result = await server.process(JSON.stringify(req.body), {});

  if (result.isStreaming) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result) {
      res.write(chunk);
    }
    res.end();
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.send(result.toJSON());
  }
});
```

## Data store

ChatKit needs to store information about threads, messages, and attachments. **You are responsible for implementing the `Store` abstract class** - no concrete implementation is provided with the SDK.

For development/testing, you can use an in-memory store (see `tests/helpers/MockStore.ts` for a reference implementation).

For production, you must implement the `Store` interface using your database of choice (PostgreSQL, MySQL, MongoDB, etc.). When implementing the store, you must allow for the Thread/Attachment/ThreadItem type shapes changing between library versions. The recommended approach for relational databases is to **serialize models into JSON-typed columns** instead of separating model fields across multiple columns.

```typescript
import { ThreadMetadata, ThreadItem, Attachment, Page } from 'chatkit-node';

abstract class Store<TContext> {
  generateThreadId(context: TContext): string { /* ... */ }

  generateItemId(
    itemType: 'message' | 'tool_call' | 'task' | 'workflow' | 'attachment',
    thread: ThreadMetadata,
    context: TContext
  ): string { /* ... */ }

  abstract loadThread(threadId: string, context: TContext): Promise<ThreadMetadata>;

  abstract saveThread(thread: ThreadMetadata, context: TContext): Promise<void>;

  abstract loadThreadItems(
    threadId: string,
    after: string | null,
    limit: number,
    order: string,
    context: TContext
  ): Promise<Page<ThreadItem>>;

  abstract saveAttachment(attachment: Attachment, context: TContext): Promise<void>;

  abstract loadAttachment(attachmentId: string, context: TContext): Promise<Attachment>;

  abstract deleteAttachment(attachmentId: string, context: TContext): Promise<void>;

  abstract loadThreads(
    limit: number,
    after: string | null,
    order: string,
    context: TContext
  ): Promise<Page<ThreadMetadata>>;

  abstract addThreadItem(
    threadId: string,
    item: ThreadItem,
    context: TContext
  ): Promise<void>;

  abstract saveItem(
    threadId: string,
    item: ThreadItem,
    context: TContext
  ): Promise<void>;

  abstract loadItem(
    threadId: string,
    itemId: string,
    context: TContext
  ): Promise<ThreadItem>;

  abstract deleteThread(threadId: string, context: TContext): Promise<void>;
}
```

The default implementation prefixes identifiers (for example `msg_4f62d6a7f2c34bd084f57cfb3df9f6bd`) using UUID4 strings. Override `generateThreadId` and/or `generateItemId` if your
integration needs deterministic or pre-allocated identifiers; they will be used whenever ChatKit needs to create a new thread id or a new thread item id.

## Attachment store

Users can upload attachments (files and images) to include with chat messages. You are responsible for providing a storage implementation and handling uploads. The `attachmentStore` argument to `ChatKitServer` should implement the `AttachmentStore` interface. If not provided, operations on attachments will raise an error.

ChatKit supports both direct uploads and two‑phase upload, configurable client-side via `ChatKitOptions.composer.attachments.uploadStrategy`.

### Access control

Attachment metadata and file bytes are not protected by ChatKit. Each `AttachmentStore` method receives your request context so you can enforce thread- and user-level authorization before handing out attachment IDs, bytes, or signed URLs. Deny access when the caller does not own the attachment, and generate download URLs that expire quickly. Skipping these checks can leak customer data.

### Direct upload

The direct upload URL is provided client-side as a create option.

The client will POST `multipart/form-data` with a `file` field to that URL. The server should:

1. persist the attachment metadata (`FileAttachment | ImageAttachment`) to the data store and the file bytes to your storage.
2. respond with JSON representation of `FileAttachment | ImageAttachment`.

### Two‑phase upload

- **Phase 1 (registration and upload URL provisioning)**: The client calls `attachments.create`. ChatKit persists a `FileAttachment | ImageAttachment` sets the `upload_url` and returns it. It's recommended to include the `id` of the `Attachment` in the `upload_url` so that you can associate the file bytes with the `Attachment`.
- **Phase 2 (upload)**: The client POSTs the bytes to the returned `upload_url` with `multipart/form-data` field `file`.

### Previews

To render thumbnails of an image attached to a user message, set `ImageAttachment.previewUrl` to a renderable URL. If you need expiring URLs, do not persist the URL; generate it on demand when returning the attachment to the client.

### AttachmentStore interface

You implement the storage specifics by providing the `AttachmentStore` methods:

```typescript
import { Attachment, AttachmentCreateParams } from 'chatkit-node';

abstract class AttachmentStore<TContext> {
  abstract deleteAttachment(attachmentId: string, context: TContext): Promise<void>;
  abstract createAttachment(
    input: AttachmentCreateParams,
    context: TContext
  ): Promise<Attachment>;
  generateAttachmentId(mimeType: string, context: TContext): string { /* ... */ }
}
```

Note: The store does not have to persist bytes itself. It can act as a proxy that issues signed URLs for upload and preview (e.g., S3/GCS/Azure), while your separate upload endpoint writes to object storage.

### Attaching files to Agent SDK inputs

You are also responsible for deciding how to attach attachments to Agent SDK inputs. You can store files in your own storage and attach them as base64-encoded payloads or upload them to the OpenAI Files API and provide the file ID to the Agent SDK.

The example below shows how to create base64-encoded payloads for attachments by customizing a `ThreadItemConverter`. The helper `readAttachmentBytes` stands in for whatever storage accessor you provide (for example, fetching from S3 or a database) because `AttachmentStore` only handles ChatKit protocol calls.

```typescript
import { ThreadItemConverter, ImageAttachment, FileAttachment, Attachment } from 'chatkit-node';
import { ResponseInputContentParam, ResponseInputImageParam, ResponseInputFileParam } from '@openai/agents-sdk';

async function readAttachmentBytes(attachmentId: string): Promise<Buffer> {
  // Replace with your blob-store fetch (S3, local disk, etc.)
  throw new Error('Not implemented');
}

class MyConverter extends ThreadItemConverter {
  async attachmentToMessageContent(
    input: Attachment
  ): Promise<ResponseInputContentParam> {
    const content = await readAttachmentBytes(input.id);
    const data = `data:${input.mimeType};base64,${content.toString('base64')}`;

    if ('width' in input) { // ImageAttachment
      return {
        type: 'input_image',
        detail: 'auto',
        imageUrl: data,
      } as ResponseInputImageParam;
    }

    // Note: Agents SDK currently only supports pdf files as ResponseInputFileParam.
    // To send other text file types, either convert them to pdf on the fly or
    // add them as input text.
    return {
      type: 'input_file',
      fileData: data,
      filename: input.name || 'unknown',
    } as ResponseInputFileParam;
  }
}

// In respond(...):
const result = Runner.runStreamed(
  assistantAgent,
  await new MyConverter().toAgentInput(input),
  { context }
);
```

## Client tools usage

The ChatKit server implementation can trigger client-side tools.

The tool must be registered both when initializing ChatKit on the client and when setting up Agents SDK on the server.

To trigger a client-side tool from Agents SDK, set `ctx.context.clientToolCall` in the tool implementation with the client-side tool name and arguments. The result of the client tool execution will be provided back to the model.

**Note:** The agent behavior must be set to `toolUseBehavior: stopAtTools()` with all client-side tools included in `stopAtToolNames`. This causes the agent to stop generating new messages until the client tool call is acknowledged by the ChatKit UI.

**Note:** Only one client tool call can be triggered per turn.

**Note:** Client tools are client-side callbacks invoked by the agent during server-side inference. If you're interested in client-side callbacks triggered by a user interacting with a widget, refer to [client actions](actions.md/#client).

```typescript
import { tool } from '@openai/agents';
import type { agents } from 'chatkit-node';

const addToTodoList = tool({
  name: 'add_to_todo_list',
  description: 'Add an item to the user\'s todo list.',
  parameters: {
    type: 'object',
    properties: {
      item: { type: 'string' }
    },
    required: ['item']
  },
  async execute({ item }: { item: string }, { context }: { context: agents.AgentContext }) {
    context.clientToolCall = {
      name: 'add_to_todo_list',
      arguments: { item },
    };
  }
});

const assistantAgent = new Agent({
  model: 'gpt-5',
  name: 'Assistant',
  instructions: 'You are a helpful assistant',
  tools: [addToTodoList],
  // Note: Configure toolUseBehavior to stop at client tools
});
```

## Agents SDK integration

The ChatKit server is independent of Agents SDK. As long as correct events are returned from the `respond` method, the ChatKit UI will display the conversation as expected.

The ChatKit library provides helpers to integrate with Agents SDK:

- `AgentContext` - The context type that should be used when calling Agents SDK. It provides helpers to stream events from tool calls, render widgets, and initiate client tool calls.
- `streamAgentResponse` - A helper to convert a streamed Agents SDK run into ChatKit events.
- `ThreadItemConverter` - A helper class that you'll probably extend to convert ChatKit thread items to Agents SDK input items.
- `simpleToAgentInput` - A helper function that uses the default thread item conversions. The default conversion is limited, but useful for getting started quickly.

```typescript
async *respond(
  thread: ThreadMetadata,
  input: UserMessageItem | null,
  context: TContext
): AsyncGenerator<ThreadStreamEvent> {
  // ✅ Use createAgentContext() to properly set up the event queue
  const agentContext = agents.createAgentContext(
    thread,
    this.store,
    context
  );

  const result = await run(
    this.assistantAgent,
    input ? await agents.simpleToAgentInput(input) : [],
    { stream: true, context: agentContext }
  );

  for await (const event of agents.streamAgentResponse(agentContext, result)) {
    yield event;
  }
}
```

### ThreadItemConverter

Extend `ThreadItemConverter` when your integration supports:

- Attachments
- @-mentions (entity tagging)
- `HiddenContextItem`
- Custom thread item formats

```typescript
import { Message, Runner, ResponseInputTextParam } from '@openai/agents-sdk';
import {
  AgentContext,
  ThreadItemConverter,
  streamAgentResponse
} from 'chatkit-node/agents';
import {
  Attachment,
  HiddenContextItem,
  ThreadMetadata,
  UserMessageItem,
  ImageAttachment,
  UserMessageTagContent
} from 'chatkit-node';

class MyThreadConverter extends ThreadItemConverter {
  async attachmentToMessageContent(
    attachment: Attachment
  ): Promise<ResponseInputTextParam> {
    const content = await attachmentStore.getAttachmentContents(attachment.id);
    const dataUrl = `data:${attachment.mimeType};base64,${content.toString('base64')}`;

    if ('width' in attachment) { // ImageAttachment
      return {
        type: 'input_image',
        detail: 'auto',
        imageUrl: dataUrl,
      };
    }

    // ..handle other attachment types
  }

  hiddenContextToInput(item: HiddenContextItem): Message {
    return {
      type: 'message',
      role: 'system',
      content: [
        {
          type: 'input_text',
          text: `<HIDDEN_CONTEXT>${item.content}</HIDDEN_CONTEXT>`,
        }
      ],
    };
  }

  async tagToMessageContent(tag: UserMessageTagContent): Promise<ResponseInputTextParam> {
    const tagContext = await retrieveContextForTag(tag.id);
    return {
      type: 'input_text',
      text: `<TAG>Name:${tag.data.name}\nType:${tag.data.type}\nDetails:${tagContext}</TAG>`
    };

    // ..handle other @-mentions
  }

  // ..override defaults for other methods
}
```

## Widgets

Widgets are rich UI components that can be displayed in chat. You can return a widget either directly from the `respond` method (if you want to do so unconditionally) or from a tool call triggered by the model.

Example of a widget returned directly from the `respond` method:

```typescript
import { streamWidget } from 'chatkit-node/server';

async *respond(
  thread: ThreadMetadata,
  input: UserMessageItem | null,
  context: TContext
): AsyncGenerator<ThreadStreamEvent> {
  // Approach 1: Plain object (flexible, JSON-first)
  const widget = {
    type: 'Card',
    children: [
      { type: 'Text', id: 'description', value: 'Text widget' }
    ]
  };

  // Approach 2: Class instances (type-safe, if you prefer)
  // import { Text, Card } from 'chatkit-node/widgets';
  // const widget = new Card({
  //   children: [new Text({ id: 'description', value: 'Text widget' })]
  // });

  for await (const event of streamWidget(
    thread,
    widget,
    null, // copyText
    (itemType) => this.store.generateItemId(itemType, thread, context)
  )) {
    yield event;
  }
}
```

Example of a widget returned from a tool call:

```typescript
import { tool } from '@openai/agents';
import type { agents } from 'chatkit-node';

const sampleWidget = tool({
  name: 'sample_widget',
  description: 'Display a sample widget to the user.',
  parameters: { type: 'object', properties: {} },
  async execute(_params: {}, { context }: { context: agents.AgentContext }) {
    // Plain object approach (matches your implementation)
    const widget = {
      type: 'Card',
      children: [
        { type: 'Text', id: 'description', value: 'Text widget' }
      ]
    };

    await context.streamWidget(widget);
  }
});
```

The examples above return a fully completed static widget. You can also stream an updating widget by yielding new versions of the widget from a generator function. The ChatKit framework will send updates for the parts of the widget that have changed.

**Note:** Currently, only `<Text>` and `<Markdown>` components marked with an `id` have their text updates streamed.

```typescript
const sampleWidget = tool({
  name: 'sample_widget',
  description: 'Display a sample widget to the user.',
  parameters: { type: 'object', properties: {} },
  async execute(_params: {}, { context }: { context: agents.AgentContext }) {
    const descriptionText = await run(
      emailGenerator,
      'ChatKit is the best thing ever',
      { stream: true }
    );

    async function* widgetGenerator() {
      const textWidgetUpdates = agents.accumulateText(
        descriptionText,
        {
          type: 'Text',
          id: 'description',
          value: '',
          streaming: true
        }
      );

      for await (const textWidget of textWidgetUpdates) {
        yield {
          type: 'Card',
          children: [textWidget]
        };
      }
    }

    await context.streamWidget(widgetGenerator());
  }
});
```

In the example above, the `accumulateText` function is used to stream the results of an Agents SDK run into a `Text` widget.

### Defining a widget

You may find it easier to write widgets in JSON. You can parse JSON widgets to `WidgetRoot` instances for your server to stream:

```typescript
import { WidgetRoot } from 'chatkit-node/widgets';

try {
  const widget = WidgetRoot.parse(JSON.parse(WIDGET_JSON_STRING));
} catch (error) {
  // handle invalid json
}
```

### Widget reference and examples

See full reference of components, props, and examples in [widgets.md ➡️](./widgets.md).

## Thread metadata

ChatKit provides a way to store arbitrary information associated with a thread. This information is not sent to the UI.

One use case for the metadata is to preserve the [`previous_response_id`](https://platform.openai.com/docs/api-reference/responses/create#responses-create-previous_response_id) and avoid having to re-send all items for an Agent SDK run.

```typescript
const previousResponseId = thread.metadata?.['previous_response_id'];

// Run the Agent SDK run with the previous response id
const result = Runner.runStreamed(
  agent,
  { input: /* ... */ },
  { previousResponseId }
);

// Save the previous response id for the next run
thread.metadata = thread.metadata || {};
thread.metadata['previous_response_id'] = result.responseId;
```

## Automatic thread titles

ChatKit does not automatically title threads, but you can easily implement your own logic to do so.

First, decide when to trigger the thread title update. A simple approach might be to set the thread title the first time a user sends a message.

```typescript
import { agents, run } from 'chatkit-node';
import type { ThreadMetadata, UserMessageItem } from 'chatkit-node';

async function maybeUpdateThreadTitle(
  thread: ThreadMetadata,
  inputItem: UserMessageItem,
): Promise<void> {
  if (thread.title !== null && thread.title !== undefined) {
    return;
  }
  const agentInput = await agents.simpleToAgentInput(inputItem);
  const result = await run(titleAgent, agentInput);
  thread.title = result.finalOutput;
}

async *respond(
  thread: ThreadMetadata,
  input: UserMessageItem | null,
  context: TContext
): AsyncGenerator<ThreadStreamEvent> {
  if (input !== null) {
    // Fire and forget - don't await
    this.maybeUpdateThreadTitle(thread, input).catch(console.error);
  }

  // Generate the model response
  // ...
}
```

## Progress updates

If your server-side tool takes a while to run, you can use the progress update event to display the progress to the user.

```typescript
import { tool } from '@openai/agents';
import type { agents } from 'chatkit-node';
import type { ProgressUpdateEvent } from 'chatkit-node';

const longRunningTool = tool({
  name: 'long_running_tool',
  description: 'A tool that takes a while to run',
  parameters: { type: 'object', properties: {} },
  async execute(_params: {}, { context }: { context: agents.AgentContext }): Promise<string> {
    await context.stream({
      type: 'progress_update',
      text: 'Loading a user profile...'
    } as ProgressUpdateEvent);

    await new Promise(resolve => setTimeout(resolve, 1000));

    return 'Done';
  }
});
```

The progress update will be automatically replaced by the next assistant message, widget, or another progress update.

## Server context

Sometimes it's useful to pass additional information (like `userId`) to the ChatKit server implementation. The `ChatKitServer.process` method accepts a `context` parameter that it passes to the `respond` method and all data store and file store methods.

```typescript
interface MyContext {
  userId: string;
}

class MyChatKitServer extends ChatKitServer<MyContext> {
  async *respond(
    thread: ThreadMetadata,
    input: UserMessageItem | null,
    context: MyContext
  ): AsyncGenerator<ThreadStreamEvent> {
    // consume context.userId
  }
}

await server.process(/* ... */, { userId: 'user_123' });
```

Server context may be used to implement permission checks in AttachmentStore and Store.

```typescript
class MyChatKitServer extends ChatKitServer<MyContext> {
  async loadAttachment(
    attachmentId: string,
    context: MyContext
  ): Promise<Attachment> {
    // check context.userId has access to the file
  }
}
```
