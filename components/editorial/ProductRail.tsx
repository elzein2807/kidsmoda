import Link from "next/link";
import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

/**
 * PRODUCT RAIL — used by "New This Week" and "Best Sellers".
 *
 * A native horizontal scroller with snap points rather than a JS carousel:
 * it works with a trackpad, a touch swipe, arrow keys and a screen reader,
 * and it ships no slider library. `ranked` adds the position number that makes
 * Best Sellers read as social proof instead of just another row.
 */
export function ProductRail({
  id,
  eyebrow,
  title,
  copy,
  products,
  href,
  hrefLabel,
  ranked = false,
  world = "neutral",
}: {
  id: string;
  eyebrow: string;
  title: string;
  copy?: string;
  products: Product[];
  href: string;
  hrefLabel: string;
  ranked?: boolean;
  world?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="km-section km-shell-wide" data-world={world} aria-labelledby={id}>
      <div className="km-head">
        <Reveal className="km-head__text">
          <p className="km-eyebrow">{eyebrow}</p>
          <h2 id={id} className="km-section-type km-head__title">
            <MaskLine>{title}</MaskLine>
          </h2>
          {copy && <p className="km-head__copy">{copy}</p>}
        </Reveal>
        <Reveal delay={120}>
          <Link href={href} className="km-btn km-btn--outline">
            {hrefLabel}
            <Icon name="arrow-right" size={18} />
          </Link>
        </Reveal>
      </div>

      <Reveal delay={100}>
        <div className="km-rail" role="list">
          {products.map((p, i) => (
            <div key={p.id} role="listitem" style={{ position: "relative" }}>
              {ranked && (
                <span className="km-rank" aria-hidden="true">
                  {i + 1}
                </span>
              )}
              {ranked && <span className="km-sr">Number {i + 1} bestseller.</span>}
              <ProductCard product={p} sizes="(max-width: 767px) 60vw, 20vw" />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
