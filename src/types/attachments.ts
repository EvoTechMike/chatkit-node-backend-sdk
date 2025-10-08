/**
 * Attachment types - files and images attached to messages
 */

/**
 * Base metadata shared by all attachments.
 */
export interface AttachmentBase {
  id: string;
  name: string;
  mime_type: string;
  /**
   * The URL to upload the file, used for two-phase upload.
   * Should be set to null after upload is complete or when using direct upload
   * where uploading happens when creating the attachment object.
   */
  upload_url?: string | null;
}

/**
 * Attachment representing a generic file.
 */
export interface FileAttachment extends AttachmentBase {
  type: 'file';
}

/**
 * Attachment representing an image resource.
 */
export interface ImageAttachment extends AttachmentBase {
  type: 'image';
  preview_url: string;
}

/**
 * Union of supported attachment types.
 */
export type Attachment = FileAttachment | ImageAttachment;

/**
 * Metadata needed to initialize an attachment.
 */
export interface AttachmentCreateParams {
  name: string;
  size: number;
  mime_type: string;
}

/**
 * Type guard for FileAttachment.
 */
export function isFileAttachment(attachment: Attachment): attachment is FileAttachment {
  return attachment.type === 'file';
}

/**
 * Type guard for ImageAttachment.
 */
export function isImageAttachment(attachment: Attachment): attachment is ImageAttachment {
  return attachment.type === 'image';
}
