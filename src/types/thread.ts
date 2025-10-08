/**
 * Thread types - conversations and their metadata
 */

import type { Page } from './base.js';
import type { ThreadItem } from './items.js';

/**
 * Status indicating the thread is active.
 */
export interface ActiveStatus {
  type: 'active';
}

/**
 * Status indicating the thread is locked.
 */
export interface LockedStatus {
  type: 'locked';
  reason?: string | null;
}

/**
 * Status indicating the thread is closed.
 */
export interface ClosedStatus {
  type: 'closed';
  reason?: string | null;
}

/**
 * Union of lifecycle states for a thread.
 */
export type ThreadStatus = ActiveStatus | LockedStatus | ClosedStatus;

/**
 * Metadata describing a thread without its items.
 */
export interface ThreadMetadata {
  id: string;
  title?: string | null;
  created_at: string; // ISO 8601 datetime string
  status: ThreadStatus;
  metadata: Record<string, unknown>;
}

/**
 * Thread with its paginated items.
 */
export interface Thread extends ThreadMetadata {
  items: Page<ThreadItem>;
}

/**
 * Type guard to check if status is active.
 */
export function isActiveStatus(status: ThreadStatus): status is ActiveStatus {
  return status.type === 'active';
}

/**
 * Type guard to check if status is locked.
 */
export function isLockedStatus(status: ThreadStatus): status is LockedStatus {
  return status.type === 'locked';
}

/**
 * Type guard to check if status is closed.
 */
export function isClosedStatus(status: ThreadStatus): status is ClosedStatus {
  return status.type === 'closed';
}
