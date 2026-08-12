"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * ORDER SUCCESS — one confident mark, drawn once.
 * No confetti: a parent who has just committed to paying cash wants
 * reassurance, not celebration.
 */
export function OrderSuccessMark() {
  const reduce = useReducedMotion();

  return (
    <svg className="km-success__mark" viewBox="0 0 80 80" aria-hidden="true">
      <motion.circle
        cx="40"
        cy="40"
        r="34"
        fill="none"
        stroke="var(--km-sage)"
        strokeWidth="2.5"
        initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
        animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M25 41.5 36 52 56 30"
        fill="none"
        stroke="var(--km-sage-ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={reduce ? undefined : { pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
