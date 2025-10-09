[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / StreamingResult

# Class: StreamingResult

Defined in: src/server/results.ts:11

Streaming result that formats events as Server-Sent Events (SSE).
Format: `data: {json}\n\n` for each event.

## Constructors

### Constructor

> **new StreamingResult**(`generator`): `StreamingResult`

Defined in: src/server/results.ts:15

#### Parameters

##### generator

`AsyncGenerator`\<[`ThreadStreamEvent`](../type-aliases/ThreadStreamEvent.md)\>

#### Returns

`StreamingResult`

## Properties

### isStreaming

> `readonly` **isStreaming**: `true` = `true`

Defined in: src/server/results.ts:12

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<`string`\>

Defined in: src/server/results.ts:22

Async iterator that yields SSE-formatted strings.

#### Returns

`AsyncGenerator`\<`string`\>
