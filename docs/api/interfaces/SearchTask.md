[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / SearchTask

# Interface: SearchTask

Defined in: src/types/workflow.ts:31

Workflow task representing a web search.

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

> **type**: `"web_search"`

Defined in: src/types/workflow.ts:32

***

### title?

> `optional` **title**: `null` \| `string`

Defined in: src/types/workflow.ts:33

***

### title\_query?

> `optional` **title\_query**: `null` \| `string`

Defined in: src/types/workflow.ts:34

***

### queries

> **queries**: `string`[]

Defined in: src/types/workflow.ts:35

***

### sources

> **sources**: [`URLSource`](URLSource.md)[]

Defined in: src/types/workflow.ts:36
