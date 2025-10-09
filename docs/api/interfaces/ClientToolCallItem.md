[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ClientToolCallItem

# Interface: ClientToolCallItem

Defined in: src/types/items.ts:94

Thread item capturing a client tool call.

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

> **type**: `"client_tool_call"`

Defined in: src/types/items.ts:95

***

### status

> **status**: `"pending"` \| `"completed"`

Defined in: src/types/items.ts:96

***

### call\_id

> **call\_id**: `string`

Defined in: src/types/items.ts:97

***

### name

> **name**: `string`

Defined in: src/types/items.ts:98

***

### arguments

> **arguments**: `Record`\<`string`, `unknown`\>

Defined in: src/types/items.ts:99

***

### output?

> `optional` **output**: `unknown`

Defined in: src/types/items.ts:100
