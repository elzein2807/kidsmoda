import { Ribbon } from "@/components/motion/Ribbon";
import { Reveal } from "@/components/motion/Reveal";

/**
 * RIBBON SEAM — the transition between two colour worlds.
 *
 * This is where the "living rainbow" earns its name: the bands draw across as
 * the section enters, physically stitching the previous chapter to the next.
 * Used only at world boundaries so it stays a signature rather than decoration.
 */
export function RibbonSeam({ world = "neutral", flip = false }: { world?: string; flip?: boolean }) {
  return (
    <div
      className="km-seam"
      data-world={world}
      style={flip ? { scale: "-1 1" } : undefined}
      aria-hidden="true"
    >
      <Reveal y={0}>
        <Ribbon variant="seam" width={8} opacity={0.85} animate />
      </Reveal>
    </div>
  );
}
