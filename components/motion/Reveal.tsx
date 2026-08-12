import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/utils";

/**
 * REVEAL — server component. Adds the data attributes MotionRoot watches.
 * Ships zero client JavaScript; the animation itself is pure CSS.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  y = 24,
  className,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Stagger in ms — keep groups under ~400ms total or the page feels slow */
  delay?: number;
  /** Travel distance in px. 0 for a pure fade. */
  y?: number;
  className?: string;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      data-reveal=""
      className={className}
      style={{ "--reveal-delay": `${delay}ms`, "--reveal-y": `${y}px` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * MASK LINE — a line of display type that wipes up from behind its baseline.
 * Each line must be its own element for the mask to read correctly.
 */
export function MaskLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("km-mask-line", className)}>
      <span>{children}</span>
    </span>
  );
}

/** PORTAL — image frame that opens as the photograph settles from over-scale. */
export function Portal({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("km-portal", className)}>{children}</div>;
}
