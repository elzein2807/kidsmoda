"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatLbp, formatUsd, usdToLbp } from "@/lib/currency";
import { CURRENCY } from "@/lib/config";

interface PosVariant { id: string; sku: string; barcode: string; colorId: string; size: string; available: number }
interface PosProduct {
  id: string; name: string; brand: string; priceUsd: number;
  colors: { id: string; name: string }[];
  variants: PosVariant[];
}
interface Line { variantId: string; name: string; color: string; size: string; qty: number; unitUsd: number; available: number }

/**
 * POS TERMINAL
 *
 * Built for a counter, not a desk: large targets, keyboard-first, and a
 * barcode field that stays focused so a scanner just works. Scanning is simply
 * fast typing followed by Enter, which is exactly what the input handles.
 */
export function PosTerminal({ catalogue }: { catalogue: PosProduct[] }) {
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [currency, setCurrency] = useState<"USD" | "LBP">("USD");
  const [received, setReceived] = useState("");
  const [done, setDone] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: { product: PosProduct; variant: PosVariant }[] = [];
    for (const p of catalogue) {
      for (const v of p.variants) {
        if (
          v.barcode.includes(q) ||
          v.sku.toLowerCase().includes(q) ||
          `${p.name} ${p.brand} ${v.size}`.toLowerCase().includes(q)
        ) {
          out.push({ product: p, variant: v });
        }
        if (out.length >= 12) break;
      }
      if (out.length >= 12) break;
    }
    return out;
  }, [query, catalogue]);

  const add = (p: PosProduct, v: PosVariant) => {
    if (v.available === 0) return;
    setDone(false);
    setLines((prev) => {
      const found = prev.find((l) => l.variantId === v.id);
      if (found) {
        if (found.qty >= v.available) return prev;
        return prev.map((l) => (l.variantId === v.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          variantId: v.id,
          name: p.name,
          color: p.colors.find((c) => c.id === v.colorId)?.name ?? v.colorId,
          size: v.size,
          qty: 1,
          unitUsd: p.priceUsd,
          available: v.available,
        },
      ];
    });
    setQuery("");
  };

  const total = lines.reduce((n, l) => n + l.unitUsd * l.qty, 0);
  const receivedNum = Number(received) || 0;
  const receivedUsd = currency === "USD" ? receivedNum : receivedNum / CURRENCY.usdToLbp;
  const change = Math.max(0, receivedUsd - total);
  const enough = receivedUsd >= total && total > 0;

  const fmt = (usd: number) => (currency === "USD" ? formatUsd(usd) : formatLbp(usd));

  return (
    <div className="km-pos">
      <section className="km-panel km-pos__search">
        <label className="km-field">
          <span className="km-label">Scan a barcode or search</span>
          <input
            className="km-input km-pos__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                add(results[0].product, results[0].variant);
              }
            }}
            placeholder="Barcode, SKU or product name"
            autoFocus
            autoComplete="off"
          />
        </label>

        {results.length > 0 && (
          <ul className="km-pos__results">
            {results.map(({ product, variant }) => (
              <li key={variant.id}>
                <button
                  type="button"
                  className="km-pos__result"
                  onClick={() => add(product, variant)}
                  disabled={variant.available === 0}
                >
                  <span>
                    <strong>{product.name}</strong>
                    <span className="km-admin__muted">
                      {" "}· {product.colors.find((c) => c.id === variant.colorId)?.name} · {variant.size}
                    </span>
                  </span>
                  <span className="km-pos__result-right">
                    <span data-numeric>{formatUsd(product.priceUsd)}</span>
                    <span className={variant.available === 0 ? "km-pill km-pill--danger" : "km-pill"}>
                      {variant.available === 0 ? "Sold out" : `${variant.available} left`}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="km-pos__lines">
          {lines.length === 0 ? (
            <p className="km-panel__note">Nothing on the counter yet. Scan the first piece.</p>
          ) : (
            <table className="km-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col" className="km-table__num">Qty</th>
                  <th scope="col" className="km-table__num">Total</th>
                  <th scope="col"><span className="km-sr">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.variantId}>
                    <td>
                      {l.name}
                      <br />
                      <span className="km-admin__muted">{l.color} · {l.size}</span>
                    </td>
                    <td className="km-table__num">
                      <div className="km-qty">
                        <button type="button" className="km-qty__btn" onClick={() => setLines((p) => p.map((x) => x.variantId === l.variantId ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} aria-label={`Fewer ${l.name}`}>
                          <Icon name="minus" size={15} />
                        </button>
                        <span className="km-qty__value">{l.qty}</span>
                        <button type="button" className="km-qty__btn" disabled={l.qty >= l.available} onClick={() => setLines((p) => p.map((x) => x.variantId === l.variantId ? { ...x, qty: Math.min(x.available, x.qty + 1) } : x))} aria-label={`More ${l.name}`}>
                          <Icon name="plus" size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="km-table__num">{formatUsd(l.unitUsd * l.qty)}</td>
                    <td>
                      <button type="button" className="km-iconbtn" onClick={() => setLines((p) => p.filter((x) => x.variantId !== l.variantId))} aria-label={`Remove ${l.name}`}>
                        <Icon name="close" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <aside className="km-panel km-pos__till">
        <h2 className="km-panel__title">Take payment</h2>

        <div className="km-pos__total">
          <span>Total</span>
          <strong data-numeric>{fmt(total)}</strong>
        </div>
        <p className="km-hint km-pos__alt" data-numeric>
          {currency === "USD" ? `${usdToLbp(total).toLocaleString("en-US")} LL` : formatUsd(total)}
        </p>

        <fieldset className="km-pos__currency">
          <legend className="km-label">Paying in</legend>
          <div className="km-form__chips">
            {(["USD", "LBP"] as const).map((c) => (
              <button key={c} type="button" className="km-chip" aria-pressed={currency === c} onClick={() => { setCurrency(c); setReceived(""); }}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="km-field">
          <span className="km-label">Cash received</span>
          <input
            className="km-input"
            type="number"
            inputMode="decimal"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            placeholder={currency === "USD" ? "0" : "0"}
          />
        </label>

        {receivedNum > 0 && (
          <div className={enough ? "km-note km-note--success" : "km-note km-note--warning"}>
            <span>
              {enough ? `Change: ${fmt(change)}` : `Short by ${fmt(total - receivedUsd)}`}
            </span>
          </div>
        )}

        <button
          type="button"
          className="km-btn km-btn--block km-btn--lg"
          disabled={!enough}
          onClick={() => setDone(true)}
        >
          Complete sale
        </button>

        {done && (
          <p className="km-note km-note--warning" role="alert">
            <Icon name="alert" size={18} />
            <span>
              Not recorded — no database is connected. Once Supabase is set up
              this writes an <code>in_store</code> order and a matching
              <code> stock_movements</code> row, which is what takes the piece
              off the website.
            </span>
          </p>
        )}

        <div className="km-pos__secondary">
          <button type="button" className="km-btn km-btn--outline km-btn--sm"><Icon name="print" size={15} />Receipt</button>
          <button type="button" className="km-btn km-btn--outline km-btn--sm"><Icon name="exchange" size={15} />Exchange</button>
          <button type="button" className="km-btn km-btn--outline km-btn--sm"><Icon name="arrow-right" size={15} />Return</button>
        </div>
      </aside>
    </div>
  );
}
