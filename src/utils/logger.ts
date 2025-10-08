/**
 * Simple logging interface
 */

export interface Logger {
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
  debug(message: string, extra?: Record<string, unknown>): void;
}

/**
 * Default console logger implementation
 */
class ConsoleLogger implements Logger {
  info(message: string, extra?: Record<string, unknown>): void {
    if (extra) {
      console.log(`[INFO] ${message}`, extra);
    } else {
      console.log(`[INFO] ${message}`);
    }
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    if (extra) {
      console.warn(`[WARN] ${message}`, extra);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }

  error(message: string, extra?: Record<string, unknown>): void {
    if (extra) {
      console.error(`[ERROR] ${message}`, extra);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    if (extra) {
      console.debug(`[DEBUG] ${message}`, extra);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  }
}

/**
 * Default logger instance
 */
export const defaultLogger: Logger = new ConsoleLogger();
