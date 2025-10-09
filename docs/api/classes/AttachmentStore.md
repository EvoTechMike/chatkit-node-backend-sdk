[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / AttachmentStore

# Abstract Class: AttachmentStore\<TContext\>

Defined in: src/store/AttachmentStore.ts:30

Abstract AttachmentStore class

Implement to provide file storage for attachments.

## Example

```typescript
class S3AttachmentStore extends AttachmentStore<{ userId: string }> {
  async createAttachment(params, context) {
    // Generate presigned S3 URL
    // Return attachment with upload_url
  }

  async deleteAttachment(attachmentId, context) {
    // Delete from S3
  }
}
```

## Type Parameters

### TContext

`TContext` = `unknown`

## Constructors

### Constructor

> **new AttachmentStore**\<`TContext`\>(): `AttachmentStore`\<`TContext`\>

#### Returns

`AttachmentStore`\<`TContext`\>

## Methods

### generateAttachmentId()

> **generateAttachmentId**(`_mimeType`, `_context`): `string`

Defined in: src/store/AttachmentStore.ts:36

Generate an attachment ID

Override to customize ID format. Default: 'atc_' + 8 random hex chars

#### Parameters

##### \_mimeType

`string`

##### \_context

`TContext`

#### Returns

`string`

***

### createAttachment()

> `abstract` **createAttachment**(`params`, `context`): `Promise`\<[`Attachment`](../type-aliases/Attachment.md)\>

Defined in: src/store/AttachmentStore.ts:52

Create an attachment and return upload URL

For two-phase upload pattern:
1. Client calls attachments.create to get upload_url
2. Client uploads file to upload_url
3. File is now available at the attachment's permanent URL

#### Parameters

##### params

[`AttachmentCreateParams`](../interfaces/AttachmentCreateParams.md)

Attachment metadata (name, size, mime_type)

##### context

`TContext`

Request context

#### Returns

`Promise`\<[`Attachment`](../type-aliases/Attachment.md)\>

Attachment with upload_url for client to upload to

***

### deleteAttachment()

> `abstract` **deleteAttachment**(`attachmentId`, `context`): `Promise`\<`void`\>

Defined in: src/store/AttachmentStore.ts:65

Delete an attachment file

Called when attachment is deleted. Should remove the file from storage.

#### Parameters

##### attachmentId

`string`

Attachment ID

##### context

`TContext`

Request context

#### Returns

`Promise`\<`void`\>
