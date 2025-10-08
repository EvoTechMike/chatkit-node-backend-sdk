/**
 * Store types - data persistence interfaces
 */

/**
 * Type of store item for ID generation.
 */
export type StoreItemType = 'message' | 'tool_call' | 'task' | 'workflow' | 'attachment';

/**
 * Error thrown when a requested resource is not found in the store.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
