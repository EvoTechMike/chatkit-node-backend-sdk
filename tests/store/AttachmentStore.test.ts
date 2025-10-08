/**
 * Tests for AttachmentStore using MockAttachmentStore implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockAttachmentStore } from '../helpers/MockStore.js';
import type { AttachmentCreateParams } from '../../src/types/index.js';

describe('AttachmentStore (MockAttachmentStore implementation)', () => {
  let store: MockAttachmentStore<{ userId: string }>;
  let context: { userId: string };

  beforeEach(() => {
    store = new MockAttachmentStore();
    context = { userId: 'test-user' };
  });

  describe('Attachment Creation', () => {
    it('should create a file attachment', async () => {
      const params: AttachmentCreateParams = {
        name: 'document.pdf',
        size: 1024000,
        mime_type: 'application/pdf',
      };

      const attachment = await store.createAttachment(params, context);

      expect(attachment.type).toBe('file');
      expect(attachment.name).toBe('document.pdf');
      expect(attachment.mime_type).toBe('application/pdf');
      expect(attachment.upload_url).toMatch(/^https:\/\/mock-storage/);
      expect(attachment.id).toMatch(/^atc_[0-9a-f]{8}$/);
    });

    it('should create an image attachment with preview_url', async () => {
      const params: AttachmentCreateParams = {
        name: 'photo.jpg',
        size: 2048000,
        mime_type: 'image/jpeg',
      };

      const attachment = await store.createAttachment(params, context);

      expect(attachment.type).toBe('image');
      expect(attachment.name).toBe('photo.jpg');
      expect(attachment.mime_type).toBe('image/jpeg');
      expect(attachment.upload_url).toMatch(/^https:\/\/mock-storage/);

      if (attachment.type === 'image') {
        expect(attachment.preview_url).toMatch(/^https:\/\/mock-storage/);
      }
    });

    it('should generate unique attachment IDs', async () => {
      const params: AttachmentCreateParams = {
        name: 'test.txt',
        size: 100,
        mime_type: 'text/plain',
      };

      const attachment1 = await store.createAttachment(params, context);
      const attachment2 = await store.createAttachment(params, context);

      expect(attachment1.id).not.toBe(attachment2.id);
    });

    it('should include upload_url', async () => {
      const params: AttachmentCreateParams = {
        name: 'test.txt',
        size: 100,
        mime_type: 'text/plain',
      };

      const attachment = await store.createAttachment(params, context);

      expect(attachment.upload_url).toBeTruthy();
      expect(typeof attachment.upload_url).toBe('string');
    });
  });

  describe('Attachment Deletion', () => {
    it('should not throw when deleting attachment', async () => {
      await expect(
        store.deleteAttachment('atc_123', context)
      ).resolves.not.toThrow();
    });
  });

  describe('ID Generation', () => {
    it('should generate attachment ID with correct format', () => {
      const id = store.generateAttachmentId('image/png', context);

      expect(id).toMatch(/^atc_[0-9a-f]{8}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        ids.add(store.generateAttachmentId('image/png', context));
      }

      expect(ids.size).toBe(100);
    });
  });

  describe('Image Type Detection', () => {
    it('should create image attachment for image/* mime types', async () => {
      const imageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];

      for (const mimeType of imageTypes) {
        const params: AttachmentCreateParams = {
          name: `test.${mimeType.split('/')[1]}`,
          size: 1000,
          mime_type: mimeType,
        };

        const attachment = await store.createAttachment(params, context);
        expect(attachment.type).toBe('image');
      }
    });

    it('should create file attachment for non-image mime types', async () => {
      const fileTypes = [
        'application/pdf',
        'text/plain',
        'application/json',
        'video/mp4',
        'audio/mpeg',
      ];

      for (const mimeType of fileTypes) {
        const params: AttachmentCreateParams = {
          name: 'test.file',
          size: 1000,
          mime_type: mimeType,
        };

        const attachment = await store.createAttachment(params, context);
        expect(attachment.type).toBe('file');
      }
    });
  });
});
