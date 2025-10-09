[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / UserMessageItem

# Interface: UserMessageItem

Defined in: src/types/items.ts:57

Thread item representing a user message.

## Extends

- `ThreadItemBase`

## Properties

### id

> **id**: `string`

Defined in: src/types/items.ts:15

#### Inherited from

`ThreadItemBase.id`

***

### thread\_id

> **thread\_id**: `string`

Defined in: src/types/items.ts:16

#### Inherited from

`ThreadItemBase.thread_id`

***

### created\_at

> **created\_at**: `string`

Defined in: src/types/items.ts:17

#### Inherited from

`ThreadItemBase.created_at`

***

### type

> **type**: `"user_message"`

Defined in: src/types/items.ts:58

***

### content

> **content**: [`UserMessageContent`](../type-aliases/UserMessageContent.md)[]

Defined in: src/types/items.ts:59

***

### attachments

> **attachments**: [`Attachment`](../type-aliases/Attachment.md)[]

Defined in: src/types/items.ts:60

***

### quoted\_text?

> `optional` **quoted\_text**: `null` \| `string`

Defined in: src/types/items.ts:61

***

### inference\_options

> **inference\_options**: [`InferenceOptions`](InferenceOptions.md)

Defined in: src/types/items.ts:62
