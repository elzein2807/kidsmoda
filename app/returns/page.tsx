import type { Metadata } from "next";
import { DELIVERY, STORE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Prose } from "@/components/editorial/Prose";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Exchange within 7 days, unworn and with tags on. Kids Moda, Hadath.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <div data-world="girls">
      <PageHeader
        title="Returns & exchanges"
        crumb="Returns"
        world="girls"
        lede="Children grow between the order and the delivery. We know — so exchanges are simple."
      />

      <div className="km-shell km-section-tight">
        <Prose>
          <h2>Exchanges</h2>
          <p>
            Bring the piece to the shop within {DELIVERY.exchangeWindowDays} days
            with the receipt. It must be unworn, unwashed and with the tags still
            attached. We will swap the size, or exchange it for something else of
            the same value.
          </p>

          <h2>If you cannot come to the shop</h2>
          <p>
            Message us on {STORE.phoneDisplay} and we will arrange for the driver
            to collect it on his next run to your area. Delivery charges are not
            refunded on an exchange.
          </p>

          <h2>Returns</h2>
          <p>
            If something is faulty, tell us straight away and we will replace it or
            refund it in full, including the delivery. For a change of mind we
            offer an exchange or a credit note rather than a cash refund.
          </p>

          <h2>What cannot be exchanged</h2>
          <ul>
            <li>Swimwear and underwear, for hygiene reasons</li>
            <li>Pierced earrings and hair accessories</li>
            <li>Anything worn, washed or without its tags</li>
          </ul>

          <h2>Sale pieces</h2>
          <p>
            Reduced pieces can be exchanged for a different size within{" "}
            {DELIVERY.exchangeWindowDays} days while stock lasts, but cannot be
            refunded.
          </p>
        </Prose>
      </div>
    </div>
  );
}
