/**
 * Safe JSON parsing utility with consistent error handling and logging.
 * Guarantees no unhandled parse errors - always returns valid data or default.
 */

import { logger } from './logger';

export function parseJSON<T>(
  input: string | null | undefined,
  defaultValue: T,
  context: string
): T {
  if (!input) {
    return defaultValue;
  }

  try {
    return JSON.parse(input) as T;
  } catch (error) {
    logger.warn('JSON', `Failed to parse in ${context}`, {
      error: error instanceof Error ? error.message : String(error),
      input:input.substring(0, 100) // Log first 100 chars for debugging
    });
    return defaultValue;
  }
}

export function stringifyJSON<T>(
  value: T,
  context: string
): string {
  try {
    const result = JSON.stringify(value);
    if (result === undefined) return '{}';
    return result;
  } catch (error) {
    logger.error('JSON', `Failed to stringify in ${context}`, {
      error: error instanceof Error ? error.message : String(error)
    });
    return '{}';
  }
}
