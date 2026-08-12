import Image from "next/image";
import type { Media, PlateShape } from "@/types/catalog";
import { Plate } from "@/components/ui/Plate";
import { cx } from "@/lib/utils";

/**
 * FIGURE — the single image primitive for the whole site.
 *
 * Renders next/image when real photography exists, and the vector Plate when
 * it does not. Because every image slot goes through here, uploading real
 * KIDS MODA photography is a data change, never a code change.
 *
 * Ratios come from the token set — arbitrary aspect ratios are not permitted.
 */

export type FigureRatio = "portrait" | "tall" | "hero" | "heroMobile" | "square" | "wide" | "editorial";

const RATIO: Record<FigureRatio, string> = {
  portrait: "3 / 4",
  tall: "2 / 3",
  hero: "16 / 9",
  heroMobile: "4 / 5",
  square: "1 / 1",
  wide: "21 / 9",
  editorial: "5 / 4",
};

interface FigureProps {
  media?: Media | null;
  /** Used when there is no Media record (editorial slots) */
  plate?: PlateShape;
  seed: string;
  alt?: string;
  ratio?: FigureRatio;
  className?: string;
  /** Responsive sizes hint — always pass one, it drives which file is fetched */
  sizes?: string;
  priority?: boolean;
  /** Hover zoom on product cards */
  zoom?: boolean;
  /**
   * Fill the parent instead of holding a ratio. Used for full-bleed section
   * backgrounds, where the container decides the shape, not the image.
   */
  fill?: boolean;
}

export function Figure({
  media,
  plate,
  seed,
  alt,
  ratio = "portrait",
  className,
  sizes = "(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw",
  priority = false,
  zoom = false,
  fill = false,
}: FigureProps) {
  const shape: PlateShape = media?.plate ?? plate ?? "campaign";
  const label = alt ?? media?.alt ?? "";

  return (
    <div
      className={cx("km-figure", zoom && "km-figure--zoom", fill && "km-figure--fill", className)}
      style={fill ? undefined : { aspectRatio: RATIO[ratio] }}
    >
      {media?.src ? (
        <Image
          src={media.src}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          className="km-figure__img"
        />
      ) : (
        // Decorative fallback: the accessible name lives on the link or
        // heading beside it, so the plate itself is aria-hidden.
        <Plate shape={shape} seed={seed} className="km-figure__plate" />
      )}
    </div>
  );
}
