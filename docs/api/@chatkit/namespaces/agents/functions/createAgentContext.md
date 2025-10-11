[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / createAgentContext

# Function: createAgentContext()

> **createAgentContext**\<`TContext`\>(`thread`, `store`, `requestContext`): [`AgentContext`](../interfaces/AgentContext.md)\<`TContext`\>

Defined in: src/agents/context-helpers.ts:39

Create an AgentContext with all required methods implemented.

This factory function creates a complete AgentContext instance with the
stream() and streamWidget() methods properly implemented.

## Type Parameters

### TContext

`TContext` = `unknown`

The user-defined context type

## Parameters

### thread

[`ThreadMetadata`](../../../../interfaces/ThreadMetadata.md)

The current thread metadata

### store

[`Store`](../../../../classes/Store.md)\<`TContext`\>

The store instance

### requestContext

`TContext`

User-defined request context

## Returns

[`AgentContext`](../interfaces/AgentContext.md)\<`TContext`\>

A complete AgentContext instance

## Example

```typescript
const context = createAgentContext(
  currentThread,
  myStore,
  { userId: 'user123' }
);

// Use in tools:
await context.streamWidget(myWidget);
```
