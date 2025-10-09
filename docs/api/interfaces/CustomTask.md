[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / CustomTask

# Interface: CustomTask

Defined in: src/types/workflow.ts:21

Workflow task displaying custom content.

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

> **type**: `"custom"`

Defined in: src/types/workflow.ts:22

***

### title?

> `optional` **title**: `null` \| `string`

Defined in: src/types/workflow.ts:23

***

### icon?

> `optional` **icon**: `null` \| `string`

Defined in: src/types/workflow.ts:24

***

### content?

> `optional` **content**: `null` \| `string`

Defined in: src/types/workflow.ts:25
