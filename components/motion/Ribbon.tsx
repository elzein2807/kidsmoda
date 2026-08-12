import { cx } from "@/lib/utils";

/**
 * THE KIDS MODA RIBBON — the brand's one signature element.
 *
 * A flowing textile band derived from the rainbow. It behaves like fabric:
 * bands travel together, overlap, and vary in weight — never a flat clipart
 * arc. Used sparingly (section seams, the opening, category changes) so it
 * stays recognisable.
 */

type RibbonVariant = "seam" | "arc" | "drape";

const PATHS: Record<RibbonVariant, string[]> = {
  // Horizontal section seam — the most common use
  seam: [
    "M0 30 C 220 4, 500 52, 760 22 C 1020 -8, 1240 40, 1440 16",
    "M0 40 C 220 14, 500 62, 760 32 C 1020 2, 1240 50, 1440 26",
    "M0 50 C 220 24, 500 72, 760 42 C 1020 12, 1240 60, 1440 36",
    "M0 60 C 220 34, 500 82, 760 52 C 1020 22, 1240 70, 1440 46",
  ],
  // A rising sweep used behind campaign type
  arc: [
    "M-40 190 C 260 60, 700 30, 1480 96",
    "M-40 206 C 260 76, 700 46, 1480 112",
    "M-40 222 C 260 92, 700 62, 1480 128",
  ],
  // A falling drape used at the base of dark sections
  drape: [
    "M-40 40 C 300 150, 780 120, 1480 30",
    "M-40 58 C 300 168, 780 138, 1480 48",
    "M-40 76 C 300 186, 780 156, 1480 66",
  ],
};

const HEIGHT: Record<RibbonVariant, number> = { seam: 90, arc: 240, drape: 200 };

export function Ribbon({
  variant = "seam",
  colors,
  width = 7,
  opacity = 0.9,
  className,
  animate = false,
}: {
  variant?: RibbonVariant;
  /** Defaults to the section's colour world */
  colors?: string[];
  width?: number;
  opacity?: number;
  className?: string;
  /** Draws the bands on with a stroke-dash sweep when scrolled into view */
  animate?: boolean;
}) {
  const paths = PATHS[variant];
  const palette = colors ?? ["var(--world)", "var(--world-2)", "var(--world-3)", "var(--world)"];

  return (
    <svg
      viewBox={`0 0 1440 ${HEIGHT[variant]}`}
      className={cx("km-ribbon", animate && "km-ribbon--draw", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d, i) => (
        <path
          key={d}
          d={d}
          stroke={palette[i % palette.length]}
          strokeWidth={width}
          opacity={opacity}
          style={{ "--band": i } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}
