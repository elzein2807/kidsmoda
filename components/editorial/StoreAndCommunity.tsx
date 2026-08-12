import Link from "next/link";
import { STORE } from "@/lib/config";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine, Portal } from "@/components/motion/Reveal";
import { whatsapp } from "@/lib/whatsapp";

/**
 * THE KIDS MODA WORLD — the physical shop.
 * Kids Moda is a real boutique before it is a website; this section says so
 * plainly, with the address, the hours and two ways to reach the owner.
 */
export function StoreStory() {
  return (
    <section className="km-section km-shell-wide" data-world="journal" aria-labelledby="km-store-title">
      <div className="km-store">
        <Reveal className="km-store__media">
          <Portal className="km-arch">
            <Figure
              seed="store-front"
              plate="campaign"
              ratio="editorial"
              sizes="(max-width: 1199px) 100vw, 48vw"
              alt="The Kids Moda boutique in Hadath"
            />
          </Portal>
        </Reveal>

        <Reveal className="km-store__body" delay={120}>
          <p className="km-eyebrow">Our store</p>
          <h2 id="km-store-title" className="km-section-type km-head__title">
            <MaskLine>Kids Moda</MaskLine>
            <MaskLine>
              <em className="km-accent-italic">Hadath</em>
            </MaskLine>
          </h2>
          <p className="km-lede" style={{ marginTop: "1rem" }}>
            We started with one rail of clothes and a lot of opinions about how
            children should be dressed. Come in and we will find the size, or
            send us a message and we will hold it for you.
          </p>

          <div className="km-store__meta">
            <p><Icon name="pin" size={16} /> {STORE.street}, {STORE.district}</p>
            {STORE.hours.map((h) => (
              <p key={h.days}><Icon name="check" size={16} /> {h.days} · {h.time}</p>
            ))}
            <p><Icon name="phone" size={16} /> {STORE.phoneDisplay}</p>
          </div>

          <div className="km-store__actions">
            <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="km-btn">
              Get directions
              <Icon name="arrow-up-right" size={18} />
            </a>
            <a
              href={whatsapp.directions()}
              target="_blank"
              rel="noopener noreferrer"
              className="km-btn km-btn--outline"
            >
              <Icon name="whatsapp" size={18} />
              Message the store
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * COMMUNITY — a magazine collage of Instagram content, laid out with varied
 * tile spans rather than a uniform grid so it reads as a page, not a widget.
 * Follower counts are deliberately not hardcoded.
 */
export function Community() {
  const tiles = [
    { seed: "ig-1", label: "In store this week", reel: false },
    { seed: "ig-2", label: "Behind the rail", reel: true },
    { seed: "ig-3", label: "Summer linen", reel: false },
    { seed: "ig-4", label: "First day back", reel: false },
    { seed: "ig-5", label: "New knitwear", reel: true },
    { seed: "ig-6", label: "Saturday in Hadath", reel: false },
    { seed: "ig-7", label: "Fabric close up", reel: false },
  ];

  return (
    <section className="km-section km-shell-wide" data-world="boys" aria-labelledby="km-community-title">
      <div className="km-head">
        <Reveal className="km-head__text">
          <p className="km-eyebrow">Community</p>
          <h2 id="km-community-title" className="km-section-type km-head__title">
            <MaskLine>@{STORE.instagram}</MaskLine>
          </h2>
          <p className="km-head__copy">
            What is in the shop this week, and what our customers are wearing.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <a href={STORE.instagramUrl} target="_blank" rel="noopener noreferrer" className="km-btn km-btn--outline">
            <Icon name="instagram" size={18} />
            Follow on Instagram
          </a>
        </Reveal>
      </div>

      <Reveal delay={80}>
        <div className="km-community">
          {tiles.map((t) => (
            <a
              key={t.seed}
              href={STORE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="km-community__tile"
              aria-label={`${t.label} — open Instagram`}
            >
              <Figure seed={t.seed} plate="campaign" ratio="square" sizes="(max-width: 767px) 50vw, 20vw" alt="" />
              {t.reel && (
                <span className="km-community__badge" aria-hidden="true">
                  <Icon name="play" size={12} />
                </span>
              )}
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/** TRUST — four facts, stated plainly. No badges, no seals, no clip art. */
export function Trust() {
  const items = [
    { icon: "truck" as const, title: "Delivery", copy: "All over Lebanon, 2 – 4 working days." },
    { icon: "cash" as const, title: "Cash on delivery", copy: "Pay the driver when the box arrives." },
    { icon: "exchange" as const, title: "USD & LBP", copy: "Prices in both, pay in either." },
    { icon: "pin" as const, title: "Hadath", copy: "Saint Thérèse, facing Orca Center." },
  ];

  return (
    <section className="km-section-tight km-shell-wide" data-world="neutral" aria-label="Delivery and payment">
      <Reveal>
        <div className="km-trust">
          {items.map((i) => (
            <div key={i.title} className="km-trust__item">
              <Icon name={i.icon} size={26} className="km-trust__icon" />
              <h3 className="km-trust__title">{i.title}</h3>
              <p className="km-trust__copy">{i.copy}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <p className="km-trust__wa">
          Questions about a size or an order?{" "}
          <a href={whatsapp.general()} target="_blank" rel="noopener noreferrer" className="km-link km-link--static">
            Message us on WhatsApp
          </a>{" "}
          — {STORE.phoneDisplay}
        </p>
      </Reveal>
    </section>
  );
}

/** A quiet link band to the store pages, closing the homepage. */
export function StoreLinks() {
  return (
    <div className="km-shell-wide km-section-tight">
      <div className="km-storelinks">
        {[
          { href: "/size-guide", label: "Size guide" },
          { href: "/delivery", label: "Delivery & payment" },
          { href: "/returns", label: "Returns & exchanges" },
          { href: "/faq", label: "Questions" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="km-storelinks__item">
            {l.label}
            <Icon name="arrow-right" size={16} />
          </Link>
        ))}
      </div>
    </div>
  );
}
