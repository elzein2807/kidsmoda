import type { Metadata } from "next";
import { STORE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { whatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact Kids Moda — WhatsApp ${STORE.phoneDisplay}, or visit us in ${STORE.district}, Beirut.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const routes = [
    { icon: "whatsapp" as const, title: "WhatsApp", copy: "The fastest way to reach us. Sizes, stock, orders — anything.", action: whatsapp.general(), label: STORE.phoneDisplay, external: true },
    { icon: "phone" as const, title: "Call the shop", copy: "Monday to Saturday, 9:30 to 19:30.", action: `tel:+${STORE.whatsapp}`, label: STORE.phoneDisplay, external: false },
    { icon: "pin" as const, title: "Come in", copy: `${STORE.street}, ${STORE.district}.`, action: STORE.mapsUrl, label: "Get directions", external: true },
    { icon: "instagram" as const, title: "Instagram", copy: "New arrivals and what is in the shop this week.", action: STORE.instagramUrl, label: `@${STORE.instagram}`, external: true },
  ];

  return (
    <div data-world="boys">
      <PageHeader
        title="Talk to us"
        crumb="Contact"
        world="boys"
        lede="A real shop with real people in it. Message us and you will get an answer, usually within the hour."
      />

      <div className="km-shell km-section-tight">
        <Reveal>
          <div className="km-contact">
            {routes.map((r) => (
              <a
                key={r.title}
                href={r.action}
                className="km-contact__card"
                {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon name={r.icon} size={26} className="km-contact__icon" />
                <h2 className="km-contact__title">{r.title}</h2>
                <p className="km-contact__copy">{r.copy}</p>
                <span className="km-link km-link--static">{r.label}</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
