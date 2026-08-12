"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useStore } from "@/components/shop/StoreProvider";
import { whatsapp } from "@/lib/whatsapp";
import type { Gender } from "@/types/catalog";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { cx } from "@/lib/utils";

/**
 * HEADER
 *
 * · Sticky, and condenses on scroll (the announcement strip retracts, the
 *   wordmark steps down a size) so vertical space returns to the product.
 * · Boys and Girls open a mega menu on hover AND on focus, with a small close
 *   delay so the pointer can travel diagonally into the panel.
 * · Everything is reachable by keyboard: Escape closes, Tab moves through.
 */
export function Header() {
  const pathname = usePathname();
  const { count, wishlist, currency, setCurrency, openCart, openSearch } = useStore();

  const condensed = useScrolledPast(40);
  const [openWorld, setOpenWorld] = useState<Gender | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  // Admin runs its own chrome
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  // Close everything on navigation. Adjusted during render rather than in an
  // effect, so the menus are already closed on the first frame of the new page
  // instead of flashing open for one paint.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenWorld(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenWorld(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenWorld(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  if (isAdmin) return null;

  const worlds: { id: Gender; label: string }[] = [
    { id: "girls", label: "Girls" },
    { id: "boys", label: "Boys" },
  ];

  return (
    <>
      <header className={cx("km-header", condensed && "km-header--condensed")} data-world="neutral">
        <div className={cx("km-header__announce", condensed && "km-header__announce--hidden")}>
          <AnnouncementBar />
        </div>

        <div className="km-header__bar km-shell-wide">
          <button
            type="button"
            className="km-iconbtn km-header__burger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Icon name="menu" />
          </button>

          <Link href="/" className="km-header__logo" aria-label="Kids Moda — home">
            <Logo arc={!condensed} />
          </Link>

          <nav className="km-header__nav" aria-label="Main">
            <ul className="km-header__list">
              {worlds.map((w) => (
                <li
                  key={w.id}
                  className="km-header__item"
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenWorld(w.id);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={`/${w.id}`}
                    className={cx("km-header__link", pathname?.startsWith(`/${w.id}`) && "is-active")}
                    aria-expanded={openWorld === w.id}
                    aria-haspopup="true"
                    onFocus={() => {
                      cancelClose();
                      setOpenWorld(w.id);
                    }}
                  >
                    {w.label}
                  </Link>
                </li>
              ))}
              <li className="km-header__item">
                <Link href="/new-in" className={cx("km-header__link", pathname === "/new-in" && "is-active")}>
                  New In
                </Link>
              </li>
              <li className="km-header__item">
                <Link
                  href="/sale"
                  className={cx("km-header__link km-header__link--sale", pathname === "/sale" && "is-active")}
                >
                  Sale
                </Link>
              </li>
              <li className="km-header__item">
                <Link href="/our-store" className={cx("km-header__link", pathname === "/our-store" && "is-active")}>
                  Our Store
                </Link>
              </li>
            </ul>
          </nav>

          <div className="km-header__utils">
            {/* Currency is a real preference, not a gimmick — it re-prices the
                whole site including the cart. */}
            <div className="km-currency" role="group" aria-label="Currency">
              {(["USD", "LBP"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className="km-currency__btn"
                  aria-pressed={currency === c}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <button type="button" className="km-iconbtn" onClick={openSearch} aria-label="Search">
              <Icon name="search" />
            </button>

            <Link href="/wishlist" className="km-iconbtn km-header__count" aria-label={`Wishlist, ${wishlist.length} items`}>
              <Icon name="heart" />
              {wishlist.length > 0 && <span className="km-header__dot" aria-hidden="true">{wishlist.length}</span>}
            </Link>

            <a
              href={whatsapp.general()}
              target="_blank"
              rel="noopener noreferrer"
              className="km-iconbtn km-header__wa"
              aria-label="Message us on WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>

            <button
              type="button"
              className="km-iconbtn km-header__count"
              onClick={openCart}
              aria-label={`Shopping bag, ${count} items`}
            >
              <Icon name="bag" />
              {count > 0 && <span className="km-header__dot" aria-hidden="true">{count}</span>}
            </button>
          </div>
        </div>

        {/* Mega menu — animates height so the page beneath never jumps */}
        <AnimatePresence>
          {openWorld && (
            <motion.div
              className="km-header__mega"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <MegaMenu gender={openWorld} onNavigate={() => setOpenWorld(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
