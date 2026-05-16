/**
 * Centralized logging system for the application
 * Automatically disabled in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: import.meta.env.DEV, // Only enabled in development
      minLevel: import.meta.env.DEV ? 'debug' : 'error',
      prefix: '[Kinetic]',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix || '';
    return `${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error, ...args);
      
      // In production, you could send errors to a service like Sentry here
      if (!import.meta.env.DEV && error) {
        // TODO: Integrate with error tracking service (e.g., Sentry)
        // Sentry.captureException(error);
      }
    }
  }

  // Utility method to create a logger with a specific context
  createContext(context: string): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix} [${context}]`,
    });
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating contextual loggers
export { Logger };

// Example usage:
// import { logger } from './lib/logger';
// logger.debug('Debug message', { data: 'value' });
// logger.info('Info message');
// logger.warn('Warning message');
// logger.error('Error occurred', error);
//
// // Create a contextual logger
// const authLogger = logger.createContext('Auth');
// authLogger.info('User logged in');
