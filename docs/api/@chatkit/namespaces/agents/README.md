[**@chatkit/node**](../../../README.md)

***

[@chatkit/node](../../../README.md) / agents

# agents

Agents SDK integration helpers for using @openai/agents with ChatKit.

## Example

```typescript
import { Agent, Runner } from '@openai/agents';
import { agents } from 'chatkit-node';

const agentContext: agents.AgentContext<MyContext> = {
  thread: currentThread,
  store: myStore,
  requestContext: { userId: 'user123' }
};

const input = await agents.simpleToAgentInput(userMessage);
const runnerStream = Runner.runStreamed(myAgent, input);

for await (const event of agents.streamAgentResponse(agentContext, runnerStream)) {
  yield event;
}
```

## Classes

- [ThreadItemConverter](classes/ThreadItemConverter.md)
- [DefaultThreadItemConverter](classes/DefaultThreadItemConverter.md)
- [EventWrapper](classes/EventWrapper.md)
- [AsyncEventQueue](classes/AsyncEventQueue.md)

## Interfaces

- [AgentContext](interfaces/AgentContext.md)

## Functions

- [createAgentContext](functions/createAgentContext.md)
- [simpleToAgentInput](functions/simpleToAgentInput.md)
- [mergeAsyncGenerators](functions/mergeAsyncGenerators.md)
- [streamAgentResponse](functions/streamAgentResponse.md)
- [diffWidget](functions/diffWidget.md)
- [accumulateText](functions/accumulateText.md)
