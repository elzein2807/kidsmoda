"use client";

import { useEffect } from "react";

/**
 * MOTION ROOT — the site's single scroll-reveal engine.
 *
 * Design decisions:
 * · Content is visible by default. The `km-js` class is only added once this
 *   component mounts, which is what allows CSS to hide un-revealed elements.
 *   No JS, slow device, or crawler → everything is simply visible.
 * · ONE IntersectionObserver for the whole page rather than one per element.
 * · Elements are unobserved after revealing — nothing animates twice, and
 *   nothing re-animates on scroll-up, which is what makes cheap sites feel busy.
 * · Reduced motion still reveals (opacity only, via CSS) so nothing is hidden.
 */
export function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("km-js");

    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    // Anything already on screen at load reveals immediately without waiting
    // for a scroll event — prevents an empty first paint above the fold.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      // Fire slightly before the element reaches the viewport so the motion
      // finishes as it arrives, instead of starting late.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const observeAll = () => {
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => {
        observer.observe(el);
      });
    };

    observeAll();

    // Client-side navigation adds new nodes; pick them up without re-mounting.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net: if the observer never fires (very old browsers, print), make
    // sure nothing stays invisible.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach(reveal);
    }, 4000);

    return () => {
      observer.disconnect();
      mo.disconnect();
      window.clearTimeout(failsafe);
      root.classList.remove("km-js");
    };
  }, []);

  return null;
}
