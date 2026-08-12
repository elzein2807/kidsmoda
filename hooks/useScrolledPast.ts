"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the page has scrolled past a threshold.
 *
 * Uses useSyncExternalStore rather than an effect + setState: scroll position
 * is external state, and reading it this way means the first render is already
 * correct — a refresh halfway down the page does not flash an un-condensed
 * header.
 */
export function useScrolledPast(threshold: number): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      window.addEventListener("resize", onChange, { passive: true });
      return () => {
        window.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
      };
    },
    () => window.scrollY > threshold,
    () => false, // server: always the top of the page
  );
}
