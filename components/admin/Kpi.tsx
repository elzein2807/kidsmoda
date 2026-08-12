import { cx } from "@/lib/utils";

/**
 * KPI TILE — a number and what it means. No sparkline decoration, no
 * percentage badges invented from nothing: if there is no comparison period
 * with data, the tile simply does not claim a trend.
 */
export function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  return (
    <div className={cx("km-kpi", `km-kpi--${tone}`)}>
      <p className="km-kpi__label">{label}</p>
      <p className="km-kpi__value" data-numeric>{value}</p>
      {hint && <p className="km-kpi__hint">{hint}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  const tone =
    status === "delivered" ? "positive"
    : status === "cancelled" || status === "returned" ? "danger"
    : status === "out_for_delivery" || status === "ready_for_delivery" ? "info"
    : "warning";

  return (
    <span className={cx("km-pill", `km-pill--${tone}`)}>
      {label}
    </span>
  );
}
