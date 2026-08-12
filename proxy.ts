import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 "proxy" convention (formerly middleware).
 *
 * The admin dashboard must never be publicly reachable in production without
 * authentication. Supabase credentials are not configured yet, so rather than
 * shipping an open dashboard this blocks /admin on production deployments and
 * allows it locally, where it runs in a clearly-labelled preview mode.
 *
 * Once NEXT_PUBLIC_SUPABASE_URL is set, the real session check in
 * lib/admin/auth.ts takes over and this guard steps aside.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const isProduction = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";

  if (isProduction && !supabaseConfigured) {
    return new NextResponse(
      "The Kids Moda dashboard is not available until authentication is configured.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  // Keep the dashboard out of every index, always.
  const response = NextResponse.next();
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: "/admin/:path*" };
