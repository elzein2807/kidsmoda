import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — anon key only.
 *
 * Reads are further restricted by RLS (see supabase/migrations/0001_schema.sql):
 * the anon role can read visible catalogue rows and nothing else. Orders,
 * customers and inventory movements are unreachable from here by design.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
