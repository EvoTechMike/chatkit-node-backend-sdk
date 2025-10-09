[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / Thread

# Interface: Thread

Defined in: src/types/thread.ts:50

Thread with its paginated items.

## Extends

- [`ThreadMetadata`](ThreadMetadata.md)

## Properties

### id

> **id**: `string`

Defined in: src/types/thread.ts:40

#### Inherited from

[`ThreadMetadata`](ThreadMetadata.md).[`id`](ThreadMetadata.md#id)

***

### title?

> `optional` **title**: `null` \| `string`

Defined in: src/types/thread.ts:41

#### Inherited from

[`ThreadMetadata`](ThreadMetadata.md).[`title`](ThreadMetadata.md#title)

***

### created\_at

> **created\_at**: `string`

Defined in: src/types/thread.ts:42

#### Inherited from

[`ThreadMetadata`](ThreadMetadata.md).[`created_at`](ThreadMetadata.md#created_at)

***

### status

> **status**: [`ThreadStatus`](../type-aliases/ThreadStatus.md)

Defined in: src/types/thread.ts:43

#### Inherited from

[`ThreadMetadata`](ThreadMetadata.md).[`status`](ThreadMetadata.md#status)

***

### metadata

> **metadata**: `Record`\<`string`, `unknown`\>

Defined in: src/types/thread.ts:44

#### Inherited from

[`ThreadMetadata`](ThreadMetadata.md).[`metadata`](ThreadMetadata.md#metadata)

***

### items

> **items**: [`Page`](Page.md)\<[`ThreadItem`](../type-aliases/ThreadItem.md)\>

Defined in: src/types/thread.ts:51
