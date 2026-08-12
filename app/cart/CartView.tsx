"use client";

import Link from "next/link";
import { useStore } from "@/components/shop/StoreProvider";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/shop/Price";
import { QtyStepper } from "@/components/shop/QtyStepper";
import { MaskLine, Reveal } from "@/components/motion/Reveal";
import { DELIVERY } from "@/lib/config";
import { formatLbp, formatUsd } from "@/lib/currency";
import { whatsapp } from "@/lib/whatsapp";

/** FULL CART PAGE — the same data as the drawer, with room to review. */
export function CartView() {
  const { lines, setQty, removeLine, subtotalUsd, currency } = useStore();
  const fee = subtotalUsd >= DELIVERY.freeThresholdUsd ? 0 : DELIVERY.feeUsd;
  const total = subtotalUsd + fee;
  const fmt = (usd: number) => (currency === "USD" ? formatUsd(usd) : formatLbp(usd));

  return (
    <div className="km-shell km-section-tight" data-world="neutral">
      <Reveal>
        <nav className="km-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Bag</span>
        </nav>
        <h1 className="km-page-type">
          <MaskLine>Your bag</MaskLine>
        </h1>
      </Reveal>

      {lines.length === 0 ? (
        <div className="km-empty">
          <Icon name="bag" size={34} className="km-empty__icon" />
          <h2 className="km-empty__title">Nothing in the bag yet</h2>
          <p className="km-empty__copy">Everything you add will wait here for you.</p>
          <div className="km-empty__actions">
            <Link href="/new-in" className="km-btn km-btn--sm">New in</Link>
            <Link href="/girls" className="km-btn km-btn--outline km-btn--sm">Girls</Link>
            <Link href="/boys" className="km-btn km-btn--outline km-btn--sm">Boys</Link>
          </div>
        </div>
      ) : (
        <div className="km-cartpage">
          <ul className="km-cartlist">
            {lines.map((l) => (
              <li key={l.key} className="km-cartline">
                <Link href={`/product/${l.slug}`} className="km-cartline__media">
                  <Figure seed={l.variantId} plate={l.plate} ratio="portrait" sizes="90px" alt="" />
                </Link>
                <div className="km-cartline__body">
                  <p className="km-cartline__brand">{l.brand}</p>
                  <Link href={`/product/${l.slug}`} className="km-cartline__name">{l.name}</Link>
                  <p className="km-cartline__meta">{l.colorName} · Size {l.size}</p>
                  <div className="km-cartline__row">
                    <QtyStepper qty={l.qty} onChange={(n) => (n <= 0 ? removeLine(l.key) : setQty(l.key, n))} label={l.name} />
                    <Price usd={l.unitUsd * l.qty} compareAt={null} />
                  </div>
                </div>
                <button
                  type="button"
                  className="km-iconbtn km-cartline__remove"
                  onClick={() => removeLine(l.key)}
                  aria-label={`Remove ${l.name}`}
                >
                  <Icon name="close" size={16} />
                </button>
              </li>
            ))}
          </ul>

          <aside className="km-cartpage__summary" aria-label="Summary">
            <h2 className="km-checkout__legend">Summary</h2>
            <dl className="km-checkout__totals" data-numeric>
              <div><dt>Subtotal</dt><dd>{fmt(subtotalUsd)}</dd></div>
              <div><dt>Delivery</dt><dd>{fee === 0 ? "Free" : fmt(fee)}</dd></div>
              <div className="km-checkout__grand"><dt>Total</dt><dd>{fmt(total)}</dd></div>
            </dl>
            <p className="km-hint km-checkout__alt">
              {currency === "USD" ? formatLbp(total) : formatUsd(total)}
            </p>

            <Link href="/checkout" className="km-btn km-btn--block km-btn--lg">Checkout</Link>
            <a
              href={whatsapp.cart(
                lines.map((l) => ({ name: l.name, size: l.size, colorName: l.colorName, qty: l.qty })),
                fmt(total),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="km-btn km-btn--outline km-btn--block km-drawer__wa"
            >
              <Icon name="whatsapp" size={18} />
              Order through WhatsApp
            </a>

            <p className="km-note km-note--info km-checkout__exchange">
              <Icon name="cash" size={18} />
              <span>Cash on delivery, all over Lebanon. Pay in USD or LBP.</span>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
