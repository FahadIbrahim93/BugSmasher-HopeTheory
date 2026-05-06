/**
 * Structured logger for consistent observability across game, database, and UI layers.
 * Supports multiple levels: debug, info, warn, error.
 * In production (Vercel), logs are sent to stdout for monitoring.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

class Logger {
  private isDev = !import.meta.env.PROD;
  private logs: LogEntry[] = [];
  private maxLogs = 500;

  log(level: LogLevel, category: string, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      category,
      message,
      timestamp: Date.now(),
      data
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Always output to console in dev
    if (this.isDev) {
      const prefix = `[${category}]`;
      const logFn = console[level === 'debug' ? 'log' : level];
      logFn(`${prefix} ${message}`, data || '');
    } else {
      // In production, only log warn and error
      if (level === 'warn' || level === 'error') {
        console[level](`[${category}] ${message}`, data || '');
      }
    }
  }

  debug(category: string, message: string, data?: Record<string, unknown>) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: Record<string, unknown>) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: Record<string, unknown>) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: Record<string, unknown>) {
    this.log('error', category, message, data);
  }

  getLogs(filter?: { level?: LogLevel; category?: string }): LogEntry[] {
    if (!filter) return this.logs;
    return this.logs.filter(
      (log) =>
        (!filter.level || log.level === filter.level) &&
        (!filter.category || log.category === filter.category)
    );
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
