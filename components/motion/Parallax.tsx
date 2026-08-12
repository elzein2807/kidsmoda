"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/utils";

/**
 * PARALLAX — restrained editorial drift, not a scroll effect.
 *
 * Movement is capped at ±`distance` px and driven by one rAF-throttled scroll
 * listener writing a single CSS variable, so it composites on the GPU and
 * never triggers layout. Disabled entirely for reduced motion and on coarse
 * pointers, where it costs battery and gains nothing.
 */
export function Parallax({
  children,
  distance = 40,
  className,
}: {
  children: ReactNode;
  /** Max travel in px across the full viewport pass */
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      // -1 (entering from below) → 1 (leaving at the top)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      el.style.setProperty("--km-parallax", String(-progress * distance));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [distance]);

  return (
    <div ref={ref} className={cx("km-parallax", className)}>
      {children}
    </div>
  );
}
