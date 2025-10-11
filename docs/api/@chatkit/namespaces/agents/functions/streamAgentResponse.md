[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / streamAgentResponse

# Function: streamAgentResponse()

> **streamAgentResponse**\<`TContext`\>(`context`, `agentRunner`, `options`): `AsyncGenerator`\<[`ThreadStreamEvent`](../../../../type-aliases/ThreadStreamEvent.md)\>

Defined in: src/agents/stream-converter.ts:82

Converts an Agent SDK Runner stream to ChatKit ThreadStreamEvents.

This function bridges the Agent SDK and ChatKit by:
1. Listening to Agent Runner stream events
2. Converting message outputs to ChatKit AssistantMessageItems
3. Saving items to the store
4. Emitting ChatKit-compatible events for the frontend

## Type Parameters

### TContext

`TContext` = `unknown`

The user-defined context type

## Parameters

### context

[`AgentContext`](../interfaces/AgentContext.md)\<`TContext`\>

The AgentContext containing thread, store, and request context

### agentRunner

`AsyncIterable`\<`RunStreamEvent`\>

The Agent SDK Runner stream (from Runner.runStreamed())

### options

Optional configuration

#### showThinking?

`boolean`

Whether to emit reasoning/workflow events (default: true)

## Returns

`AsyncGenerator`\<[`ThreadStreamEvent`](../../../../type-aliases/ThreadStreamEvent.md)\>

AsyncGenerator of ChatKit ThreadStreamEvents

## Example

```typescript
const agentContext: AgentContext<MyContext> = {
  thread: currentThread,
  store: myStore,
  requestContext: { userId: 'user123' }
};

const runnerStream = Runner.runStreamed(myAgent, input, { context: agentContext });

// Show thinking (default)
for await (const event of streamAgentResponse(agentContext, runnerStream)) {
  yield event;
}

// Hide thinking
for await (const event of streamAgentResponse(agentContext, runnerStream, { showThinking: false })) {
  yield event;
}
```
