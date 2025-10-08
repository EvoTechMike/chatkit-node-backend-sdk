/**
 * Tests for error classes
 */

import { describe, it, expect } from 'vitest';
import { StreamError, CustomStreamError, ErrorCode } from '../../src/errors/index.js';

describe('StreamError', () => {
  it('should create a stream error with ErrorCode enum', () => {
    const error = new StreamError(ErrorCode.STREAM_ERROR, true);
    expect(error.code).toBe(ErrorCode.STREAM_ERROR);
    expect(error.allowRetry).toBe(true);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('StreamError');
  });

  it('should create a stream error with custom code string', () => {
    const error = new StreamError('custom.error.code', false);
    expect(error.code).toBe('custom.error.code');
    expect(error.allowRetry).toBe(false);
  });

  it('should default allowRetry to false', () => {
    const error = new StreamError('some.error');
    expect(error.allowRetry).toBe(false);
  });

  it('should have correct error message', () => {
    const error = new StreamError(ErrorCode.STREAM_ERROR);
    expect(error.message).toContain('stream.error');
  });

  it('should be instanceof Error', () => {
    const error = new StreamError(ErrorCode.STREAM_ERROR);
    expect(error instanceof Error).toBe(true);
    expect(error instanceof StreamError).toBe(true);
  });
});

describe('CustomStreamError', () => {
  it('should create a custom stream error with message', () => {
    const error = new CustomStreamError('Something went wrong', false);
    expect(error.message).toBe('Something went wrong');
    expect(error.allowRetry).toBe(false);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('CustomStreamError');
  });

  it('should create error with allowRetry true', () => {
    const error = new CustomStreamError('Temporary failure', true);
    expect(error.allowRetry).toBe(true);
  });

  it('should default allowRetry to false', () => {
    const error = new CustomStreamError('Error message');
    expect(error.allowRetry).toBe(false);
  });

  it('should be instanceof Error', () => {
    const error = new CustomStreamError('Test error');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof CustomStreamError).toBe(true);
  });
});

describe('ErrorCode enum', () => {
  it('should have STREAM_ERROR code', () => {
    expect(ErrorCode.STREAM_ERROR).toBe('stream.error');
  });

  it('should have INTERNAL_ERROR code', () => {
    expect(ErrorCode.INTERNAL_ERROR).toBe('internal.error');
  });

  it('should have INVALID_REQUEST code', () => {
    expect(ErrorCode.INVALID_REQUEST).toBe('invalid.request');
  });

  it('should have THREAD_NOT_FOUND code', () => {
    expect(ErrorCode.THREAD_NOT_FOUND).toBe('thread.not_found');
  });
});
