import Link from "next/link";
import { SITE, STORE } from "@/lib/config";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { Ribbon } from "@/components/motion/Ribbon";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { whatsapp } from "@/lib/whatsapp";

/**
 * FOOTER — the closing chapter, not a link dump.
 * The ribbon seam at the top is the last appearance of the signature element,
 * carrying the rainbow into the charcoal that closes every page.
 */

const SHOP = [
  { label: "Girls", href: "/girls" },
  { label: "Boys", href: "/boys" },
  { label: "New In", href: "/new-in" },
  { label: "Sale", href: "/sale" },
  { label: "Wishlist", href: "/wishlist" },
];

const HELP = [
  { label: "Size Guide", href: "/size-guide" },
  { label: "Delivery", href: "/delivery" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const ABOUT = [
  { label: "Our Store", href: "/our-store" },
  { label: "Track Order", href: "/order" },
];

export function Footer() {
  return (
    <footer className="km-footer" data-surface="inverse" data-world="neutral">
      <div className="km-footer__ribbon" aria-hidden="true">
        <Ribbon
          variant="seam"
          colors={["var(--km-coral)", "var(--km-butter)", "var(--km-turquoise)", "var(--km-lilac)"]}
          width={6}
          opacity={0.95}
        />
      </div>

      <div className="km-footer__inner km-shell-wide">
        <div className="km-footer__top">
          <div className="km-footer__brand">
            <Logo arc />
            <p className="km-footer__tagline">{SITE.tagline}</p>
          </div>

          <div className="km-footer__col">
            <h3>Shop</h3>
            <ul>
              {SHOP.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="km-footer__col">
            <h3>Help</h3>
            <ul>
              {HELP.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="km-footer__col">
            <h3>Kids Moda</h3>
            <ul>
              {ABOUT.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
              <li>
                <a href={STORE.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href={whatsapp.general()} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="km-footer__mid">
          <div className="km-footer__news">
            <h3 className="km-footer__news-title">New arrivals, first.</h3>
            <p>One short email when a new drop lands in Hadath. Nothing else.</p>
            <NewsletterForm />
          </div>

          <div className="km-footer__store">
            <p><strong>{STORE.name}</strong></p>
            <p>{STORE.street}</p>
            <p>{STORE.district}, {STORE.country}</p>
            <p>
              <a href={`tel:+${STORE.whatsapp}`} className="km-link">{STORE.phoneDisplay}</a>
            </p>
            {STORE.hours.map((h) => (
              <p key={h.days}>{h.days} · {h.time}</p>
            ))}
            <p>
              <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="km-link">
                Get directions <Icon name="arrow-up-right" size={14} />
              </a>
            </p>
          </div>
        </div>

        <div className="km-footer__bottom">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <nav className="km-footer__policies" aria-label="Policies">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/returns">Returns</Link>
            <span>Prices in USD &amp; LBP · Cash on Delivery</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
