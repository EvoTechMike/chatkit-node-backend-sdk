[**@chatkit/node**](../../../../README.md)

***

[@chatkit/node](../../../../README.md) / [agents](../README.md) / simpleToAgentInput

# Function: simpleToAgentInput()

> **simpleToAgentInput**(`userMessage`): `Promise`\<`object`[]\>

Defined in: src/agents/input-converter.ts:32

Converts a ChatKit UserMessageItem to Agent SDK input format.

This is a simple converter that extracts text content from the user message
and formats it for the Agent SDK. For more complex conversions (e.g., handling
attachments, multiple content types), you can create a custom converter.

## Parameters

### userMessage

[`UserMessageItem`](../../../../interfaces/UserMessageItem.md)

The ChatKit user message to convert

## Returns

`Promise`\<`object`[]\>

Agent SDK input format (array of message objects)

## Example

```typescript
const userMessage: UserMessageItem = {
  type: 'user_message',
  id: 'msg_123',
  thread_id: 'thr_abc',
  created_at: '2025-10-09T12:00:00Z',
  content: [{
    type: 'input_text',
    text: 'Hello, how can you help me?'
  }],
  attachments: [],
  inference_options: {}
};

const agentInput = await simpleToAgentInput(userMessage);
// Returns: [{ role: 'user', content: 'Hello, how can you help me?' }]
```
