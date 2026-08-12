"use client";

import { useStore } from "@/components/shop/StoreProvider";
import { formatLbp, formatUsd, discountPercent } from "@/lib/currency";
import { cx } from "@/lib/utils";

/**
 * PRICE — the single place a price is rendered.
 *
 * Shows the customer's chosen currency as the headline figure and the other
 * currency underneath, because Lebanese shoppers routinely think in both.
 * A reduced price is never communicated by colour alone: the old price stays
 * visible with a strike-through and the saving is spelled out.
 */
export function Price({
  usd,
  compareAt = null,
  size = "md",
  className,
}: {
  usd: number;
  compareAt?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { currency } = useStore();
  const off = discountPercent(usd, compareAt);
  const primary = currency === "USD" ? formatUsd(usd) : formatLbp(usd);
  const secondary = currency === "USD" ? formatLbp(usd) : formatUsd(usd);

  return (
    <div className={cx("km-price", off !== null && "km-price--sale", className)} data-numeric>
      <span
        className="km-price__usd"
        style={size === "lg" ? { fontSize: "var(--km-t-h4)" } : size === "sm" ? { fontSize: "var(--km-t-body-sm)" } : undefined}
      >
        {primary}
      </span>
      {compareAt !== null && compareAt > usd && (
        <>
          <span className="km-price__was">
            <span className="km-sr">Previous price </span>
            {currency === "USD" ? formatUsd(compareAt) : formatLbp(compareAt)}
          </span>
          <span className="km-badge km-badge--sale">−{off}%</span>
        </>
      )}
      <span className="km-price__lbp">{secondary}</span>
    </div>
  );
}
