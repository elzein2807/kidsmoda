import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * ADMIN ACCESS
 *
 * Real architecture, honestly reported:
 *
 * · When Supabase is configured, access requires a signed-in user who also has
 *   a row in admin_profiles. Being able to authenticate is not enough — only
 *   the owner and her son are in that table.
 * · When Supabase is NOT configured (no keys yet), the dashboard opens in
 *   preview mode and says so in a banner on every page. It is not pretending
 *   to be protected, and middleware still blocks /admin in production builds
 *   so an unprotected dashboard can never ship live.
 */

export type AdminSession =
  | { state: "authorised"; email: string; name: string; role: "owner" | "staff" }
  | { state: "anonymous" }
  | { state: "forbidden"; email: string }
  | { state: "unconfigured" };

export async function getAdminSession(): Promise<AdminSession> {
  const supabase = await createClient();
  if (!supabase) return { state: "unconfigured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "anonymous" };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { state: "forbidden", email: user.email ?? "" };

  return {
    state: "authorised",
    email: user.email ?? "",
    name: profile.full_name as string,
    role: (profile.role as "owner" | "staff") ?? "staff",
  };
}

export function isPreview(session: AdminSession): boolean {
  return session.state === "unconfigured";
}
