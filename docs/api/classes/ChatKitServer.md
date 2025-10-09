[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ChatKitServer

# Abstract Class: ChatKitServer\<TContext\>

Defined in: src/server/ChatKitServer.ts:75

Abstract ChatKitServer class

## Example

```typescript
class MyServer extends ChatKitServer<{ userId: string }> {
  async *respond(thread, inputUserMessage, context) {
    // Your implementation here
    yield {
      type: 'thread.item.done',
      item: {
        type: 'assistant_message',
        // ... message details
      }
    };
  }
}
```

## Type Parameters

### TContext

`TContext` = `unknown`

## Constructors

### Constructor

> **new ChatKitServer**\<`TContext`\>(`store`, `attachmentStore?`, `logger?`): `ChatKitServer`\<`TContext`\>

Defined in: src/server/ChatKitServer.ts:80

#### Parameters

##### store

[`Store`](Store.md)\<`TContext`\>

##### attachmentStore?

[`AttachmentStore`](AttachmentStore.md)\<`TContext`\>

##### logger?

[`Logger`](../interfaces/Logger.md)

#### Returns

`ChatKitServer`\<`TContext`\>

## Properties

### store

> `protected` **store**: [`Store`](Store.md)\<`TContext`\>

Defined in: src/server/ChatKitServer.ts:76

***

### attachmentStore?

> `protected` `optional` **attachmentStore**: [`AttachmentStore`](AttachmentStore.md)\<`TContext`\>

Defined in: src/server/ChatKitServer.ts:77

***

### logger

> `protected` **logger**: [`Logger`](../interfaces/Logger.md)

Defined in: src/server/ChatKitServer.ts:78

## Methods

### getAttachmentStore()

> `protected` **getAttachmentStore**(): [`AttachmentStore`](AttachmentStore.md)\<`TContext`\>

Defined in: src/server/ChatKitServer.ts:93

Get the configured attachment store or throw if not configured

#### Returns

[`AttachmentStore`](AttachmentStore.md)\<`TContext`\>

***

### respond()

> `abstract` **respond**(`thread`, `inputUserMessage`, `context`): `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/server/ChatKitServer.ts:113

Abstract method: Stream ThreadStreamEvent instances for a new user message

This is the primary method users must implement to handle incoming messages
and generate responses.

#### Parameters

##### thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

Metadata for the thread being processed

##### inputUserMessage

The incoming message to respond to, or null for retry/tool output

`null` | [`UserMessageItem`](../interfaces/UserMessageItem.md)

##### context

`TContext`

Per-request context provided by the caller

#### Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

AsyncGenerator yielding ThreadStreamEvent instances

***

### addFeedback()

> **addFeedback**(`threadId`, `itemIds`, `feedback`, `_context`): `Promise`\<`void`\>

Defined in: src/server/ChatKitServer.ts:130

Optional: Handle feedback on thread items

Override this method to store or process user feedback (thumbs up/down).
Default implementation does nothing.

#### Parameters

##### threadId

`string`

Thread ID

##### itemIds

`string`[]

List of item IDs receiving feedback

##### feedback

[`FeedbackKind`](../type-aliases/FeedbackKind.md)

'positive' or 'negative'

##### \_context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### action()

> **action**(`_thread`, `_action`, `_sender`, `_context`): `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/server/ChatKitServer.ts:152

Optional: Handle custom actions from widgets

Override this method to react to button clicks and form submissions from widgets.
Default implementation throws NotImplementedError.

#### Parameters

##### \_thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

##### \_action

[`ActionConfig`](../interfaces/ActionConfig.md)

##### \_sender

`null` | [`WidgetItem`](../interfaces/WidgetItem.md)

##### \_context

`TContext`

#### Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

AsyncGenerator yielding ThreadStreamEvent instances

***

### process()

> **process**(`request`, `context`): `Promise`\<[`StreamingResult`](StreamingResult.md) \| [`NonStreamingResult`](NonStreamingResult.md)\>

Defined in: src/server/ChatKitServer.ts:174

Main entry point: Process a ChatKit request

Parses the request JSON, routes to appropriate handler, and returns
either a StreamingResult or NonStreamingResult.

#### Parameters

##### request

JSON request string or buffer

`string` | `Buffer`\<`ArrayBufferLike`\>

##### context

`TContext`

Per-request context

#### Returns

`Promise`\<[`StreamingResult`](StreamingResult.md) \| [`NonStreamingResult`](NonStreamingResult.md)\>

StreamingResult or NonStreamingResult

***

### processNonStreaming()

> `protected` **processNonStreaming**(`request`, `context`): `Promise`\<`unknown`\>

Defined in: src/server/ChatKitServer.ts:196

Process non-streaming requests (returns JSON)

#### Parameters

##### request

[`NonStreamingReq`](../type-aliases/NonStreamingReq.md)

##### context

`TContext`

#### Returns

`Promise`\<`unknown`\>

***

### processStreaming()

> `protected` **processStreaming**(`request`, `context`): `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/server/ChatKitServer.ts:291

Process streaming requests (returns SSE stream)

#### Parameters

##### request

[`StreamingReq`](../type-aliases/StreamingReq.md)

##### context

`TContext`

#### Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

***

### processStreamingImpl()

> `protected` **processStreamingImpl**(`request`, `context`): `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/server/ChatKitServer.ts:306

Implementation of streaming request processing

#### Parameters

##### request

[`StreamingReq`](../type-aliases/StreamingReq.md)

##### context

`TContext`

#### Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

***

### processNewThreadItemRespond()

> `protected` **processNewThreadItemRespond**(`thread`, `item`, `context`): `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/server/ChatKitServer.ts:460

Process a new user message and generate response

#### Parameters

##### thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

##### item

[`UserMessageItem`](../interfaces/UserMessageItem.md)

##### context

`TContext`

#### Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

***

### processEvents()

> `protected` **processEvents**(`thread`, `context`, `streamFn`): `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/server/ChatKitServer.ts:487

Process events from user's respond() method

Handles:
- Saving items to store
- Error handling
- Thread updates
- Filtering hidden context items

#### Parameters

##### thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

##### context

`TContext`

##### streamFn

() => `AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

#### Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

***

### buildUserMessageItem()

> `protected` **buildUserMessageItem**(`input`, `thread`, `context`): `Promise`\<[`UserMessageItem`](../interfaces/UserMessageItem.md)\>

Defined in: src/server/ChatKitServer.ts:572

Build a UserMessageItem from input

#### Parameters

##### input

`any`

##### thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

##### context

`TContext`

#### Returns

`Promise`\<[`UserMessageItem`](../interfaces/UserMessageItem.md)\>

***

### loadFullThread()

> `protected` **loadFullThread**(`threadId`, `context`): `Promise`\<[`Thread`](../interfaces/Thread.md)\>

Defined in: src/server/ChatKitServer.ts:597

Load a full thread with items

#### Parameters

##### threadId

`string`

##### context

`TContext`

#### Returns

`Promise`\<[`Thread`](../interfaces/Thread.md)\>

***

### toThreadResponse()

> `protected` **toThreadResponse**(`thread`): [`Thread`](../interfaces/Thread.md)

Defined in: src/server/ChatKitServer.ts:617

Convert ThreadMetadata or Thread to Thread response
(filters out hidden context items)

#### Parameters

##### thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md) | [`Thread`](../interfaces/Thread.md)

#### Returns

[`Thread`](../interfaces/Thread.md)
