[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / AsyncEventQueue

# Class: AsyncEventQueue\<T\>

Defined in: src/agents/types.ts:21

Async queue for managing custom events in AgentContext.
Implements AsyncIterable so it can be consumed as an async generator.

## Type Parameters

### T

`T`

## Implements

- `AsyncIterable`\<`T`\>

## Constructors

### Constructor

> **new AsyncEventQueue**\<`T`\>(): `AsyncEventQueue`\<`T`\>

#### Returns

`AsyncEventQueue`\<`T`\>

## Properties

### COMPLETE

> `static` **COMPLETE**: `symbol`

Defined in: src/agents/types.ts:26

## Methods

### push()

> **push**(`event`): `void`

Defined in: src/agents/types.ts:31

Add an event to the queue

#### Parameters

##### event

`T`

#### Returns

`void`

***

### complete()

> **complete**(): `void`

Defined in: src/agents/types.ts:49

Mark the queue as complete

#### Returns

`void`

***

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<`T`\>

Defined in: src/agents/types.ts:79

Implement AsyncIterable

#### Returns

`AsyncGenerator`\<`T`\>

#### Implementation of

`AsyncIterable.[asyncIterator]`
