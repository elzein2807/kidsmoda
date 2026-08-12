"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { useStore } from "@/components/shop/StoreProvider";
import { Icon } from "@/components/ui/Icon";
import { Figure } from "@/components/ui/Figure";
import { QtyStepper } from "@/components/shop/QtyStepper";
import { GOVERNORATES, DELIVERY, STORE } from "@/lib/config";
import { formatLbp, formatUsd } from "@/lib/currency";
import { checkoutSchema, fieldErrors } from "@/lib/validation/checkout";
import { whatsapp } from "@/lib/whatsapp";
import { cx } from "@/lib/utils";

/**
 * CHECKOUT — guest only, cash on delivery.
 *
 * · No account, no password, no email required. That matches how Kids Moda
 *   sells today and removes the single biggest drop-off on mobile.
 * · One column on mobile, summary collapsed above the fold.
 * · Validation runs on blur, not on every keystroke, so it never nags mid-word.
 * · A generated idempotency key means a double tap cannot create two orders.
 * · Stock conflicts come back from the server as a real, named state.
 */
export function CheckoutForm() {
  const router = useRouter();
  const { lines, setQty, removeLine, subtotalUsd, currency, setCurrency, clearCart } = useStore();

  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    governorate: "",
    city: "",
    address: "",
    building: "",
    floor: "",
    landmark: "",
    instructions: "",
    coupon: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<{ name: string; size: string; available: number }[]>([]);

  // Generated on first submit, then reused: a double tap returns the first
  // order instead of creating a second. Not generated during render — that
  // would make rendering impure.
  const idempotencyKey = useRef<string | null>(null);
  const getIdempotencyKey = () => {
    idempotencyKey.current ??=
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `km-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return idempotencyKey.current;
  };

  const deliveryFee = subtotalUsd >= DELIVERY.freeThresholdUsd ? 0 : DELIVERY.feeUsd;
  const total = subtotalUsd + deliveryFee;

  const fmt = useMemo(
    () => (usd: number) => (currency === "USD" ? formatUsd(usd) : formatLbp(usd)),
    [currency],
  );

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const payload = {
      ...values,
      currency,
      items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
      idempotencyKey: getIdempotencyKey(),
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      const first = Object.keys(errs)[0];
      if (first) document.getElementById(`km-${first}`)?.focus();
      return;
    }

    setStatus("submitting");
    setMessage(null);
    setConflicts([]);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (res.status === 409 && data.unavailable) {
        setConflicts(data.unavailable);
        setStatus("error");
        setMessage(data.message);
        return;
      }
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setStatus("error");
        setMessage(data.message ?? "We could not place the order. Please try again.");
        return;
      }

      clearCart();
      router.push(`/order/${data.order.number}`);
    } catch {
      setStatus("error");
      setMessage(
        "We could not reach the server. Check your connection, or send your order on WhatsApp and we will take it from there.",
      );
    }
  };

  if (lines.length === 0) {
    return (
      <div className="km-empty">
        <Icon name="bag" size={34} className="km-empty__icon" />
        <h2 className="km-empty__title">Your bag is empty</h2>
        <p className="km-empty__copy">Add something first and we will take it from there.</p>
        <div className="km-empty__actions">
          <Link href="/new-in" className="km-btn km-btn--sm">Shop new in</Link>
          <Link href="/girls" className="km-btn km-btn--outline km-btn--sm">Girls</Link>
          <Link href="/boys" className="km-btn km-btn--outline km-btn--sm">Boys</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="km-checkout" onSubmit={submit} noValidate>
      <div className="km-checkout__main">
        {message && (
          <p className={cx("km-note", status === "error" ? "km-note--error" : "km-note--info")} role="alert">
            <Icon name="alert" size={18} />
            <span>{message}</span>
          </p>
        )}

        {conflicts.length > 0 && (
          <div className="km-note km-note--warning" role="alert">
            <Icon name="alert" size={18} />
            <div>
              <p><strong>These sold out while you were checking out:</strong></p>
              <ul className="km-checkout__conflicts">
                {conflicts.map((c) => (
                  <li key={`${c.name}-${c.size}`}>
                    {c.name}, size {c.size} — {c.available === 0 ? "none left" : `only ${c.available} left`}
                  </li>
                ))}
              </ul>
              <p>Please adjust your bag and try again.</p>
            </div>
          </div>
        )}

        <section className="km-checkout__section">
          <h2 className="km-checkout__legend">Who is it for</h2>
          <div className="km-checkout__fields">
            <Field id="fullName" label="Full name" error={errors.fullName}>
              <input id="km-fullName" className="km-input" value={values.fullName} onChange={set("fullName")} aria-invalid={!!errors.fullName} autoComplete="name" />
            </Field>

            <Field
              id="phone"
              label="Mobile number"
              error={errors.phone}
              hint="The driver will call this number. For example 03 123 456."
            >
              <input
                id="km-phone"
                className="km-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="03 123 456"
                value={values.phone}
                onChange={set("phone")}
                aria-invalid={!!errors.phone}
              />
            </Field>
          </div>
        </section>

        <section className="km-checkout__section">
          <h2 className="km-checkout__legend">Where to deliver</h2>
          <div className="km-checkout__fields">
            <Field id="governorate" label="Governorate" error={errors.governorate}>
              <select id="km-governorate" className="km-select" value={values.governorate} onChange={set("governorate")} aria-invalid={!!errors.governorate}>
                <option value="">Choose…</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>

            <Field id="city" label="City or town" error={errors.city}>
              <input id="km-city" className="km-input" value={values.city} onChange={set("city")} aria-invalid={!!errors.city} autoComplete="address-level2" />
            </Field>

            <Field id="address" label="Street and area" error={errors.address} full>
              <input id="km-address" className="km-input" value={values.address} onChange={set("address")} aria-invalid={!!errors.address} autoComplete="street-address" />
            </Field>

            <Field id="building" label="Building" optional>
              <input id="km-building" className="km-input" value={values.building} onChange={set("building")} />
            </Field>

            <Field id="floor" label="Floor" optional>
              <input id="km-floor" className="km-input" value={values.floor} onChange={set("floor")} />
            </Field>

            <Field id="landmark" label="Nearby landmark" optional hint="What should the driver look for?" full>
              <input id="km-landmark" className="km-input" value={values.landmark} onChange={set("landmark")} />
            </Field>

            <Field id="instructions" label="Delivery notes" optional full>
              <textarea id="km-instructions" className="km-textarea" value={values.instructions} onChange={set("instructions")} rows={3} />
            </Field>
          </div>
        </section>

        <section className="km-checkout__section">
          <h2 className="km-checkout__legend">Payment</h2>

          <div className="km-checkout__pay">
            <Icon name="cash" size={22} />
            <div>
              <p className="km-checkout__pay-title">Cash on delivery</p>
              <p className="km-hint">Pay the driver when your order arrives. No card needed.</p>
            </div>
            <Icon name="check" size={20} className="km-checkout__pay-check" />
          </div>

          <fieldset className="km-checkout__currency">
            <legend className="km-label">Which currency will you pay in?</legend>
            <div className="km-checkout__currency-opts">
              {(["USD", "LBP"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className="km-chip"
                  aria-pressed={currency === c}
                  onClick={() => setCurrency(c)}
                >
                  {c === "USD" ? "US Dollars" : "Lebanese Pounds"}
                </button>
              ))}
            </div>
            <p className="km-hint">
              The driver carries change in both. Total today: <strong>{fmt(total)}</strong>
            </p>
          </fieldset>
        </section>
      </div>

      {/* ---------------------------------------------------------------
          SUMMARY
          --------------------------------------------------------------- */}
      <aside className="km-checkout__summary" aria-label="Order summary">
        <h2 className="km-checkout__legend">Your order</h2>

        <ul className="km-checkout__items">
          {lines.map((l) => (
            <li key={l.key} className="km-checkout__item">
              <Figure seed={l.variantId} plate={l.plate} ratio="portrait" sizes="64px" alt="" />
              <div className="km-checkout__item-body">
                <p className="km-checkout__item-name">{l.name}</p>
                <p className="km-hint">{l.colorName} · Size {l.size}</p>
                <div className="km-checkout__item-row">
                  <QtyStepper qty={l.qty} onChange={(n) => (n <= 0 ? removeLine(l.key) : setQty(l.key, n))} label={l.name} />
                  <span data-numeric>{fmt(l.unitUsd * l.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <dl className="km-checkout__totals" data-numeric>
          <div>
            <dt>Subtotal</dt>
            <dd>{fmt(subtotalUsd)}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{deliveryFee === 0 ? "Free" : fmt(deliveryFee)}</dd>
          </div>
          <div className="km-checkout__grand">
            <dt>Total</dt>
            <dd>{fmt(total)}</dd>
          </div>
        </dl>

        <p className="km-hint km-checkout__alt">
          {currency === "USD" ? formatLbp(total) : formatUsd(total)}
        </p>

        <button type="submit" className="km-btn km-btn--block km-btn--lg" data-loading={status === "submitting"} disabled={status === "submitting"}>
          Place order · {fmt(total)}
        </button>

        <p className="km-note km-note--info km-checkout__exchange">
          <Icon name="exchange" size={18} />
          <span>Exchange in store within {DELIVERY.exchangeWindowDays} days, unworn and with tags on.</span>
        </p>

        <a
          href={whatsapp.checkoutHelp()}
          target="_blank"
          rel="noopener noreferrer"
          className="km-checkout__help"
        >
          <Icon name="whatsapp" size={18} />
          Need help? Message {STORE.phoneDisplay}
        </a>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  optional,
  full,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cx("km-field", full && "km-field--full")}>
      <label className="km-label" htmlFor={`km-${id}`}>
        {label}
        {optional && <span className="km-field__optional"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="km-hint">{hint}</p>}
      {error && (
        <p className="km-error" id={`km-${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
