"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SITE } from "@/lib/config";

/**
 * THE OPENING — first-visit cinematic, ~3.2s.
 *
 * Sequence
 *  0.00s  Warm ivory. Two colour fields breathe — ambient, not a loader.
 *  0.35s  Six fabric bands enter from both edges, staggered, easing to rest.
 *  0.90s  KIDS MODA wordmark revealed by a left-to-right clip wipe.
 *  1.60s  The logo's ribbon arc draws on — the colours activate in sequence.
 *  1.90s  "Fashion for Little Moments" rises.
 *  2.40s  THE TRANSFORM: the bands part vertically like a curtain and the
 *         homepage is revealed behind them. The wordmark travels up-left
 *         toward its position in the header rather than fading out — the
 *         intro and the site are physically the same object.
 *
 * Behaviour
 * · First visit only, per session (sessionStorage).
 * · An inline script in layout.tsx sets html[data-intro] BEFORE first paint,
 *   so the homepage never flashes underneath. This component reads that
 *   attribute through useSyncExternalStore — it is external state, and reading
 *   it this way means the very first render is already correct.
 * · Reduced motion → a still logo card for 600ms, then a cross-fade.
 * · Slow device or 2G → the short cut (logo + reveal, ~1.4s).
 * · Skippable with any click, any key, or the visible Skip control.
 */

type Mode = "full" | "short" | "reduced";

const BANDS = [
  { color: "var(--km-coral)", y: 16, from: -1, delay: 0.0, w: 9 },
  { color: "var(--km-tangerine)", y: 27, from: 1, delay: 0.06, w: 7 },
  { color: "var(--km-butter)", y: 38, from: -1, delay: 0.12, w: 11 },
  { color: "var(--km-lime)", y: 58, from: 1, delay: 0.18, w: 8 },
  { color: "var(--km-turquoise)", y: 70, from: -1, delay: 0.24, w: 10 },
  { color: "var(--km-cobalt)", y: 82, from: 1, delay: 0.3, w: 7 },
];

/* The pre-paint script owns this attribute; we only ever read it, and clear it
   once the curtain has finished. */
let listeners: (() => void)[] = [];
const subscribe = (cb: () => void) => {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
};
const getSnapshot = () => document.documentElement.getAttribute("data-intro");
const getServerSnapshot = () => null;
const notify = () => listeners.forEach((l) => l());

export function Opening() {
  const attr = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  const mode = attr as Mode | null;
  const open = Boolean(mode) && !dismissed;

  // Marking the session is a write to an external system, not to state.
  useEffect(() => {
    if (!mode) return;
    try {
      sessionStorage.setItem("km-intro-seen", "1");
    } catch {
      /* private mode — the intro simply plays again next visit */
    }
  }, [mode]);

  const finish = useCallback(() => setDismissed(true), []);

  /** Runs after the exit animation, so the curtain is never cut short. */
  const cleanUp = useCallback(() => {
    document.documentElement.removeAttribute("data-intro");
    notify();
    document.getElementById("km-main")?.focus?.();
  }, []);

  // Any interaction skips. Deliberately generous — nobody should feel trapped.
  useEffect(() => {
    if (!open) return;
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [open, finish]);

  // Hard ceiling — the intro can never hold the page longer than this
  useEffect(() => {
    if (!open || !mode) return;
    const ms = mode === "full" ? 3400 : mode === "short" ? 1600 : 800;
    const t = window.setTimeout(finish, ms);
    return () => window.clearTimeout(t);
  }, [open, mode, finish]);

  if (!mode) return null;

  const full = mode === "full";
  const reduced = mode === "reduced";

  return (
    <AnimatePresence onExitComplete={cleanUp}>
      {open && (
        <motion.div
          className="km-opening"
          role="presentation"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.1, 1] } }}
        >
          {/* Ambient colour fields — the room before the light comes on */}
          {!reduced && (
            <>
              <motion.div
                className="km-opening__field km-opening__field--a"
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.div
                className="km-opening__field km-opening__field--b"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.45, scale: 1 }}
                transition={{ duration: 1.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
            </>
          )}

          {/* The curtain: fabric bands enter, rest, then part vertically */}
          {!reduced && (
            <div className="km-opening__curtain" aria-hidden="true">
              {BANDS.map((b, i) => (
                <motion.span
                  key={b.color}
                  className="km-opening__band"
                  style={{ top: `${b.y}%`, height: `${b.w}%`, background: b.color }}
                  initial={{ x: `${b.from * 110}%`, opacity: 0 }}
                  animate={{
                    x: "0%",
                    opacity: 1,
                    // The part: top three bands lift, bottom three drop
                    y: full ? [0, 0, i < 3 ? "-140%" : "140%"] : 0,
                  }}
                  transition={{
                    x: { duration: 0.9, delay: 0.35 + b.delay, ease: [0.37, 0, 0.15, 1] },
                    opacity: { duration: 0.4, delay: 0.35 + b.delay },
                    y: {
                      duration: 0.9,
                      delay: 2.4 + i * 0.03,
                      times: [0, 0.01, 1],
                      ease: [0.7, 0, 0.84, 0],
                    },
                  }}
                />
              ))}
            </div>
          )}

          {/* Wordmark — wipes in, then travels toward the header */}
          <motion.div
            className="km-opening__mark"
            animate={
              full
                ? { scale: [1, 1, 0.42], y: [0, 0, "-34vh"], x: [0, 0, "-30vw"], opacity: [1, 1, 0] }
                : { opacity: 1 }
            }
            transition={{ duration: 1.0, delay: 2.4, times: [0, 0.02, 1], ease: [0.4, 0, 0.1, 1] }}
          >
            <motion.span
              className="km-opening__word"
              initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
              animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: reduced ? 0.25 : 0.85, delay: reduced ? 0 : 0.9, ease: [0.4, 0, 0.1, 1] }}
            >
              KIDS <em>MODA</em>
            </motion.span>

            {/* The logo's ribbon arc draws on beneath the wordmark */}
            {!reduced && (
              <svg className="km-opening__arc" viewBox="0 0 420 40" aria-hidden="true">
                {["var(--km-coral)", "var(--km-butter)", "var(--km-turquoise)", "var(--km-cobalt)"].map(
                  (c, i) => (
                    <motion.path
                      key={c}
                      d={`M6 ${30 - i * 3} C 120 ${6 - i * 3}, 300 ${6 - i * 3}, 414 ${30 - i * 3}`}
                      stroke={c}
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.7, delay: 1.6 + i * 0.07, ease: [0.37, 0, 0.15, 1] }}
                    />
                  ),
                )}
              </svg>
            )}

            <motion.p
              className="km-opening__tagline"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduced ? 0.1 : 1.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {SITE.tagline}
            </motion.p>
          </motion.div>

          {full && (
            <button type="button" className="km-opening__skip" onClick={finish}>
              Skip
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
