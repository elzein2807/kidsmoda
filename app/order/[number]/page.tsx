import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrder } from "@/lib/commerce/orders";
import { formatLbp, formatUsd } from "@/lib/currency";
import { DELIVERY, STORE } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";
import { whatsapp } from "@/lib/whatsapp";
import { OrderSuccessMark } from "@/components/shop/OrderSuccessMark";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const STEPS = [
  { id: "awaiting_confirmation", label: "Order received" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
];

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await getOrder(number);
  if (!order) notFound();

  const fmt = (usd: number) => (order.currency === "USD" ? formatUsd(usd) : formatLbp(usd, order.exchangeRate));
  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.id === order.status));

  return (
    <div className="km-shell km-section" data-world="journal">
      <div className="km-success">
        <OrderSuccessMark />

        <h1 className="km-page-type km-success__title">Thank you, {order.address.fullName.split(" ")[0]}.</h1>
        <p className="km-lede km-success__lede">
          Your order is with us. We will call {order.address.phone} to confirm before it
          goes out.
        </p>

        <p className="km-success__number">
          Order <strong data-numeric>{order.number}</strong>
        </p>

        <div className="km-success__actions">
          <a
            href={whatsapp.orderConfirmation(order.number)}
            target="_blank"
            rel="noopener noreferrer"
            className="km-btn"
          >
            <Icon name="whatsapp" size={18} />
            Confirm on WhatsApp
          </a>
          <Link href="/" className="km-btn km-btn--outline">Keep shopping</Link>
        </div>
      </div>

      {/* Progress — every step is labelled, never colour alone */}
      <ol className="km-track" aria-label="Order progress">
        {STEPS.map((s, i) => (
          <li key={s.id} className="km-track__step" data-state={i < stepIndex ? "done" : i === stepIndex ? "current" : "todo"}>
            <span className="km-track__dot" aria-hidden="true">
              {i < stepIndex ? <Icon name="check" size={13} strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="km-track__label">{s.label}</span>
            {i === stepIndex && <span className="km-sr">(current step)</span>}
          </li>
        ))}
      </ol>

      <div className="km-orderdetail">
        <section>
          <h2 className="km-orderdetail__head">Your items</h2>
          <ul className="km-orderdetail__items">
            {order.items.map((item) => (
              <li key={item.variantId}>
                <span>
                  {item.name} — {item.colorName}, {item.size} × {item.qty}
                </span>
                <span data-numeric>{fmt(item.lineTotalUsd)}</span>
              </li>
            ))}
          </ul>

          <dl className="km-checkout__totals" data-numeric>
            <div><dt>Subtotal</dt><dd>{fmt(order.subtotalUsd)}</dd></div>
            <div><dt>Delivery</dt><dd>{order.deliveryFeeUsd === 0 ? "Free" : fmt(order.deliveryFeeUsd)}</dd></div>
            <div className="km-checkout__grand"><dt>To pay on delivery</dt><dd>{fmt(order.totalUsd)}</dd></div>
          </dl>
        </section>

        <section>
          <h2 className="km-orderdetail__head">Delivery</h2>
          <address className="km-orderdetail__address">
            {order.address.fullName}<br />
            {order.address.address}
            {order.address.building && <>, {order.address.building}</>}
            {order.address.floor && <>, floor {order.address.floor}</>}<br />
            {order.address.city}, {order.address.governorate}<br />
            {order.address.landmark && <>Near {order.address.landmark}<br /></>}
            {order.address.phone}
          </address>
          <p className="km-hint">Expected in {DELIVERY.etaDays}.</p>

          <h2 className="km-orderdetail__head">Questions</h2>
          <p className="km-hint">
            Call or message us on {STORE.phoneDisplay}, or come to the shop in{" "}
            {STORE.district}.
          </p>
        </section>
      </div>
    </div>
  );
}
