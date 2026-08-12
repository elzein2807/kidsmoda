import Link from "next/link";
import type { Product } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal, MaskLine, Portal } from "@/components/motion/Reveal";

/**
 * THE DROPS — Girls and Boys each get a release section, built to different
 * layouts on purpose:
 *
 *   Girls (layout A) — one tall campaign feature on the left, a 2×2 of
 *   products beside it. Vertical, quiet, editorial.
 *
 *   Boys (layout B) — a wide cinematic banner across the top, then a four-up
 *   row beneath. Horizontal, faster, more graphic.
 *
 * Same system, different rhythm, so the page never repeats itself.
 */

export function DropGirls({ products, feature }: { products: Product[]; feature?: Product }) {
  return (
    <section className="km-section km-shell-wide" data-world="girls" aria-labelledby="km-drop-girls">
      <div className="km-head">
        <Reveal className="km-head__text">
          <p className="km-eyebrow">Just landed</p>
          <h2 id="km-drop-girls" className="km-section-type km-head__title">
            <MaskLine>New for her</MaskLine>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <Link href="/girls?category=new-arrivals" className="km-btn km-btn--outline">
            All new in Girls
            <Icon name="arrow-right" size={18} />
          </Link>
        </Reveal>
      </div>

      <div className="km-drop-a">
        {feature && (
          <Reveal className="km-drop-a__feature">
            <Link href={`/product/${feature.slug}`} className="km-feature">
              <Portal>
                <Figure
                  media={feature.media[3]}
                  seed={`drop-girls-${feature.id}`}
                  ratio="tall"
                  sizes="(max-width: 1199px) 100vw, 40vw"
                  alt={`${feature.name} worn by a child`}
                />
              </Portal>
              <div className="km-feature__caption">
                <p className="km-eyebrow" style={{ color: "var(--km-ivory)" }}>The piece</p>
                <h3 className="km-feature__title">{feature.name}</h3>
                <p className="km-feature__copy">{feature.styling}</p>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="km-drop-a__grid">
          {products.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <ProductCard product={p} sizes="(max-width: 767px) 50vw, 22vw" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DropBoys({ products, feature }: { products: Product[]; feature?: Product }) {
  return (
    <section className="km-section km-shell-wide" data-world="boys" aria-labelledby="km-drop-boys">
      <div className="km-head">
        <Reveal className="km-head__text">
          <p className="km-eyebrow">Just landed</p>
          <h2 id="km-drop-boys" className="km-section-type km-head__title">
            <MaskLine>New for him</MaskLine>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <Link href="/boys?category=new-arrivals" className="km-btn km-btn--outline">
            All new in Boys
            <Icon name="arrow-right" size={18} />
          </Link>
        </Reveal>
      </div>

      {feature && (
        <Reveal className="km-drop-b__feature">
          <Link href={`/product/${feature.slug}`} className="km-feature">
            <Portal>
              <Figure
                media={feature.media[3]}
                seed={`drop-boys-${feature.id}`}
                ratio="wide"
                sizes="100vw"
                alt={`${feature.name} worn by a child`}
              />
            </Portal>
            <div className="km-feature__caption">
              <p className="km-eyebrow" style={{ color: "var(--km-ivory)" }}>The piece</p>
              <h3 className="km-feature__title">{feature.name}</h3>
              <p className="km-feature__copy">{feature.styling}</p>
            </div>
          </Link>
        </Reveal>
      )}

      <div className="km-drop-b__grid">
        {products.slice(0, 4).map((p, i) => (
          <Reveal key={p.id} delay={i * 70}>
            <ProductCard product={p} sizes="(max-width: 767px) 50vw, 22vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
