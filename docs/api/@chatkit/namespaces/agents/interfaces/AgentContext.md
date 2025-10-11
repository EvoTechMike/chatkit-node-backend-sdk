[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / AgentContext

# Interface: AgentContext\<TContext\>

Defined in: src/agents/types.ts:121

Context object passed to Agent execution that combines ChatKit-specific data
with user-defined request context.

This allows Agents to access the current thread, store, and any custom
context data (like user ID, tenant ID, etc.) during execution.

Provides methods for tools to emit custom events (widgets, workflows, etc.)
that will be merged with Agent SDK response streams.

## Example

```typescript
interface MyContext {
  userId: string;
  tenantId: string;
}

const agentContext: AgentContext<MyContext> = {
  thread: currentThread,
  store: myStore,
  requestContext: { userId: 'user123', tenantId: 'tenant456' },
  _events: new AsyncEventQueue()
};

// In a tool:
await agentContext.streamWidget(myWidget);
```

## Type Parameters

### TContext

`TContext` = `unknown`

The user-defined context type (default: unknown)

## Properties

### thread

> **thread**: [`ThreadMetadata`](../../../../interfaces/ThreadMetadata.md)

Defined in: src/agents/types.ts:123

The current ChatKit thread being processed

***

### store

> **store**: [`Store`](../../../../classes/Store.md)\<`TContext`\>

Defined in: src/agents/types.ts:126

The store instance for persisting thread data

***

### requestContext

> **requestContext**: `TContext`

Defined in: src/agents/types.ts:129

User-defined request context (e.g., user ID, session data, etc.)

***

### clientToolCall?

> `optional` **clientToolCall**: `ClientToolCall`

Defined in: src/agents/types.ts:150

Client tool call to be executed on the client-side.
When set by a tool, this will be emitted as a ClientToolCallItem at the end of the stream.

#### Example

```typescript
// In a tool's execute function:
context.clientToolCall = {
  name: 'add_to_todo_list',
  arguments: { task: 'Buy groceries' }
};
```

## Methods

### stream()

> **stream**(`event`): `Promise`\<`void`\>

Defined in: src/agents/types.ts:166

Emit a custom ThreadStreamEvent.
This is typically used by tools to send custom events alongside Agent SDK responses.

#### Parameters

##### event

[`ThreadStreamEvent`](../../../../type-aliases/ThreadStreamEvent.md)

The ThreadStreamEvent to emit

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await context.stream({
  type: 'thread.item.added',
  item: myCustomItem
});
```

***

### streamWidget()

> **streamWidget**(`widget`, `copyText?`): `Promise`\<`void`\>

Defined in: src/agents/types.ts:191

Stream a widget to the chat interface.
Can accept either a static widget or an async generator for streaming updates.

#### Parameters

##### widget

Static widget or async generator yielding widget states

[`WidgetRoot`](../../../../type-aliases/WidgetRoot.md) | `AsyncGenerator`\<[`WidgetRoot`](../../../../type-aliases/WidgetRoot.md), `void`, `undefined`\>

##### copyText?

Optional text for copy-to-clipboard functionality

`null` | `string`

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Static widget
await context.streamWidget({
  type: 'Card',
  children: [{ type: 'Text', value: 'Hello!' }]
});

// Streaming widget
async function* widgetGenerator() {
  yield { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Loading...' }] };
  yield { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Complete!' }] };
}
await context.streamWidget(widgetGenerator());
```
