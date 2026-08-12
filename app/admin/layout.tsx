import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession, isPreview } from "@/lib/admin/auth";
import { AdminLogin } from "@/app/admin/login/AdminLogin";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Every admin route passes through this gate. When Supabase is connected,
 * anyone who is not in admin_profiles gets the sign-in screen — being able to
 * authenticate is not the same as being allowed in.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (session.state === "anonymous" || session.state === "forbidden") {
    return (
      <AdminLogin
        forbidden={session.state === "forbidden"}
        email={session.state === "forbidden" ? session.email : undefined}
      />
    );
  }

  return (
    <AdminShell
      preview={isPreview(session)}
      userName={session.state === "authorised" ? session.name : undefined}
    >
      {children}
    </AdminShell>
  );
}
