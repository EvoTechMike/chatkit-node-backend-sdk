[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / diffWidget

# Function: diffWidget()

> **diffWidget**(`before`, `after`): ([`WidgetStreamingTextValueDelta`](../../../../interfaces/WidgetStreamingTextValueDelta.md) \| [`WidgetComponentUpdated`](../../../../interfaces/WidgetComponentUpdated.md) \| [`WidgetRootUpdated`](../../../../interfaces/WidgetRootUpdated.md))[]

Defined in: src/agents/widget-helpers.ts:41

Compare two WidgetRoot structures and return a list of deltas.

This function determines what has changed between two widget states and returns
the minimal set of updates needed to transform the `before` state into the `after` state.

For Text and Markdown components with an `id`, it detects text value changes and
emits streaming text deltas if the new value is a prefix extension of the old value.

## Parameters

### before

[`WidgetRoot`](../../../../type-aliases/WidgetRoot.md)

The previous widget state

### after

[`WidgetRoot`](../../../../type-aliases/WidgetRoot.md)

The new widget state

## Returns

([`WidgetStreamingTextValueDelta`](../../../../interfaces/WidgetStreamingTextValueDelta.md) \| [`WidgetComponentUpdated`](../../../../interfaces/WidgetComponentUpdated.md) \| [`WidgetRootUpdated`](../../../../interfaces/WidgetRootUpdated.md))[]

Array of update events (text deltas, component updates, or full replacement)

## Example

```typescript
const before: Card = { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Hello' }] };
const after: Card = { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Hello World' }] };
const deltas = diffWidget(before, after);
// Returns: [{ type: 'widget.streaming_text.value_delta', component_id: 'msg', delta: ' World', done: false }]
```
