import Link from "next/link";
import type { Gender, Product } from "@/types/catalog";
import { AGE_GROUPS, categoriesFor } from "@/lib/config";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine, Portal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { Ribbon } from "@/components/motion/Ribbon";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductRail } from "@/components/editorial/ProductRail";

/**
 * WORLD LANDING — the campaign face of /girls and /boys.
 *
 * Each world gets its own narrative order, not the homepage's sections in a
 * different colour:
 *
 *   Girls — a stacked, vertical rhythm: tall hero portal, age chapters as
 *   large portals, then the drop.
 *
 *   Boys — a horizontal, banded rhythm: wide hero, an age strip, a category
 *   grid, then the drop.
 */

const HERO: Record<Gender, { line1: string; line2: string; copy: string }> = {
  girls: {
    line1: "Everything she",
    line2: "actually wears.",
    copy:
      "Dresses that survive the playground, knitwear that lasts more than one winter, and sizes from 0 to 14.",
  },
  boys: {
    line1: "Built for",
    line2: "the whole week.",
    copy:
      "Reinforced knees, adjustable waists and pockets that get used. From first steps to fourteen.",
  },
};

export function WorldLanding({
  gender,
  newArrivals,
  bestsellers,
  featured,
  onSale,
}: {
  gender: Gender;
  newArrivals: Product[];
  bestsellers: Product[];
  featured?: Product;
  onSale: Product[];
}) {
  const hero = HERO[gender];
  const label = gender === "girls" ? "Girls" : "Boys";
  const cats = categoriesFor(gender).filter((c) => c.group === "clothing" || c.group === "footwear");
  const isGirls = gender === "girls";

  return (
    <div data-world={gender}>
      {/* ---------------------------------------------------------------
          HERO
          --------------------------------------------------------------- */}
      <section className={`km-worldhero ${isGirls ? "km-worldhero--stacked" : "km-worldhero--banded"}`}>
        <div className="km-worldhero__wash" aria-hidden="true" />

        <div className="km-shell-wide km-worldhero__inner">
          <Reveal className="km-worldhero__text">
            <nav className="km-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{label}</span>
            </nav>
            <h1 className="km-hero-type km-worldhero__title">
              <MaskLine>{hero.line1}</MaskLine>
              <MaskLine>
                <em className="km-accent-italic">{hero.line2}</em>
              </MaskLine>
            </h1>
            <p className="km-lede km-worldhero__copy">{hero.copy}</p>

            <div className="km-ageselect">
              {AGE_GROUPS.map((a) => (
                <Link key={a.id} href={`/${gender}/${a.id}`} className="km-age-chip" data-age={a.id}>
                  {a.label}
                </Link>
              ))}
            </div>
          </Reveal>

          <Parallax distance={28} className="km-worldhero__media">
            <Reveal delay={140} y={0}>
              <Portal className="km-arch">
                <Figure
                  seed={`world-hero-${gender}`}
                  plate="campaign"
                  ratio={isGirls ? "tall" : "editorial"}
                  sizes="(max-width: 1199px) 100vw, 48vw"
                  priority
                  alt={`${label} campaign`}
                />
              </Portal>
            </Reveal>
          </Parallax>
        </div>
      </section>

      <div className="km-seam" aria-hidden="true">
        <Reveal y={0}>
          <Ribbon variant="seam" width={8} opacity={0.9} animate />
        </Reveal>
      </div>

      {/* ---------------------------------------------------------------
          SHOP BY AGE — portals, one per bracket, each in its own colour
          --------------------------------------------------------------- */}
      <section className="km-section km-shell-wide" aria-labelledby={`km-ages-${gender}`}>
        <div className="km-head">
          <Reveal className="km-head__text">
            <p className="km-eyebrow">Shop by age</p>
            <h2 id={`km-ages-${gender}`} className="km-section-type km-head__title">
              <MaskLine>Find their size first</MaskLine>
            </h2>
          </Reveal>
        </div>

        <div className="km-ageportals">
          {AGE_GROUPS.map((a, i) => (
            <Reveal key={a.id} delay={i * 80}>
              <Link href={`/${gender}/${a.id}`} className="km-ageportal" data-age={a.id}>
                <Portal className="km-arch-soft">
                  <Figure
                    seed={`age-${gender}-${a.id}`}
                    plate="campaign"
                    ratio="tall"
                    sizes="(max-width: 767px) 45vw, 22vw"
                    alt=""
                  />
                </Portal>
                <div className="km-ageportal__body">
                  <h3 className="km-ageportal__title">{a.label}</h3>
                  <p className="km-ageportal__sizes">{a.sizes.join(" · ")}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------
          NEW ARRIVALS
          --------------------------------------------------------------- */}
      {newArrivals.length > 0 && (
        <section className="km-section km-shell-wide" aria-labelledby={`km-new-${gender}`}>
          <div className="km-head">
            <Reveal className="km-head__text">
              <p className="km-eyebrow">Just arrived</p>
              <h2 id={`km-new-${gender}`} className="km-section-type km-head__title">
                <MaskLine>New in {label}</MaskLine>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <Link href={`/${gender}?category=new-arrivals`} className="km-btn km-btn--outline">
                See everything new
                <Icon name="arrow-right" size={18} />
              </Link>
            </Reveal>
          </div>

          <div className="km-products">
            {newArrivals.slice(0, 4).map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------
          EDITORIAL CAMPAIGN — a full-bleed break in the rhythm
          --------------------------------------------------------------- */}
      {featured && (
        <section className="km-campaign" aria-labelledby={`km-campaign-${gender}`}>
          <div className="km-campaign__media" aria-hidden="true">
            <Figure seed={`campaign-${gender}`} plate="campaign" fill sizes="100vw" alt="" />
          </div>
          <div className="km-shell-wide km-campaign__inner">
            <Reveal>
              <p className="km-eyebrow km-campaign__eyebrow">The piece</p>
              <h2 id={`km-campaign-${gender}`} className="km-campaign__title">
                <MaskLine>{featured.name}</MaskLine>
              </h2>
              <p className="km-campaign__copy">{featured.description}</p>
              <Link href={`/product/${featured.slug}`} className="km-btn km-btn--inverse">
                See the piece
                <Icon name="arrow-right" size={18} />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------
          SHOP BY CATEGORY
          --------------------------------------------------------------- */}
      <section className="km-section km-shell-wide" aria-labelledby={`km-cats-${gender}`}>
        <div className="km-head">
          <Reveal className="km-head__text">
            <p className="km-eyebrow">Categories</p>
            <h2 id={`km-cats-${gender}`} className="km-section-type km-head__title">
              <MaskLine>Shop by piece</MaskLine>
            </h2>
          </Reveal>
        </div>

        <Reveal>
          <ul className="km-catgrid">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/${gender}?category=${c.slug}`} className="km-catgrid__item">
                  {c.name}
                  <Icon name="arrow-right" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {bestsellers.length > 0 && (
        <ProductRail
          id={`km-best-${gender}`}
          eyebrow="Best sellers"
          title={`What ${label.toLowerCase()} buy most`}
          products={bestsellers}
          href={`/${gender}?sort=bestselling`}
          hrefLabel="Shop best sellers"
          ranked
          world={gender}
        />
      )}

      {onSale.length > 0 && (
        <ProductRail
          id={`km-sale-${gender}`}
          eyebrow="Sale"
          title="Reduced this season"
          products={onSale}
          href={`/${gender}?sale=1`}
          hrefLabel="All sale"
          world="sale"
        />
      )}
    </div>
  );
}
