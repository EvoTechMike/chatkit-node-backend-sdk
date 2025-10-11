[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / DefaultThreadItemConverter

# Class: DefaultThreadItemConverter\<TContext\>

Defined in: src/agents/item-converter.ts:58

Default implementation of ThreadItemConverter that handles basic text message conversion.

This converter extracts text output from Agent message items and creates
ChatKit AssistantMessageItems. For more advanced conversions (tool calls,
handoffs, etc.), extend the ThreadItemConverter class.

## Extends

- [`ThreadItemConverter`](ThreadItemConverter.md)\<`TContext`\>

## Type Parameters

### TContext

`TContext` = `unknown`

The user-defined context type

## Constructors

### Constructor

> **new DefaultThreadItemConverter**\<`TContext`\>(): `DefaultThreadItemConverter`\<`TContext`\>

#### Returns

`DefaultThreadItemConverter`\<`TContext`\>

#### Inherited from

[`ThreadItemConverter`](ThreadItemConverter.md).[`constructor`](ThreadItemConverter.md#constructor)

## Methods

### convert()

> **convert**(`agentOutput`, `thread`, `store`, `context`): `Promise`\<[`ThreadItem`](../../../../type-aliases/ThreadItem.md)\>

Defined in: src/agents/item-converter.ts:61

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

#### Overrides

[`ThreadItemConverter`](ThreadItemConverter.md).[`convert`](ThreadItemConverter.md#convert)
