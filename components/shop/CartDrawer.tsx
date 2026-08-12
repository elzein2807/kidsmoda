"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useStore } from "@/components/shop/StoreProvider";
import { Icon } from "@/components/ui/Icon";
import { Figure } from "@/components/ui/Figure";
import { Price } from "@/components/shop/Price";
import { QtyStepper } from "@/components/shop/QtyStepper";
import { formatLbp, formatUsd } from "@/lib/currency";
import { DELIVERY } from "@/lib/config";
import { whatsapp } from "@/lib/whatsapp";

/**
 * CART DRAWER
 *
 * Desktop: a side drawer. Mobile: full width (handled in CSS).
 * Both routes out are offered side by side, because a real share of Kids Moda
 * orders still finish on WhatsApp and hiding that would cost sales.
 */
export function CartDrawer() {
  const { cartOpen, closeCart, lines, setQty, removeLine, subtotalUsd, count, currency } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  // Focus management: remember what opened it, move focus in, restore on close
  useEffect(() => {
    if (cartOpen) {
      restoreFocus.current = document.activeElement as HTMLElement;
      window.setTimeout(() => {
        panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
      }, 60);
    } else {
      restoreFocus.current?.focus?.();
    }
  }, [cartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!f?.length) return;
      const first = f[0];
      const last = f[f.length - 1];
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
  }, [cartOpen, closeCart]);

  const freeDelivery = subtotalUsd >= DELIVERY.freeThresholdUsd;
  const remaining = Math.max(0, DELIVERY.freeThresholdUsd - subtotalUsd);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="km-scrim"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
          <motion.div
            ref={panelRef}
            className="km-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="km-drawer__head">
              <h2 className="km-drawer__title">
                Your bag {count > 0 && <span data-numeric>({count})</span>}
              </h2>
              <button type="button" className="km-iconbtn" onClick={closeCart} aria-label="Close bag">
                <Icon name="close" />
              </button>
            </div>

            <div className="km-drawer__body">
              {lines.length === 0 ? (
                <div className="km-empty">
                  <Icon name="bag" size={34} className="km-empty__icon" />
                  <h3 className="km-empty__title">Your bag is empty</h3>
                  <p className="km-empty__copy">
                    Start with what just arrived, or pick a world.
                  </p>
                  <div className="km-empty__actions">
                    <Link href="/new-in" className="km-btn km-btn--sm" onClick={closeCart}>New In</Link>
                    <Link href="/girls" className="km-btn km-btn--outline km-btn--sm" onClick={closeCart}>Girls</Link>
                    <Link href="/boys" className="km-btn km-btn--outline km-btn--sm" onClick={closeCart}>Boys</Link>
                  </div>
                </div>
              ) : (
                <ul className="km-cartlist">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        className="km-cartline"
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
                      >
                        <Link href={`/product/${line.slug}`} onClick={closeCart} className="km-cartline__media">
                          <Figure
                            seed={line.variantId}
                            plate={line.plate}
                            ratio="portrait"
                            sizes="90px"
                            alt={line.name}
                          />
                        </Link>

                        <div className="km-cartline__body">
                          <p className="km-cartline__brand">{line.brand}</p>
                          <Link href={`/product/${line.slug}`} onClick={closeCart} className="km-cartline__name">
                            {line.name}
                          </Link>
                          <p className="km-cartline__meta">
                            {line.colorName} · Size {line.size}
                          </p>
                          <div className="km-cartline__row">
                            <QtyStepper
                              qty={line.qty}
                              onChange={(n) => (n <= 0 ? removeLine(line.key) : setQty(line.key, n))}
                              label={line.name}
                            />
                            <Price usd={line.unitUsd * line.qty} compareAt={null} size="sm" />
                          </div>
                        </div>

                        <button
                          type="button"
                          className="km-iconbtn km-cartline__remove"
                          onClick={() => removeLine(line.key)}
                          aria-label={`Remove ${line.name} from bag`}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="km-drawer__foot">
                {freeDelivery ? (
                  <p className="km-note km-note--success">
                    <Icon name="truck" size={18} /> Delivery is on us.
                  </p>
                ) : (
                  <p className="km-note km-note--info">
                    <Icon name="truck" size={18} />
                    <span>
                      {currency === "USD" ? formatUsd(remaining) : formatLbp(remaining)} away from free delivery.
                    </span>
                  </p>
                )}

                <div className="km-drawer__total">
                  <span>Subtotal</span>
                  <Price usd={subtotalUsd} compareAt={null} size="lg" />
                </div>
                <p className="km-hint">
                  Delivery calculated at checkout · Cash on delivery across Lebanon
                </p>

                <Link href="/checkout" className="km-btn km-btn--block" onClick={closeCart}>
                  Checkout
                </Link>
                <a
                  href={whatsapp.cart(
                    lines.map((l) => ({ name: l.name, size: l.size, colorName: l.colorName, qty: l.qty })),
                    currency === "USD" ? formatUsd(subtotalUsd) : formatLbp(subtotalUsd),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="km-btn km-btn--outline km-btn--block km-drawer__wa"
                >
                  <Icon name="whatsapp" size={18} />
                  Order through WhatsApp
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
