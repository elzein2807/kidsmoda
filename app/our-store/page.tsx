import type { Metadata } from "next";
import { STORE, SITE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal, Portal, MaskLine } from "@/components/motion/Reveal";
import { whatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Our Store — Hadath, Beirut",
  description: `Visit Kids Moda in ${STORE.district}, ${STORE.street}. Open Monday to Saturday.`,
  alternates: { canonical: "/our-store" },
};

export default function OurStorePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: STORE.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.street,
      addressLocality: STORE.district,
      addressRegion: STORE.city,
      addressCountry: "LB",
    },
    telephone: `+${STORE.whatsapp}`,
    url: `${SITE.url}/our-store`,
    openingHours: ["Mo-Sa 09:30-19:30"],
  };

  return (
    <div data-world="journal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <PageHeader
        title="Come and see us"
        crumb="Our Store"
        world="journal"
        lede="We are on Saint Thérèse in Hadath, facing Orca Center. Bring the child if you can — sizes are easier in person."
      />

      <div className="km-shell-wide km-section-tight">
        <div className="km-store">
          <Reveal className="km-store__media">
            <Portal className="km-arch">
              <Figure seed="store-inside" plate="campaign" ratio="editorial" sizes="(max-width: 1199px) 100vw, 48vw" alt="Inside the Kids Moda boutique" />
            </Portal>
          </Reveal>

          <Reveal className="km-store__body" delay={120}>
            <h2 className="km-section-type">
              <MaskLine>{STORE.name}</MaskLine>
            </h2>
            <div className="km-store__meta">
              <p><Icon name="pin" size={16} /> {STORE.street}</p>
              <p><Icon name="pin" size={16} /> {STORE.district}, {STORE.country}</p>
              {STORE.hours.map((h) => (
                <p key={h.days}><Icon name="check" size={16} /> {h.days} · {h.time}</p>
              ))}
              <p><Icon name="phone" size={16} /> {STORE.phoneDisplay}</p>
            </div>
            <div className="km-store__actions">
              <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="km-btn">
                Get directions <Icon name="arrow-up-right" size={18} />
              </a>
              <a href={whatsapp.directions()} target="_blank" rel="noopener noreferrer" className="km-btn km-btn--outline">
                <Icon name="whatsapp" size={18} /> Ask us
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <section className="km-shell-wide km-section-tight">
        <Reveal>
          <div className="km-trust">
            {[
              { icon: "ruler" as const, title: "Try before you buy", copy: "Fitting room at the back, and we will swap a size on the spot." },
              { icon: "exchange" as const, title: "Exchanges in store", copy: "Bring the receipt within 7 days, unworn and with tags on." },
              { icon: "bag" as const, title: "We hold pieces", copy: "Message us and we will keep something aside until you get here." },
              { icon: "truck" as const, title: "Or we deliver", copy: "Anywhere in Lebanon, cash on delivery." },
            ].map((i) => (
              <div key={i.title} className="km-trust__item">
                <Icon name={i.icon} size={26} className="km-trust__icon" />
                <h3 className="km-trust__title">{i.title}</h3>
                <p className="km-trust__copy">{i.copy}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
