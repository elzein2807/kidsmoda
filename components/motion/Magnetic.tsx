"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * MAGNETIC — desktop-only pointer attraction for primary calls to action.
 * Subtle by design (default 8px): it should register as quality, not as a toy.
 * Skipped entirely on touch devices and under reduced motion.
 */
export function Magnetic({
  children,
  strength = 8,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const move = (e: PointerEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        el.style.translate = `${x * strength}px ${y * strength}px`;
      });
    };

    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      el.style.translate = "0 0";
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-flex", transition: "translate 400ms cubic-bezier(.2,.7,.2,1)" }}
    >
      {children}
    </span>
  );
}
