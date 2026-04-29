// Supabase Configuration - Centralized for the app.
// Values must come from Vite environment variables. Do not commit project keys.
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export function getSupabaseUrl(): string {
  return supabaseConfig.url;
}

export function getSupabaseAnonKey(): string {
  return supabaseConfig.anonKey;
}
