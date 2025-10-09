[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThreadsUpdateReq

# Interface: ThreadsUpdateReq

Defined in: src/types/requests.ts:160

Request to update thread metadata.

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

> **type**: `"threads.update"`

Defined in: src/types/requests.ts:161

***

### params

> **params**: [`ThreadUpdateParams`](ThreadUpdateParams.md)

Defined in: src/types/requests.ts:162
