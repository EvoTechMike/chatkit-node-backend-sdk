[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThreadsCreateReq

# Interface: ThreadsCreateReq

Defined in: src/types/requests.ts:33

Request to create a new thread from a user message.

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

> **type**: `"threads.create"`

Defined in: src/types/requests.ts:34

***

### params

> **params**: [`ThreadCreateParams`](ThreadCreateParams.md)

Defined in: src/types/requests.ts:35
