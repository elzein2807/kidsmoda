import type { PlateShape } from "@/types/catalog";
import { seeded } from "@/lib/utils";

/**
 * PLATE — art-directed vector stand-in for photography.
 *
 * Kids Moda has not supplied final photography yet. Rather than grey boxes or
 * a fake human figure, every image slot renders a graphic fashion composition
 * in the colour world of its section: fabric ribbons, colour fields and a
 * drawn garment. It is honest about being artwork, and it lets the layout,
 * colour and rhythm be judged properly.
 *
 * ── TO REPLACE WITH REAL PHOTOGRAPHY ──────────────────────────────────────
 * Set `src` on the Media record (lib/commerce/seed.ts, or the product_media
 * table). <Figure> then renders next/image and this component is never called.
 * No layout or styling change is required.
 * ──────────────────────────────────────────────────────────────────────────
 */

interface PlateProps {
  shape: PlateShape;
  /** Stable seed so the same product always draws the same plate */
  seed: string;
  className?: string;
}

/* Line-art garments on a 100×130 field, stroked not filled, so they read as
   fashion sketches rather than clipart. */
const GARMENTS: Record<Exclude<PlateShape, "campaign">, string> = {
  dress:
    "M35 24 L28 34 L22 30 L18 44 L30 50 L30 118 Q50 124 70 118 L70 50 L82 44 L78 30 L72 34 L65 24 Q50 32 35 24 Z",
  set: "M32 26 L20 34 L24 48 L32 44 L32 70 Q50 74 68 70 L68 44 L76 48 L80 34 L68 26 Q50 33 32 26 Z M34 78 L34 118 L46 118 L48 92 L52 92 L54 118 L66 118 L66 78 Q50 82 34 78 Z",
  tshirt: "M33 26 L18 36 L24 52 L33 47 L33 96 Q50 101 67 96 L67 47 L76 52 L82 36 L67 26 Q50 34 33 26 Z",
  polo:
    "M33 26 L18 36 L24 52 L33 47 L33 96 Q50 101 67 96 L67 47 L76 52 L82 36 L67 26 L50 38 Z M44 26 L50 38 L56 26 M50 38 L50 56",
  shirt:
    "M33 26 L18 36 L24 52 L33 47 L33 104 Q50 109 67 104 L67 47 L76 52 L82 36 L67 26 L50 36 Z M50 36 L50 104 M42 28 L50 36 L58 28",
  pants: "M32 24 Q50 29 68 24 L70 60 L64 118 L52 118 L50 74 L48 118 L36 118 L30 60 Z",
  jeans:
    "M32 24 Q50 29 68 24 L70 60 L64 118 L52 118 L50 74 L48 118 L36 118 L30 60 Z M32 38 L68 38 M40 24 L40 34",
  shorts: "M31 26 Q50 31 69 26 L71 52 L66 86 L53 86 L50 60 L47 86 L34 86 L29 52 Z",
  skirt: "M32 30 Q50 35 68 30 L80 112 Q50 120 20 112 Z M32 40 Q50 45 68 40",
  hoodie:
    "M32 30 L16 40 L22 58 L32 52 L32 104 Q50 109 68 104 L68 52 L78 58 L84 40 L68 30 Q50 24 32 30 Z M38 28 Q50 18 62 28 Q50 40 38 28 Z M44 56 L44 74 M56 56 L56 74",
  jacket:
    "M32 28 L16 38 L22 58 L32 52 L32 108 Q50 113 68 108 L68 52 L78 58 L84 38 L68 28 L50 40 Z M50 40 L50 108 M36 30 L50 40 L64 30",
  knitwear:
    "M33 28 L17 38 L23 58 L33 52 L33 100 Q50 105 67 100 L67 52 L77 58 L83 38 L67 28 Q50 22 33 28 Z M40 30 Q50 36 60 30 M33 66 Q50 71 67 66 M33 82 Q50 87 67 82",
  pyjamas:
    "M33 24 L20 32 L25 46 L33 42 L33 68 Q50 72 67 68 L67 42 L75 46 L80 32 L67 24 Q50 30 33 24 Z M34 76 L32 118 L45 118 L50 92 L55 118 L68 118 L66 76 Q50 80 34 76 Z",
  swimwear: "M34 30 Q50 24 66 30 L70 54 Q60 82 50 92 Q40 82 30 54 Z M42 30 L42 42 M58 30 L58 42",
  shoes:
    "M18 78 Q22 58 34 58 L44 58 L52 68 Q64 72 76 76 Q84 79 84 88 L84 94 L18 94 Z M18 88 L84 88 M34 62 L44 70",
  accessory: "M26 62 Q50 34 74 62 L74 76 L26 76 Z M26 76 Q50 88 74 76 M50 34 L50 26",
  occasion:
    "M36 24 L28 32 L20 46 L32 52 L30 68 Q50 74 70 68 L68 52 L80 46 L72 32 L64 24 Q50 34 36 24 Z M30 68 L14 118 Q50 128 86 118 L70 68 M30 90 Q50 96 70 90",
};

