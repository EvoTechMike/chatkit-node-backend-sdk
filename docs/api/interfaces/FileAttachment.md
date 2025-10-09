[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / FileAttachment

# Interface: FileAttachment

Defined in: src/types/attachments.ts:23

Attachment representing a generic file.

## Extends

- `AttachmentBase`

## Properties

### id

> **id**: `string`

Defined in: src/types/attachments.ts:9

#### Inherited from

`AttachmentBase.id`

***

### name

> **name**: `string`

Defined in: src/types/attachments.ts:10

#### Inherited from

`AttachmentBase.name`

***

### mime\_type

> **mime\_type**: `string`

Defined in: src/types/attachments.ts:11

#### Inherited from

`AttachmentBase.mime_type`

***

### upload\_url?

> `optional` **upload\_url**: `null` \| `string`

Defined in: src/types/attachments.ts:17

The URL to upload the file, used for two-phase upload.
Should be set to null after upload is complete or when using direct upload
where uploading happens when creating the attachment object.

#### Inherited from

`AttachmentBase.upload_url`

***

### type

> **type**: `"file"`

Defined in: src/types/attachments.ts:24
