// Supabase Configuration - Centralized for the app
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://faloknbaathdkmaeodxt.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbG9rbmJhYXRoZGttYWVvZHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjc1NDcsImV4cCI6MjA5MjgwMzU0N30.vnmos6JGHAtJ9w5J1QgmSq7BgTwMEdztvWBv9sId7GQ',
};

export function getSupabaseUrl(): string {
  return supabaseConfig.url;
}

export function getSupabaseAnonKey(): string {
  return supabaseConfig.anonKey;
}