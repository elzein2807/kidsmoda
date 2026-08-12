import Link from "next/link";
import { AGE_GROUPS } from "@/lib/config";
import type { Gender, PlateShape } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine, Portal } from "@/components/motion/Reveal";

/**
 * WORLD CHAPTER — the Girls and Boys sections on the homepage.
 *
 * Deliberately mirrored rather than duplicated: Girls reads left-aligned with
 * the rail beneath, Boys is set right-aligned with a different category mix
 * and rhythm, so scrolling past both does not feel like the same block twice.
 */

interface ChapterCategory {
  slug: string;
  label: string;
  plate: PlateShape;
}

const CHAPTERS: Record<Gender, { title: string; italic: string; intro: string; cats: ChapterCategory[] }> = {
  girls: {
    title: "Girls",
    italic: "0 to 14",
    intro:
      "Start with her age, then find the piece. Everything is cut to move — gathered tiers, soft waists, nothing that pinches.",
    cats: [
      { slug: "new-arrivals", label: "New Arrivals", plate: "dress" },
      { slug: "dresses", label: "Dresses", plate: "dress" },
      { slug: "sets", label: "Sets", plate: "set" },
      { slug: "t-shirts", label: "Tops", plate: "tshirt" },
      { slug: "skirts", label: "Skirts", plate: "skirt" },
      { slug: "shoes", label: "Shoes", plate: "shoes" },
      { slug: "accessories", label: "Accessories", plate: "accessory" },
    ],
  },
  boys: {
    title: "Boys",
    italic: "0 to 14",
    intro:
      "Reinforced knees, adjustable waists, pockets that get used. Clothes that come back from school in one piece.",
    cats: [
      { slug: "new-arrivals", label: "New Arrivals", plate: "polo" },
      { slug: "sets", label: "Sets", plate: "set" },
      { slug: "tees", label: "T-Shirts", plate: "tshirt" },
      { slug: "shirts", label: "Shirts", plate: "shirt" },
      { slug: "jeans", label: "Jeans", plate: "jeans" },
      { slug: "shoes", label: "Shoes", plate: "shoes" },
      { slug: "accessories", label: "Accessories", plate: "accessory" },
    ],
  },
};

export function WorldChapter({ gender }: { gender: Gender }) {
  const c = CHAPTERS[gender];
  const alignRight = gender === "boys";

  return (
    <section
      className={`km-chapter km-section ${alignRight ? "km-chapter--right" : ""}`}
      data-world={gender}
      aria-labelledby={`km-chapter-${gender}`}
    >
      <div className="km-chapter__wash" aria-hidden="true" />

      <div className="km-shell-wide">
        <div className="km-chapter__head">
          <Reveal className="km-chapter__title-wrap">
            <p className="km-eyebrow">Shop by age</p>
            <h2 id={`km-chapter-${gender}`} className="km-chapter__title km-head__title">
              <MaskLine>
                {c.title} <em className="km-accent-italic">{c.italic}</em>
              </MaskLine>
            </h2>
            <div className="km-chapter__ages">
              {AGE_GROUPS.map((a) => (
                <Link key={a.id} href={`/${gender}/${a.id}`} className="km-age-chip" data-age={a.id}>
                  {a.label}
                  <Icon name="arrow-right" size={15} style={{ marginLeft: 6 }} />
                  <span className="km-sr">, {c.title}</span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal className="km-chapter__intro" delay={120}>
            <p>{c.intro}</p>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <div className="km-rail" role="list" aria-label={`${c.title} categories`}>
            {c.cats.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/${gender}?category=${cat.slug}`}
                className="km-cat"
                role="listitem"
                style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <Portal className="km-arch-soft">
                  <Figure
                    seed={`${gender}-cat-${cat.slug}`}
                    plate={cat.plate}
                    ratio="portrait"
                    sizes="(max-width: 767px) 60vw, 16vw"
                    alt=""
                  />
                </Portal>
                <p className="km-cat__name">{cat.label}</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
