[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThreadsGetByIdReq

# Interface: ThreadsGetByIdReq

Defined in: src/types/requests.ts:125

Request to fetch a single thread by its identifier.

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

> **type**: `"threads.get_by_id"`

Defined in: src/types/requests.ts:126

***

### params

> **params**: [`ThreadGetByIdParams`](ThreadGetByIdParams.md)

Defined in: src/types/requests.ts:127
