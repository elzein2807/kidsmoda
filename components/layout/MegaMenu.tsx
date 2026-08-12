"use client";

import Link from "next/link";
import { AGE_GROUPS, categoriesFor } from "@/lib/config";
import type { Gender } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";

/**
 * MEGA MENU — a campaign page in miniature, not a list of links.
 *
 * Four bands: age (the primary way parents shop), categories, a featured
 * chapter, and one editorial image that carries the world's colour. Age comes
 * first because a parent almost always knows the age before the garment.
 */

const FEATURED: Record<Gender, { title: string; copy: string; href: string }> = {
  girls: {
    title: "Summer Linen",
    copy: "Washed linen sets and tiered dresses, cut wide for hot afternoons.",
    href: "/girls?category=sets",
  },
  boys: {
    title: "Everyday Uniform",
    copy: "Piqué polos, cargo shorts and denim built to survive the whole week.",
    href: "/boys?category=polos",
  },
};

export function MegaMenu({ gender, onNavigate }: { gender: Gender; onNavigate: () => void }) {
  const cats = categoriesFor(gender).filter((c) => c.group === "clothing" || c.group === "footwear");
  const featured = FEATURED[gender];
  const label = gender === "girls" ? "Girls" : "Boys";

  return (
    <div className="km-mega" data-world={gender}>
      <div className="km-mega__inner km-shell-wide">
        <div className="km-mega__col km-mega__col--age">
          <p className="km-eyebrow">Shop by age</p>
          <ul className="km-mega__ages">
            {AGE_GROUPS.map((age) => (
              <li key={age.id}>
                <Link href={`/${gender}/${age.id}`} onClick={onNavigate} className="km-mega__age">
                  <span className="km-mega__age-label">{age.label}</span>
                  <Icon name="arrow-right" size={18} className="km-mega__age-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="km-mega__col km-mega__col--cats">
          <p className="km-eyebrow">Categories</p>
          <ul className="km-mega__cats">
            <li>
              <Link href={`/${gender}?category=new-arrivals`} onClick={onNavigate} className="km-mega__cat km-mega__cat--strong">
                New Arrivals
              </Link>
            </li>
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/${gender}?category=${c.slug}`} onClick={onNavigate} className="km-mega__cat">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${gender}?sale=1`} onClick={onNavigate} className="km-mega__cat km-mega__cat--sale">
                Sale
              </Link>
            </li>
          </ul>
        </div>

        <div className="km-mega__col km-mega__col--feature">
          <Link href={featured.href} onClick={onNavigate} className="km-mega__feature">
            <Figure
              seed={`mega-${gender}`}
              plate="campaign"
              ratio="editorial"
              className="km-arch-soft"
              sizes="(max-width: 1199px) 0px, 28vw"
              alt=""
            />
            <div className="km-mega__feature-body">
              <p className="km-eyebrow">Featured</p>
              <h3 className="km-mega__feature-title">{featured.title}</h3>
              <p className="km-mega__feature-copy">{featured.copy}</p>
              <span className="km-link km-link--static">Shop the chapter</span>
            </div>
          </Link>

          <Link href={`/${gender}`} onClick={onNavigate} className="km-btn km-btn--outline km-btn--sm km-mega__all">
            All {label}
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
