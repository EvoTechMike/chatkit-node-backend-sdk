/**
 * AttachmentStore - Abstract interface for file attachment storage
 *
 * Handles the storage and retrieval of file attachments (images, documents, etc.)
 * Separate from Store to allow different storage backends (S3, local, etc.)
 */

import type { Attachment, AttachmentCreateParams } from '../types/index.js';
import { defaultGenerateAttachmentId } from '../utils/id.js';

/**
 * Abstract AttachmentStore class
 *
 * Implement to provide file storage for attachments.
 *
 * @example
 * ```typescript
 * class S3AttachmentStore extends AttachmentStore<{ userId: string }> {
 *   async createAttachment(params, context) {
 *     // Generate presigned S3 URL
 *     // Return attachment with upload_url
 *   }
 *
 *   async deleteAttachment(attachmentId, context) {
 *     // Delete from S3
 *   }
 * }
 * ```
 */
export abstract class AttachmentStore<TContext = unknown> {
  /**
   * Generate an attachment ID
   *
   * Override to customize ID format. Default: 'atc_' + 8 random hex chars
   */
  generateAttachmentId(_mimeType: string, _context: TContext): string {
    return defaultGenerateAttachmentId();
  }

  /**
   * Create an attachment and return upload URL
   *
   * For two-phase upload pattern:
   * 1. Client calls attachments.create to get upload_url
   * 2. Client uploads file to upload_url
   * 3. File is now available at the attachment's permanent URL
   *
   * @param params - Attachment metadata (name, size, mime_type)
   * @param context - Request context
   * @returns Attachment with upload_url for client to upload to
   */
  abstract createAttachment(
    params: AttachmentCreateParams,
    context: TContext
  ): Promise<Attachment>;

  /**
   * Delete an attachment file
   *
   * Called when attachment is deleted. Should remove the file from storage.
   *
   * @param attachmentId - Attachment ID
   * @param context - Request context
   */
  abstract deleteAttachment(attachmentId: string, context: TContext): Promise<void>;
}
