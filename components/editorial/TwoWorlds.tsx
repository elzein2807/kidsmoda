import Link from "next/link";
import { AGE_GROUPS } from "@/lib/config";
import type { Gender } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";

/**
 * THE TWO WORLDS — the site's only real fork.
 *
 * Built as a curtain: two full-height panels that respond to the pointer by
 * taking space from each other (CSS flex-grow, GPU-cheap, no JS). Leaning
 * toward one world physically opens it. On mobile the same idea becomes two
 * tall full-width chapters, each with its ages in reach.
 */

const COPY: Record<Gender, string> = {
  girls: "Dresses, sets and knitwear that survive the playground and still look right at dinner.",
  boys: "Polos, denim and hoodies built for the way boys actually wear clothes.",
};

export function TwoWorlds() {
  return (
    <section className="km-worlds" aria-label="Shop by department">
      <span className="km-worlds__seam" aria-hidden="true" />

      {(["girls", "boys"] as Gender[]).map((g) => (
        <div key={g} className="km-worlds__panel" data-world={g}>
          <div className="km-worlds__media" aria-hidden="true">
            <Figure
              seed={`world-${g}`}
              plate="campaign"
              fill
              sizes="50vw"
              alt=""
              className="km-worlds__figure"
            />
          </div>

          <Reveal className="km-worlds__inner" y={28}>
            <h2 className="km-worlds__name">{g === "girls" ? "Girls" : "Boys"}</h2>
            <p className="km-worlds__copy">{COPY[g]}</p>

            <div className="km-worlds__ages">
              {AGE_GROUPS.map((a) => (
                <Link key={a.id} href={`/${g}/${a.id}`} className="km-worlds__age">
                  {a.short}
                </Link>
              ))}
            </div>

            <Link href={`/${g}`} className="km-btn km-btn--inverse">
              Enter {g === "girls" ? "Girls" : "Boys"}
              <Icon name="arrow-right" size={18} />
            </Link>
          </Reveal>
        </div>
      ))}
    </section>
  );
}
