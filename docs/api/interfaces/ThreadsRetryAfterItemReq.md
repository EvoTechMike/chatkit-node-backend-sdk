[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThreadsRetryAfterItemReq

# Interface: ThreadsRetryAfterItemReq

Defined in: src/types/requests.ts:81

Request to retry processing after a specific thread item.

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

> **type**: `"threads.retry_after_item"`

Defined in: src/types/requests.ts:82

***

### params

> **params**: [`ThreadRetryAfterItemParams`](ThreadRetryAfterItemParams.md)

Defined in: src/types/requests.ts:83
