[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / Store

# Abstract Class: Store\<TContext\>

Defined in: src/store/Store.ts:39

Abstract Store class

Implement all abstract methods to provide persistence for your ChatKit server.

## Example

```typescript
class MyStore extends Store<{ userId: string }> {
  async loadThread(threadId, context) {
    // Load from database
  }
  // ... implement other methods
}
```

## Type Parameters

### TContext

`TContext` = `unknown`

## Constructors

### Constructor

> **new Store**\<`TContext`\>(): `Store`\<`TContext`\>

#### Returns

`Store`\<`TContext`\>

## Methods

### generateThreadId()

> **generateThreadId**(`_context`): `string`

Defined in: src/store/Store.ts:45

Generate a thread ID

Override to customize ID format. Default: 'thr_' + 8 random hex chars

#### Parameters

##### \_context

`TContext`

#### Returns

`string`

***

### generateItemId()

> **generateItemId**(`type`, `_thread`, `_context`): `string`

Defined in: src/store/Store.ts:54

Generate an item ID

Override to customize ID format. Default: type-specific prefix + 8 random hex chars

#### Parameters

##### type

[`StoreItemType`](../type-aliases/StoreItemType.md)

##### \_thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

##### \_context

`TContext`

#### Returns

`string`

***

### loadThread()

> `abstract` **loadThread**(`threadId`, `context`): `Promise`\<[`ThreadMetadata`](../interfaces/ThreadMetadata.md)\>

Defined in: src/store/Store.ts:67

Load a thread by ID

#### Parameters

##### threadId

`string`

##### context

`TContext`

#### Returns

`Promise`\<[`ThreadMetadata`](../interfaces/ThreadMetadata.md)\>

#### Throws

NotFoundError if thread doesn't exist

***

### saveThread()

> `abstract` **saveThread**(`thread`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:72

Save a thread (insert or update)

#### Parameters

##### thread

[`ThreadMetadata`](../interfaces/ThreadMetadata.md)

##### context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### deleteThread()

> `abstract` **deleteThread**(`threadId`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:77

Delete a thread and all its items

#### Parameters

##### threadId

`string`

##### context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### loadThreads()

> `abstract` **loadThreads**(`limit`, `after`, `order`, `context`): `Promise`\<[`Page`](../interfaces/Page.md)\<[`ThreadMetadata`](../interfaces/ThreadMetadata.md)\>\>

Defined in: src/store/Store.ts:87

Load a paginated list of threads

#### Parameters

##### limit

`number`

Max number of threads to return

##### after

Cursor for pagination (null for first page)

`null` | `string`

##### order

Sort order: 'asc' or 'desc' by created_at

`"asc"` | `"desc"`

##### context

`TContext`

Request context

#### Returns

`Promise`\<[`Page`](../interfaces/Page.md)\<[`ThreadMetadata`](../interfaces/ThreadMetadata.md)\>\>

***

### loadThreadItems()

> `abstract` **loadThreadItems**(`threadId`, `after`, `limit`, `order`, `context`): `Promise`\<[`Page`](../interfaces/Page.md)\<[`ThreadItem`](../type-aliases/ThreadItem.md)\>\>

Defined in: src/store/Store.ts:107

Load items for a thread

#### Parameters

##### threadId

`string`

Thread ID

##### after

Cursor for pagination (null for first page)

`null` | `string`

##### limit

`number`

Max number of items to return

##### order

Sort order: 'asc' or 'desc' by created_at

`"asc"` | `"desc"`

##### context

`TContext`

Request context

#### Returns

`Promise`\<[`Page`](../interfaces/Page.md)\<[`ThreadItem`](../type-aliases/ThreadItem.md)\>\>

***

### addThreadItem()

> `abstract` **addThreadItem**(`threadId`, `item`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:118

Add a new item to a thread

#### Parameters

##### threadId

`string`

##### item

[`ThreadItem`](../type-aliases/ThreadItem.md)

##### context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### saveItem()

> `abstract` **saveItem**(`threadId`, `item`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:127

Update an existing item

#### Parameters

##### threadId

`string`

##### item

[`ThreadItem`](../type-aliases/ThreadItem.md)

##### context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### loadItem()

> `abstract` **loadItem**(`threadId`, `itemId`, `context`): `Promise`\<[`ThreadItem`](../type-aliases/ThreadItem.md)\>

Defined in: src/store/Store.ts:134

Load a specific item

#### Parameters

##### threadId

`string`

##### itemId

`string`

##### context

`TContext`

#### Returns

`Promise`\<[`ThreadItem`](../type-aliases/ThreadItem.md)\>

#### Throws

NotFoundError if item doesn't exist

***

### deleteThreadItem()

> `abstract` **deleteThreadItem**(`threadId`, `itemId`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:143

Delete an item from a thread

#### Parameters

##### threadId

`string`

##### itemId

`string`

##### context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### saveAttachment()

> `abstract` **saveAttachment**(`attachment`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:156

Save attachment metadata

#### Parameters

##### attachment

[`Attachment`](../type-aliases/Attachment.md)

##### context

`TContext`

#### Returns

`Promise`\<`void`\>

***

### loadAttachment()

> `abstract` **loadAttachment**(`attachmentId`, `context`): `Promise`\<[`Attachment`](../type-aliases/Attachment.md)\>

Defined in: src/store/Store.ts:163

Load attachment metadata

#### Parameters

##### attachmentId

`string`

##### context

`TContext`

#### Returns

`Promise`\<[`Attachment`](../type-aliases/Attachment.md)\>

#### Throws

NotFoundError if attachment doesn't exist

***

### deleteAttachment()

> `abstract` **deleteAttachment**(`attachmentId`, `context`): `Promise`\<`void`\>

Defined in: src/store/Store.ts:168

Delete attachment metadata

#### Parameters

##### attachmentId

`string`

##### context

`TContext`

#### Returns

`Promise`\<`void`\>
