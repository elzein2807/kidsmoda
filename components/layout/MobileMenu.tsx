"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { AGE_GROUPS, STORE, categoriesFor } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { whatsapp } from "@/lib/whatsapp";
import type { Gender } from "@/types/catalog";

/**
 * MOBILE MENU — a full-screen chapter, not a stacked desktop nav.
 *
 * Level 1 is the two worlds, set at display scale so the choice is physical.
 * Choosing one slides in that world's ages and categories. Back returns.
 * Everything sits within thumb reach and every target clears 48px.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && <MobileMenuPanel onClose={onClose} />}
    </AnimatePresence>
  );
}

/**
 * The panel only exists while the menu is open, so its drill-down state resets
 * naturally on close — no effect has to reach in and clear it.
 */
function MobileMenuPanel({ onClose }: { onClose: () => void }) {
  const [world, setWorld] = useState<Gender | null>(null);

  // Trap focus inside the panel while it owns the screen
  useEffect(() => {
    const panel = document.getElementById("km-mobile-menu");
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [world]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
          id="km-mobile-menu"
          className="km-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="km-mobile__top">
            <Logo className="km-mobile__logo" />
            <button type="button" className="km-iconbtn" onClick={onClose} aria-label="Close menu">
              <Icon name="close" />
            </button>
          </div>

          <div className="km-mobile__body">
            <AnimatePresence mode="wait" initial={false}>
              {!world ? (
                <motion.div
                  key="root"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                >
                  {(["girls", "boys"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      className="km-mobile__world"
                      data-world={g}
                      onClick={() => setWorld(g)}
                    >
                      <span className="km-mobile__world-name">{g === "girls" ? "Girls" : "Boys"}</span>
                      <Icon name="chevron-right" size={26} />
                    </button>
                  ))}

                  <ul className="km-mobile__links">
                    <li><Link href="/new-in" onClick={onClose}>New In</Link></li>
                    <li><Link href="/sale" onClick={onClose}>Sale</Link></li>
                    <li><Link href="/our-store" onClick={onClose}>Our Store</Link></li>
                    <li><Link href="/wishlist" onClick={onClose}>Wishlist</Link></li>
                    <li><Link href="/size-guide" onClick={onClose}>Size Guide</Link></li>
                    <li><Link href="/delivery" onClick={onClose}>Delivery</Link></li>
                    <li><Link href="/contact" onClick={onClose}>Contact</Link></li>
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key={world}
                  data-world={world}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button type="button" className="km-mobile__back" onClick={() => setWorld(null)}>
                    <Icon name="chevron-left" size={18} />
                    All departments
                  </button>

                  <p className="km-eyebrow km-mobile__eyebrow">Shop by age</p>
                  <div className="km-mobile__ages">
                    {AGE_GROUPS.map((a) => (
                      <Link key={a.id} href={`/${world}/${a.id}`} onClick={onClose} className="km-mobile__age">
                        {a.label}
                      </Link>
                    ))}
                  </div>

                  <p className="km-eyebrow km-mobile__eyebrow">Categories</p>
                  <ul className="km-mobile__cats">
                    {categoriesFor(world).map((c) => (
                      <li key={c.slug}>
                        <Link href={`/${world}?category=${c.slug}`} onClick={onClose}>
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <Link href={`/${world}`} onClick={onClose} className="km-btn km-btn--world km-btn--block km-mobile__all">
                    Shop all {world === "girls" ? "Girls" : "Boys"}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="km-mobile__foot">
            <a href={whatsapp.general()} target="_blank" rel="noopener noreferrer" className="km-mobile__wa">
              <Icon name="whatsapp" size={20} />
              WhatsApp {STORE.phoneDisplay}
            </a>
            <p className="km-mobile__addr">
              {STORE.street}, {STORE.district}
            </p>
          </div>
    </motion.div>
  );
}
