"use client";

import { Icon } from "@/components/ui/Icon";

/** QUANTITY — 44px targets, disabled at the bounds rather than hidden. */
export function QtyStepper({
  qty,
  onChange,
  max = 10,
  label,
}: {
  qty: number;
  onChange: (n: number) => void;
  max?: number;
  label: string;
}) {
  return (
    <div className="km-qty" role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className="km-qty__btn"
        onClick={() => onChange(qty - 1)}
        aria-label={qty === 1 ? `Remove ${label}` : `Decrease quantity of ${label}`}
      >
        <Icon name={qty === 1 ? "trash" : "minus"} size={16} />
      </button>
      <span className="km-qty__value" data-numeric aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        className="km-qty__btn"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
