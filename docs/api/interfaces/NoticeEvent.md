[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / NoticeEvent

# Interface: NoticeEvent

Defined in: src/types/events.ts:192

Event conveying a user-facing notice.

## Properties

### type

> **type**: `"notice"`

Defined in: src/types/events.ts:193

***

### level

> **level**: `"info"` \| `"danger"` \| `"warning"`

Defined in: src/types/events.ts:194

***

### message

> **message**: `string`

Defined in: src/types/events.ts:198

Supports markdown e.g. "You've reached your limit of 100 messages. [Upgrade](https://...) to a paid plan."

***

### title?

> `optional` **title**: `null` \| `string`

Defined in: src/types/events.ts:199
