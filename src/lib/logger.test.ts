import { describe, it, expect, beforeEach } from 'vitest';
import { logger } from '../lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    logger.clear();
  });

  it('logs messages at all levels', () => {
    logger.debug('test', 'debug message');
    logger.info('test', 'info message');
    logger.warn('test', 'warn message');
    logger.error('test', 'error message');

    const logs = logger.getLogs();
    expect(logs).toHaveLength(4);
  });

  it('records data with log entries', () => {
    logger.info('test', 'message', { userId: 123, action: 'spawn' });

    const logs = logger.getLogs();
    expect(logs[0].data).toEqual({ userId: 123, action: 'spawn' });
  });

  it('filters logs by level', () => {
    logger.debug('test', 'debug');
    logger.info('test', 'info');
    logger.warn('test', 'warn');

    const warnings = logger.getLogs({ level: 'warn' });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toBe('warn');
  });

  it('filters logs by category', () => {
    logger.info('GameEngine', 'message 1');
    logger.info('SaveManager', 'message 2');
    logger.info('GameEngine', 'message 3');

    const engineLogs = logger.getLogs({ category: 'GameEngine' });
    expect(engineLogs).toHaveLength(2);
  });

  it('maintains max log history', () => {
    for (let i = 0; i < 600; i++) {
      logger.info('test', `message ${i}`);
    }

    const logs = logger.getLogs();
    expect(logs.length).toBeLessThanOrEqual(500);
    expect(logs[0].message).toBe('message 100'); // Oldest should be ~100
  });

  it('includes timestamps', () => {
    const before = Date.now();
    logger.info('test', 'message');
    const after = Date.now();

    const logs = logger.getLogs();
    expect(logs[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(logs[0].timestamp).toBeLessThanOrEqual(after);
  });
});
