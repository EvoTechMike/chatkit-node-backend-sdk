/**
 * ID generation utilities for threads, items, and attachments
 */

import type { StoreItemType } from '../types/store.js';

/**
 * Generate a random ID with the given prefix.
 * Format: {prefix}_{8 random hex characters}
 * Example: "thr_a1b2c3d4" or "msg_1a2b3c4d"
 */
export function generateId(prefix: string): string {
  const randomHex = Math.random().toString(16).substring(2, 10).padStart(8, '0');
  return `${prefix}_${randomHex}`;
}

/**
 * Generate a thread ID.
 * Default implementation: Returns generateId('thr')
 */
export function defaultGenerateThreadId(): string {
  return generateId('thr');
}

/**
 * Generate an item ID based on the item type.
 * Maps type to prefix:
 * - 'message' → 'msg'
 * - 'tool_call' → 'tc'
 * - 'task' → 'task'
 * - 'workflow' → 'wf'
 * - 'attachment' → 'atc'
 */
export function defaultGenerateItemId(type: StoreItemType): string {
  const prefixMap: Record<StoreItemType, string> = {
    message: 'msg',
    tool_call: 'tc',
    task: 'task',
    workflow: 'wf',
    attachment: 'atc',
  };

  const prefix = prefixMap[type];
  return generateId(prefix);
}

/**
 * Generate an attachment ID.
 * Default implementation: Returns generateId('atc')
 */
export function defaultGenerateAttachmentId(): string {
  return generateId('atc');
}
