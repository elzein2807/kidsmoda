import type { Metadata } from "next";
import { DELIVERY, STORE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Faq } from "@/components/editorial/Prose";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Questions",
  description: "Common questions about sizes, delivery, payment and exchanges at Kids Moda.",
  alternates: { canonical: "/faq" },
};

const ITEMS = [
  { q: "How do I know which size to order?", a: "Measure their height rather than going by age — our size guide lists the height range for every size. If they are between two sizes, take the larger one. You can also send us the height on WhatsApp and we will tell you." },
  { q: "How do I pay?", a: `Cash on delivery. You pay the driver when the order arrives, in US dollars or Lebanese pounds. No card is needed and no payment is taken in advance.` },
  { q: "How long does delivery take?", a: `${DELIVERY.etaBeirut} in Beirut and Mount Lebanon, ${DELIVERY.etaDays} everywhere else in Lebanon.` },
  { q: "Do you deliver outside Lebanon?", a: "Not at the moment. Everything ships within Lebanon only." },
  { q: "Can I exchange something?", a: `Yes, within ${DELIVERY.exchangeWindowDays} days, unworn and with tags on. Bring it to the shop in ${STORE.district} with the receipt, or message us and the driver can collect it.` },
  { q: "Can you hold a piece for me?", a: `Message us on ${STORE.phoneDisplay} and we will keep it aside for a couple of days.` },
  { q: "Do I need an account to order?", a: "No. Checkout is guest only — your name, phone number and address is all we need." },
  { q: "Is the website stock the same as the shop?", a: "Yes. Both sell from the same inventory, so if a size shows here it is on the rail in Hadath." },
  { q: "Can I order on WhatsApp instead?", a: `Of course. Send us what you want on ${STORE.phoneDisplay} and we will take it from there — it is how most of our regulars order.` },
];

export default function FaqPage() {
  return (
    <div data-world="journal">
      <PageHeader
        title="Questions"
        crumb="FAQ"
        world="journal"
        lede="The things people ask us most. If yours is not here, message us."
      />
      <div className="km-shell km-section-tight">
        <Reveal>
          <Faq items={ITEMS} />
        </Reveal>
      </div>
    </div>
  );
}
