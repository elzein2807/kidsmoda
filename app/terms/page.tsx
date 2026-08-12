import type { Metadata } from "next";
import { DELIVERY, SITE, STORE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Prose } from "@/components/editorial/Prose";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms and conditions for shopping with Kids Moda.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div data-world="neutral">
      <PageHeader title="Terms" crumb="Terms" lede="The rules of buying from us, in plain language." />
      <div className="km-shell km-section-tight">
        <Prose>
          <p className="km-hint">Last updated {new Date().getFullYear()}</p>

          <h2>Who we are</h2>
          <p>
            {SITE.name} is a children&apos;s clothing shop at {STORE.street},{" "}
            {STORE.district}, Lebanon. You can reach us on {STORE.phoneDisplay}.
          </p>

          <h2>Orders</h2>
          <p>
            Placing an order is an offer to buy, not a completed sale. We confirm
            every order by phone or WhatsApp before it is dispatched. If a piece has
            sold in the shop between your order and our call, we will tell you and
            either offer an alternative or cancel that line.
          </p>

          <h2>Prices</h2>
          <p>
            Prices are set in US dollars. The Lebanese pound amount shown is
            converted at our current rate, and the rate that applies to your order
            is the one fixed when you place it. We correct obvious pricing errors
            rather than honouring them, and we will always tell you before doing so.
          </p>

          <h2>Payment</h2>
          <p>
            Cash on delivery, in US dollars or Lebanese pounds. Payment is due to
            the driver when the order is handed over.
          </p>

          <h2>Delivery</h2>
          <p>
            We deliver across Lebanon in {DELIVERY.etaDays}. Delivery times are our
            best estimate, not a guarantee — road conditions in Lebanon being what
            they are. If nobody is at the address, the driver will call and we will
            arrange another attempt.
          </p>

          <h2>Exchanges</h2>
          <p>
            {DELIVERY.exchangeWindowDays} days, unworn, with tags, with the receipt.
            The full conditions are on our returns page.
          </p>

          <h2>Photography</h2>
          <p>
            We photograph our own stock. Colours can look slightly different between
            screens. If something arrives and the colour is not what you expected,
            exchange it.
          </p>

          <h2>Content</h2>
          <p>
            The photographs, text and design of this site belong to {SITE.name}.
            Please do not reuse them commercially without asking.
          </p>

          <h2>Law</h2>
          <p>These terms are governed by Lebanese law.</p>
        </Prose>
      </div>
    </div>
  );
}
