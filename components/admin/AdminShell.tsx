"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { cx } from "@/lib/utils";

/**
 * ADMIN SHELL
 *
 * The dashboard shares the brand's typography and colour but drops the
 * editorial pacing entirely: dense, fast, and legible in a shop with the
 * lights on. No decorative motion — the only transitions are the ones that
 * explain a state change.
 */

const NAV = [
  { href: "/admin", label: "Overview", icon: "grid" as const, exact: true },
  { href: "/admin/orders", label: "Orders", icon: "truck" as const },
  { href: "/admin/products", label: "Products", icon: "bag" as const },
  { href: "/admin/inventory", label: "Inventory", icon: "barcode" as const },
  { href: "/admin/pos", label: "In-Store", icon: "cash" as const },
  { href: "/admin/customers", label: "Customers", icon: "heart" as const },
  { href: "/admin/content", label: "Website", icon: "edit" as const },
  { href: "/admin/reports", label: "Reports", icon: "star" as const },
  { href: "/admin/settings", label: "Settings", icon: "ruler" as const },
];

export function AdminShell({
  children,
  preview,
  userName,
}: {
  children: React.ReactNode;
  preview: boolean;
  userName?: string;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="km-admin">
      <aside className={cx("km-admin__nav", navOpen && "is-open")} aria-label="Dashboard">
        <div className="km-admin__brand">
          <Link href="/admin" aria-label="Kids Moda dashboard">
            <Logo />
          </Link>
          <span className="km-admin__tag">Dashboard</span>
        </div>

        <nav>
          <ul className="km-admin__list">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cx("km-admin__link", active && "is-active")}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                  >
                    <Icon name={item.icon} size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="km-admin__foot">
          <Link href="/" className="km-admin__link">
            <Icon name="arrow-up-right" size={18} />
            View the shop
          </Link>
          {userName && <p className="km-admin__user">Signed in as {userName}</p>}
        </div>
      </aside>

      <div className="km-admin__main">
        <header className="km-admin__topbar">
          <button
            type="button"
            className="km-iconbtn km-admin__burger"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Toggle dashboard menu"
            aria-expanded={navOpen}
          >
            <Icon name="menu" />
          </button>
          <p className="km-admin__today">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        {preview && (
          <div className="km-admin__banner" role="status">
            <Icon name="alert" size={18} />
            <div>
              <strong>Preview mode — this dashboard is not protected.</strong>{" "}
              Supabase is not connected, so there is no sign-in and no database.
              Figures come from the development catalogue. Add
              <code> NEXT_PUBLIC_SUPABASE_URL</code> and
              <code> SUPABASE_SERVICE_ROLE_KEY</code> to enable real
              authentication, and only the owner and her son will have access.
            </div>
          </div>
        )}

        {/* Not a <main>: the root layout already provides the page's main
            landmark, and nesting a second one is invalid and confuses
            screen-reader landmark navigation. */}
        <div className="km-admin__content">{children}</div>
      </div>

      {navOpen && <button type="button" className="km-admin__scrim" onClick={() => setNavOpen(false)} aria-label="Close menu" />}
    </div>
  );
}
