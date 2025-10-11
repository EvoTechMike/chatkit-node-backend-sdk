[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / accumulateText

# Function: accumulateText()

> **accumulateText**\<`TWidget`\>(`events`, `baseWidget`): `AsyncGenerator`\<`TWidget`\>

Defined in: src/agents/widget-helpers.ts:218

Accumulate text from Agent SDK stream events into a Text or Markdown widget.

This helper function listens to Agent SDK `output_text_delta` events and progressively
updates the widget's value property, yielding new widget states as text accumulates.

## Type Parameters

### TWidget

`TWidget` *extends* `Text` \| `Markdown`

Type of widget (Text or Markdown)

## Parameters

### events

`AsyncIterable`\<`RunStreamEvent`\>

Async iterable of Agent SDK RunStreamEvents

### baseWidget

`TWidget`

Initial widget to accumulate text into (must have id and streaming: true)

## Returns

`AsyncGenerator`\<`TWidget`\>

Async generator yielding updated widget states

## Example

```typescript
const agentRun = Runner.runStreamed(agent, input);

for await (const textWidget of accumulateText(
  agentRun.streamEvents(),
  { type: 'Text', id: 'output', value: '', streaming: true }
)) {
  const card: Card = { type: 'Card', children: [textWidget] };
  yield card; // Emit updated widget with accumulated text
}
```
