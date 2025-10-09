[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / FileTask

# Interface: FileTask

Defined in: src/types/workflow.ts:51

Workflow task referencing file sources.

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

> **type**: `"file"`

Defined in: src/types/workflow.ts:52

***

### title?

> `optional` **title**: `null` \| `string`

Defined in: src/types/workflow.ts:53

***

### sources

> **sources**: [`FileSource`](FileSource.md)[]

Defined in: src/types/workflow.ts:54
