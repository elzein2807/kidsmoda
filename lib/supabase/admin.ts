import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS.
 *
 * ONLY for server routes that must write on a guest's behalf: placing an order,
 * reserving stock, recording an in-store sale. It must never be imported into a
 * client component, and SUPABASE_SERVICE_ROLE_KEY must never be prefixed with
 * NEXT_PUBLIC_. The "server-only" import above turns a mistake into a build
 * error rather than a leaked key.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
