import { useEffect, useRef, useState, useCallback } from 'react';

// Respect the user's OS-level motion preference. If they've asked for
// reduced motion, all decorative hooks become no-ops.
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fires once when an element scrolls into view. Apply `.reveal` on an
// element and add `.in-view` when the hook flips, then let CSS do the
// fade/slide. IntersectionObserver is cheap, GPU-friendly, and works on
// every modern browser.
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReduced()) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return [ref, visible];
}

// A pure DOM version for grids — turns every descendant with `.reveal`
// into a lazy in-view target without wrapping each child in React state.
// Set a data-stagger-index to cascade the entrance.
export function useRevealChildren(selector = '.reveal') {
  const rootRef = useRef(null);
  useEffect(() => {
    if (prefersReduced()) {
      rootRef.current?.querySelectorAll(selector).forEach((el) => el.classList.add('in-view'));
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll(selector));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach((el, i) => {
      el.style.setProperty('--stagger', `${Math.min(i, 12) * 60}ms`);
      io.observe(el);
    });
    return () => io.disconnect();
  }, [selector]);
  return rootRef;
}

// Subtle 3D perspective tilt that follows the cursor. Desktop-only; the
// hook bails on touch devices and on reduced-motion users. Values are
// clamped small so the card feels premium, not gimmicky.
export function useTilt(strength = 6) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * strength;
    const ry = (x - 0.5) * strength;
    el.style.setProperty('--tilt-rx', `${rx}deg`);
    el.style.setProperty('--tilt-ry', `${ry}deg`);
  }, [strength]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-rx', '0deg');
    el.style.setProperty('--tilt-ry', '0deg');
  }, []);

  useEffect(() => {
    if (prefersReduced()) return;
    if (typeof window === 'undefined') return;
    // Skip on touch devices — tilt feels wrong on mobile and triggers on tap
    if (window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [onMove, onLeave]);

  return ref;
}

// Magnetic effect — the element shifts a few pixels toward the cursor
// when the cursor is near. Used on hero CTAs to feel "alive".
export function useMagnetic(strength = 0.25) {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReduced()) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.setProperty('--mag-x', `${x * strength}px`);
      el.style.setProperty('--mag-y', `${y * strength}px`);
    };
    const onLeave = () => {
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return ref;
}
