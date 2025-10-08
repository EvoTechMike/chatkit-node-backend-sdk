/**
 * Result classes for streaming and non-streaming responses
 */

import type { ThreadStreamEvent } from '../types/events.js';

/**
 * Streaming result that formats events as Server-Sent Events (SSE).
 * Format: `data: {json}\n\n` for each event.
 */
export class StreamingResult {
  readonly isStreaming = true;
  private generator: AsyncGenerator<ThreadStreamEvent>;

  constructor(generator: AsyncGenerator<ThreadStreamEvent>) {
    this.generator = generator;
  }

  /**
   * Async iterator that yields SSE-formatted strings.
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<string> {
    for await (const event of this.generator) {
      // Serialize the event, excluding null values
      const json = JSON.stringify(event, (_, value) => (value === null ? undefined : value));
      // Format as SSE
      yield `data: ${json}\n\n`;
    }
  }
}

/**
 * Non-streaming result that returns a JSON response.
 */
export class NonStreamingResult {
  readonly isStreaming = false;
  private data: unknown;

  constructor(data: unknown) {
    this.data = data;
  }

  /**
   * Get the response data as a JSON-serializable object.
   */
  toJSON(): unknown {
    return this.data;
  }

  /**
   * Get the response data as a JSON string.
   */
  toString(): string {
    return JSON.stringify(this.data, (_, value) => (value === null ? undefined : value));
  }
}
