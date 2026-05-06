import { describe, it, expect } from 'vitest';
import { parseJSON, stringifyJSON } from '../lib/safe-json';

describe('Safe JSON', () => {
  describe('parseJSON', () => {
    it('parses valid JSON', () => {
      const result = parseJSON('{"name":"test","value":42}', {}, 'test');
      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('returns default value on parse error', () => {
      const defaultVal = { fallback: true };
      const result = parseJSON('{invalid json}', defaultVal, 'test');
      expect(result).toEqual(defaultVal);
    });

    it('returns default value for null input', () => {
      const defaultVal = { empty: true };
      const result = parseJSON(null, defaultVal, 'test');
      expect(result).toEqual(defaultVal);
    });

    it('returns default value for undefined input', () => {
      const defaultVal = { empty: true };
      const result = parseJSON(undefined, defaultVal, 'test');
      expect(result).toEqual(defaultVal);
    });

it('handles malformed arrays', () => {
      const defaultVal = [];
      const result = parseJSON('[1, 2, invalid}', defaultVal, 'test');
      expect(result).toEqual([]);
    });

    it('preserves complex nested structures', () => {
      const complex = { a: { b: { c: [1, 2, 3] } } };
      const json = JSON.stringify(complex);
      const result = parseJSON(json, {}, 'test');
      expect(result).toEqual(complex);
    });
  });

  describe('stringifyJSON', () => {
    it('stringifies valid objects', () => {
      const obj = { name: 'test', value: 42 };
      const result = stringifyJSON(obj, 'test');
      expect(JSON.parse(result)).toEqual(obj);
    });

    it('stringifies arrays', () => {
      const arr = [1, 2, 3, { nested: true }];
      const result = stringifyJSON(arr, 'test');
      expect(JSON.parse(result)).toEqual(arr);
    });

    it('returns empty object on error', () => {
      const circular: unknown = { a: 1 } as any;
      (circular as any).self = circular; // Create circular reference
      const result = stringifyJSON(circular, 'test');
      expect(result).toBe('{}');
    });

    it('handles null values', () => {
      const result = stringifyJSON(null, 'test');
      expect(result).toBe('null');
    });

    it('handles undefined values', () => {
      const result = stringifyJSON(undefined, 'test');
      expect(result).toBe('{}');
    });
  });
});
