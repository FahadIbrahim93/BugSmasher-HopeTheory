import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSupabaseAnonKey, getSupabaseUrl, supabaseConfig } from './supabaseConfig';

describe('supabaseConfig', () => {
  it('source file does not include committed fallback credentials', () => {
    const source = readFileSync(join(process.cwd(), 'src/game/database/supabaseConfig.ts'), 'utf8');

    const leakedProjectRef = ['falok', 'nbaathdkmaeodxt'].join('');
    const jwtPrefix = ['eyJ', 'hbGci'].join('');
    const supabasePlatformKeyPrefix = ['sb', 'p_'].join('');

    expect(source).not.toContain(leakedProjectRef);
    expect(source).not.toContain(jwtPrefix);
    expect(source).not.toContain(supabasePlatformKeyPrefix);
  });

  it('exposes config through helper functions', () => {
    expect(getSupabaseUrl()).toBe(supabaseConfig.url);
    expect(getSupabaseAnonKey()).toBe(supabaseConfig.anonKey);
  });
});
