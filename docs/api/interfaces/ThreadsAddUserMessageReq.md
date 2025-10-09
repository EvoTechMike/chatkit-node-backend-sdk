[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThreadsAddUserMessageReq

# Interface: ThreadsAddUserMessageReq

Defined in: src/types/requests.ts:49

Request to append a user message to a thread.

## Extends

- `BaseReq`

## Properties

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: src/types/requests.ts:18

Arbitrary integration-specific metadata.

#### Inherited from

`BaseReq.metadata`

***

### type

> **type**: `"threads.add_user_message"`

Defined in: src/types/requests.ts:50

***

### params

> **params**: [`ThreadAddUserMessageParams`](ThreadAddUserMessageParams.md)

Defined in: src/types/requests.ts:51
