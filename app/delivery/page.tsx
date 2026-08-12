import type { Metadata } from "next";
import { DELIVERY, GOVERNORATES, STORE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Prose } from "@/components/editorial/Prose";
import { formatUsd } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Delivery & Payment",
  description: "Delivery all over Lebanon, cash on delivery, prices in USD and LBP.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <div data-world="sage">
      <PageHeader
        title="Delivery & payment"
        crumb="Delivery"
        world="journal"
        lede="We deliver everywhere in Lebanon and you pay the driver in cash — in dollars or in pounds, whichever suits you."
      />

      <div className="km-shell km-section-tight">
        <Prose>
          <h2>How long it takes</h2>
          <p>
            Beirut and Mount Lebanon usually arrive in {DELIVERY.etaBeirut}. Everywhere
            else in Lebanon takes {DELIVERY.etaDays}. We call before the driver
            sets off, so keep your phone nearby.
          </p>

          <h2>What it costs</h2>
          <p>
            Delivery is {formatUsd(DELIVERY.feeUsd)} anywhere in Lebanon, and free
            on orders over {formatUsd(DELIVERY.freeThresholdUsd)}.
          </p>

          <h2>Paying</h2>
          <p>
            Cash on delivery. You pay when the box is in your hands, not before.
            The driver carries change in both currencies — tell us at checkout
            which you prefer and we will prepare the total in that currency.
          </p>
          <p>
            Prices are set in US dollars. The Lebanese pound figure shown next to
            every price is calculated from the day&apos;s rate, and the rate applied
            to your order is the one fixed at the moment you place it.
          </p>

          <h2>Where we deliver</h2>
          <ul>
            {GOVERNORATES.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>

          <h2>Collect from the shop</h2>
          <p>
            You can also pick up in {STORE.district} — {STORE.street}. Message us
            on {STORE.phoneDisplay} and we will keep it aside.
          </p>
        </Prose>
      </div>
    </div>
  );
}
