/**
 * Error classes for ChatKit SDK
 */

/**
 * Error codes that can be emitted in error events.
 */
export enum ErrorCode {
  STREAM_ERROR = 'stream.error',
  INTERNAL_ERROR = 'internal.error',
  INVALID_REQUEST = 'invalid.request',
  THREAD_NOT_FOUND = 'thread.not_found',
  ITEM_NOT_FOUND = 'item.not_found',
  ATTACHMENT_NOT_FOUND = 'attachment.not_found',
  THREAD_LOCKED = 'thread.locked',
  THREAD_CLOSED = 'thread.closed',
}

/**
 * Error thrown during stream processing that should be conveyed to the client.
 */
export class StreamError extends Error {
  code: string | ErrorCode;
  allowRetry: boolean;

  constructor(code: string | ErrorCode, allowRetry: boolean = false) {
    super(`Stream error: ${code}`);
    this.name = 'StreamError';
    this.code = code;
    this.allowRetry = allowRetry;
    Object.setPrototypeOf(this, StreamError.prototype);
  }
}

/**
 * Custom error with a user-facing message that should be displayed to the client.
 */
export class CustomStreamError extends Error {
  allowRetry: boolean;

  constructor(message: string, allowRetry: boolean = false) {
    super(message);
    this.name = 'CustomStreamError';
    this.allowRetry = allowRetry;
    Object.setPrototypeOf(this, CustomStreamError.prototype);
  }
}
