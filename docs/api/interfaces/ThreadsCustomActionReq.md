[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThreadsCustomActionReq

# Interface: ThreadsCustomActionReq

Defined in: src/types/requests.ts:98

Request to execute a custom action within a thread.

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

> **type**: `"threads.custom_action"`

Defined in: src/types/requests.ts:99

***

### params

> **params**: [`ThreadCustomActionParams`](ThreadCustomActionParams.md)

Defined in: src/types/requests.ts:100
