"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/config";

/**
 * ANNOUNCEMENT BAR — a thin editorial strip, not a banner.
 *
 * Messages cross-fade rather than slide, so nothing competes with the hero.
 * Rotation pauses on hover and stops entirely under reduced motion, where the
 * first message simply stays. Content moves to Admin → Website Content.
 */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || ANNOUNCEMENTS.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 5200);
    return () => window.clearInterval(t);
  }, [paused]);

  return (
    <div
      className="km-announce"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Politely announced so screen readers are not interrupted mid-sentence */}
      <p className="km-announce__text" aria-live="polite" key={index}>
        {ANNOUNCEMENTS[index]}
      </p>
    </div>
  );
}
