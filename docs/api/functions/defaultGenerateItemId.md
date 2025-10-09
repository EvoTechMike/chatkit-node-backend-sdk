[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / defaultGenerateItemId

# Function: defaultGenerateItemId()

> **defaultGenerateItemId**(`type`): `string`

Defined in: src/utils/id.ts:34

Generate an item ID based on the item type.
Maps type to prefix:
- 'message' → 'msg'
- 'tool_call' → 'tc'
- 'task' → 'task'
- 'workflow' → 'wf'
- 'attachment' → 'atc'

## Parameters

### type

[`StoreItemType`](../type-aliases/StoreItemType.md)

## Returns

`string`
