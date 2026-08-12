import { CURRENCY } from "@/lib/config";
import type { Currency } from "@/types/catalog";

/**
 * Currency architecture.
 *
 * USD is the canonical stored price. LBP is always DERIVED at render time
 * from a single rate, so the owner can update it in one place without any
 * price data migration. No component may hardcode a rate.
 */

export function usdToLbp(usd: number, rate: number = CURRENCY.usdToLbp): number {
  const raw = usd * rate;
  return Math.round(raw / CURRENCY.lbpRounding) * CURRENCY.lbpRounding;
}

/** "$24" / "$24.50" — trailing .00 is dropped, prices stay quiet */
export function formatUsd(usd: number): string {
  const hasCents = Math.round(usd * 100) % 100 !== 0;
  return `$${usd.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** "2,136,000 LL" — grouped, never abbreviated, so parents can read it fast */
export function formatLbp(usd: number, rate: number = CURRENCY.usdToLbp): string {
  return `${usdToLbp(usd, rate).toLocaleString("en-US")} LL`;
}

export function formatPrice(usd: number, currency: Currency, rate: number = CURRENCY.usdToLbp): string {
  return currency === "USD" ? formatUsd(usd) : formatLbp(usd, rate);
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
