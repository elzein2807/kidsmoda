import Link from "next/link";
import { SITE } from "@/lib/config";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine, Portal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { Magnetic } from "@/components/motion/Magnetic";
import { Ribbon } from "@/components/motion/Ribbon";

/**
 * HERO — "Little Looks, Big Personality."
 *
 * Composition, not a layout: the headline is set across the full measure and
 * three image portals sit at different depths *between* its lines, so type and
 * photography interlock instead of sitting side by side. A ribbon arc passes
 * behind the type and in front of the rear portal, which is what creates real
 * depth rather than a flat collage.
 *
 * On mobile the same idea is rebuilt rather than scaled: one tall portal, the
 * headline stacked above it, CTAs pinned below within thumb reach.
 */
export function Hero() {
  return (
    <section className="km-hero" data-world="girls" aria-labelledby="km-hero-title">
      {/* Colour fields — the "living rainbow" held right back so type stays legible */}
      <div className="km-hero__wash" aria-hidden="true" />

      <Reveal className="km-hero__ribbon" y={0}>
        <Ribbon variant="arc" width={9} opacity={0.5} animate />
      </Reveal>

      <div className="km-hero__stage km-shell-wide">
        <Reveal className="km-hero__eyebrow-wrap" delay={80} y={12}>
          <p className="km-eyebrow">Kids Moda · Hadath, Beirut</p>
        </Reveal>

        <Reveal className="km-hero__line km-hero__line--1" delay={120}>
          <h1 id="km-hero-title" className="km-hero-type">
            <MaskLine>Little Looks,</MaskLine>
          </h1>
        </Reveal>

        {/* Rear portal — sits behind the second headline line */}
        <Parallax distance={34} className="km-hero__portal km-hero__portal--a">
          <Reveal delay={220} y={0}>
            <Portal className="km-arch">
              <Figure
                seed="hero-a"
                plate="campaign"
                ratio="tall"
                sizes="(max-width: 767px) 78vw, 30vw"
                priority
                alt="A child in a Kids Moda summer look"
              />
            </Portal>
          </Reveal>
        </Parallax>

        <Reveal className="km-hero__line km-hero__line--2" delay={200}>
          <p className="km-hero-type km-hero__line-2-type" aria-hidden="true">
            <MaskLine>
              Big <em className="km-accent-italic">Personality.</em>
            </MaskLine>
          </p>
        </Reveal>

        {/* Foreground portals — smaller, crossing the type */}
        <Parallax distance={-26} className="km-hero__portal km-hero__portal--b">
          <Reveal delay={320} y={0}>
            <Portal className="km-arch-soft">
              <Figure
                seed="hero-b"
                plate="campaign"
                ratio="portrait"
                sizes="(max-width: 767px) 40vw, 20vw"
                alt="Two children walking together"
              />
            </Portal>
          </Reveal>
        </Parallax>

        <Parallax distance={20} className="km-hero__portal km-hero__portal--c">
          <Reveal delay={400} y={0}>
            <Portal className="km-arch-soft">
              <Figure
                seed="hero-c"
                plate="campaign"
                ratio="square"
                sizes="(max-width: 767px) 34vw, 16vw"
                alt="A close detail of woven cotton"
              />
            </Portal>
          </Reveal>
        </Parallax>

        <Reveal className="km-hero__aside" delay={300}>
          <p className="km-hero__tagline">{SITE.tagline}</p>
          <p className="km-hero__copy">
            Boys and girls, 0 to 14. New pieces land every week in Hadath and ship
            across Lebanon.
          </p>

          <div className="km-hero__actions">
            <Magnetic>
              <Link href="/girls" className="km-btn km-btn--lg">
                Explore Girls
                <Icon name="arrow-right" size={18} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/boys" className="km-btn km-btn--outline km-btn--lg">
                Explore Boys
                <Icon name="arrow-right" size={18} />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>

      <Reveal className="km-hero__scroll" delay={700} y={0}>
        <span className="km-hero__scroll-line" aria-hidden="true" />
        <span className="km-hero__scroll-label">Scroll</span>
      </Reveal>
    </section>
  );
}
