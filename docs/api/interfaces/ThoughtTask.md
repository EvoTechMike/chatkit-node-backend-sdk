[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / ThoughtTask

# Interface: ThoughtTask

Defined in: src/types/workflow.ts:42

Workflow task capturing assistant reasoning.

## Extends

- `BaseTask`

## Properties

### status\_indicator?

> `optional` **status\_indicator**: `"none"` \| `"loading"` \| `"complete"`

Defined in: src/types/workflow.ts:15

Only used when rendering the task as part of a workflow.
Indicates the status of the task.

#### Inherited from

`BaseTask.status_indicator`

***

### type

> **type**: `"thought"`

Defined in: src/types/workflow.ts:43

***

### title?

> `optional` **title**: `null` \| `string`

Defined in: src/types/workflow.ts:44

***

### content

> **content**: `string`

Defined in: src/types/workflow.ts:45