/** Garment plate — a single piece, presented like a product still. */
export function Plate({ shape, seed, className }: PlateProps) {
  if (shape === "campaign") return <CampaignPlate seed={seed} className={className} />;

  const r = seeded(seed);
  const path = GARMENTS[shape];
  const dx = (r - 0.5) * 5;
  const rot = (seeded(seed + "r") - 0.5) * 3;

  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="130" fill="var(--world-tint)" />

      {/* A saturated colour block behind the garment gives the frame weight */}
      <rect
        x="0"
        y={44 + r * 14}
        width="100"
        height={130 - (44 + r * 14)}
        fill="var(--world)"
        opacity="0.3"
      />

      {/* One fabric ribbon sweeping across */}
      <path
        d={`M-10 ${52 + r * 12} C 26 ${28 + r * 16}, 66 ${74 - r * 14}, 110 ${44 + r * 12}`}
        fill="none"
        stroke="var(--world-2)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.55"
      />

      <g transform={`translate(${dx} 0) rotate(${rot} 50 70)`}>
        <path d={path} fill="var(--km-white)" fillOpacity="0.94" />
        <path
          d={path}
          fill="none"
          stroke="var(--world-ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}

/**
 * CAMPAIGN PLATE — stands in for editorial photography.
 *
 * Deliberately NOT a human silhouette: a vague figure reads as a mannequin and
 * cheapens the page. Instead this is a bright graphic composition — stacked
 * colour fields, an arch portal, and fabric ribbons crossing at several
 * depths — which is what the real photography will sit inside.
 */
export function CampaignPlate({ seed, className }: { seed: string; className?: string }) {
  const r = seeded(seed);
  const r2 = seeded(seed + "b");
  const r3 = seeded(seed + "c");

  // Three compositional archetypes, chosen by seed. A group of plates then
  // reads as a series shot by one photographer, not as the same graphic
  // repeated — which is exactly the difference between art direction and a
  // placeholder pattern.
  const variant = Math.floor(seeded(seed + "v") * 3);
  const uid = seed.replace(/[^a-z0-9]/gi, "");

  const ribbons = (
    <>
      <path
        d={`M-12 ${34 + r * 14} C 26 ${10 + r2 * 16}, 64 ${48 - r * 12}, 112 ${22 + r * 12}`}
        fill="none" stroke="var(--world-3)" strokeWidth="7" strokeLinecap="round" opacity="0.8"
      />
      <path
        d={`M-12 ${44 + r * 14} C 26 ${20 + r2 * 16}, 64 ${58 - r * 12}, 112 ${32 + r * 12}`}
        fill="none" stroke="var(--km-white)" strokeWidth="4" strokeLinecap="round" opacity="0.55"
      />
    </>
  );

  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`kmg-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="var(--world-tint)" />
          <stop offset="100%" stopColor="var(--world)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width="100" height="130" fill={`url(#kmg-${uid})`} />

      {/* ---- A · ARCH PORTAL — a window cut into a deeper colour field ---- */}
      {variant === 0 && (
        <>
          <rect y={92 + r2 * 12} width="100" height="40" fill="var(--world-2)" opacity="0.42" />
          <clipPath id={`kma-${uid}`}>
            <path
              d={`M${26 + r * 22} 118 L${26 + r * 22} ${52 + r3 * 14}
                  A ${(34 + r2 * 14) / 2} ${(34 + r2 * 14) / 2} 0 0 1 ${26 + r * 22 + 34 + r2 * 14} ${52 + r3 * 14}
                  L${26 + r * 22 + 34 + r2 * 14} 118 Z`}
            />
          </clipPath>
          <g clipPath={`url(#kma-${uid})`}>
            <rect width="100" height="130" fill="var(--world)" opacity="0.85" />
            <path
              d={`M-10 ${86 + r * 16} C 24 ${58 + r2 * 18}, 62 ${102 - r * 16}, 110 ${72 + r3 * 12}`}
              fill="none" stroke="var(--km-white)" strokeWidth="9" strokeLinecap="round" opacity="0.5"
            />
          </g>
          {ribbons}
          <circle cx={74 + r2 * 14} cy={26 + r3 * 10} r={7 + r * 4} fill="var(--km-white)" opacity="0.75" />
        </>
      )}

      {/* ---- B · STACKED FIELDS — horizontal colour bands, a folded textile ---- */}
      {variant === 1 && (
        <>
          <rect y={18 + r * 10} width="100" height={26 + r2 * 10} fill="var(--world)" opacity="0.8" />
          <rect y={62 + r3 * 8} width="100" height={18 + r * 8} fill="var(--world-2)" opacity="0.65" />
          <rect y={100 + r2 * 8} width="100" height="30" fill="var(--world-3)" opacity="0.55" />
          <circle cx={22 + r3 * 20} cy={54 + r * 14} r={13 + r2 * 6} fill="var(--km-white)" opacity="0.82" />
          <path
            d={`M-12 ${88 + r * 10} C 30 ${70 + r2 * 12}, 70 ${104 - r3 * 12}, 112 ${84 + r * 10}`}
            fill="none" stroke="var(--km-white)" strokeWidth="5" strokeLinecap="round" opacity="0.6"
          />
        </>
      )}

      {/* ---- C · DRAPED RIBBONS — the fabric itself, close up ---- */}
      {variant === 2 && (
        <>
          <circle cx={62 + r * 18} cy={40 + r2 * 16} r={30 + r3 * 10} fill="var(--world)" opacity="0.72" />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M-14 ${58 + i * 15 + r * 10} C 28 ${34 + i * 15 + r2 * 14}, 70 ${82 + i * 13 - r3 * 12}, 114 ${52 + i * 15 + r * 8}`}
              fill="none"
              stroke={i % 2 === 0 ? "var(--world-3)" : "var(--km-white)"}
              strokeWidth={i % 2 === 0 ? 11 : 6}
              strokeLinecap="round"
              opacity={i % 2 === 0 ? 0.7 : 0.5}
            />
          ))}
          <rect y={116} width="100" height="14" fill="var(--world-2)" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
