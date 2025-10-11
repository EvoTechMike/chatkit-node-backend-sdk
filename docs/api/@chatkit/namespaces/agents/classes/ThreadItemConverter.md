[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / ThreadItemConverter

# Abstract Class: ThreadItemConverter\<TContext\>

Defined in: src/agents/item-converter.ts:31

Base class for converting Agent SDK RunItems to ChatKit ThreadItems.

This abstract class allows you to customize how Agent outputs are converted
to ChatKit items. Extend this class to implement custom conversion logic
for your specific use case.

## Example

```typescript
class CustomItemConverter<TContext> extends ThreadItemConverter<TContext> {
  async convert(
    agentOutput: RunItem,
    thread: ThreadMetadata,
    store: Store<TContext>,
    context: TContext
  ): Promise<ThreadItem> {
    // Custom conversion logic here
    // For example, handle tool calls, add metadata, etc.
    return customThreadItem;
  }
}
```

## Extended by

- [`DefaultThreadItemConverter`](DefaultThreadItemConverter.md)

## Type Parameters

### TContext

`TContext` = `unknown`

The user-defined context type

## Constructors

### Constructor

> **new ThreadItemConverter**\<`TContext`\>(): `ThreadItemConverter`\<`TContext`\>

#### Returns

`ThreadItemConverter`\<`TContext`\>

## Methods

### convert()

> `abstract` **convert**(`agentOutput`, `thread`, `store`, `context`): `Promise`\<[`ThreadItem`](../../../../type-aliases/ThreadItem.md)\>

Defined in: src/agents/item-converter.ts:41

Converts an Agent SDK RunItem to a ChatKit ThreadItem.

#### Parameters

##### agentOutput

`RunItem`

The Agent SDK RunItem to convert

##### thread

[`ThreadMetadata`](../../../../interfaces/ThreadMetadata.md)

The current thread metadata

##### store

[`Store`](../../../../classes/Store.md)\<`TContext`\>

The store instance for generating IDs or fetching additional data

##### context

`TContext`

The user-defined request context

#### Returns

`Promise`\<[`ThreadItem`](../../../../type-aliases/ThreadItem.md)\>

The converted ChatKit ThreadItem
