/**
 * Tests for logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defaultLogger } from '../../src/utils/logger.js';

describe('defaultLogger', () => {
  // Spy on console methods
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info()', () => {
    it('should log info message', () => {
      defaultLogger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Test info message');
    });

    it('should log info message with extra data', () => {
      const extra = { userId: '123', action: 'test' };
      defaultLogger.info('User action', extra);
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] User action', extra);
    });
  });

  describe('warn()', () => {
    it('should log warning message', () => {
      defaultLogger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning');
    });

    it('should log warning message with extra data', () => {
      const extra = { reason: 'rate limit' };
      defaultLogger.warn('Rate limit warning', extra);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Rate limit warning', extra);
    });
  });

  describe('error()', () => {
    it('should log error message', () => {
      defaultLogger.error('Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error');
    });

    it('should log error message with extra data', () => {
      const extra = { errorCode: 'ERR_001', stack: 'stack trace' };
      defaultLogger.error('Database error', extra);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Database error', extra);
    });
  });

  describe('debug()', () => {
    it('should log debug message', () => {
      defaultLogger.debug('Test debug');
      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Test debug');
    });

    it('should log debug message with extra data', () => {
      const extra = { requestId: 'req_123', duration: 45 };
      defaultLogger.debug('Request completed', extra);
      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Request completed', extra);
    });
  });

  describe('Logger interface', () => {
    it('should have all required methods', () => {
      expect(typeof defaultLogger.info).toBe('function');
      expect(typeof defaultLogger.warn).toBe('function');
      expect(typeof defaultLogger.error).toBe('function');
      expect(typeof defaultLogger.debug).toBe('function');
    });
  });
});
