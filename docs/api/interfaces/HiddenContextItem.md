[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / HiddenContextItem

# Interface: HiddenContextItem

Defined in: src/types/items.ts:139

HiddenContext is never sent to the client. It's not officially part of ChatKit.
It is only used internally to store additional context in a specific place in the thread.

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

> **type**: `"hidden_context_item"`

Defined in: src/types/items.ts:140

***

### content

> **content**: `unknown`

Defined in: src/types/items.ts:141
