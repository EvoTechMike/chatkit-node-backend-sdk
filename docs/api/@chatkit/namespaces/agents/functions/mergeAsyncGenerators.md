[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / mergeAsyncGenerators

# Function: mergeAsyncGenerators()

> **mergeAsyncGenerators**\<`T1`, `T2`\>(`a`, `b`, `onFirstComplete?`): `AsyncGenerator`\<`T1` \| [`EventWrapper`](../classes/EventWrapper.md)\<`T2`\>\>

Defined in: src/agents/merge-streams.ts:47

Merges two async iterators, yielding events as they arrive from either source.

Events from the first iterator (typically Agent SDK) are yielded directly.
Events from the second iterator (typically custom events) are wrapped in EventWrapper.

This implements a similar pattern to Python's `_merge_generators` using Promise.race
to handle whichever iterator produces a value first.

## Type Parameters

### T1

`T1`

Type of events from first iterator (Agent SDK events)

### T2

`T2`

Type of events from second iterator (custom events)

## Parameters

### a

`AsyncIterator`\<`T1`\>

First async iterator (e.g., Agent SDK stream)

### b

`AsyncIterator`\<`T2`\>

Second async iterator (e.g., custom event queue)

### onFirstComplete?

() => `void`

## Returns

`AsyncGenerator`\<`T1` \| [`EventWrapper`](../classes/EventWrapper.md)\<`T2`\>\>

Merged async generator yielding T1 | EventWrapper<T2>

## Example

```typescript
const agentStream = agentRunner.streamEvents();
const customEventQueue = createEventQueue();

for await (const event of mergeAsyncGenerators(agentStream, customEventQueue)) {
  if (event instanceof EventWrapper) {
    // This is a custom event
    yield event.event;
  } else {
    // This is an Agent SDK event
    processAgentEvent(event);
  }
}
```
