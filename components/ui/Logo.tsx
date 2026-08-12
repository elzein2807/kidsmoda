import { cx } from "@/lib/utils";

/**
 * THE KIDS MODA WORDMARK.
 *
 * Set in the brand display face rather than shipped as an image, so it stays
 * sharp at every size, inherits colour from its surface, and can be animated.
 * The rainbow arc beneath is the logo's link to the ribbon system — it appears
 * at full size and is dropped in compact placements to keep the header quiet.
 *
 * When the supplied logo artwork is finalised, replace the <span> with an
 * <Image> here and nothing else in the codebase changes.
 */
export function Logo({
  className,
  arc = false,
  label = "Kids Moda — home",
}: {
  className?: string;
  arc?: boolean;
  label?: string;
}) {
  return (
    <span className={cx("km-logo", className)} aria-label={label} role="img">
      <span className="km-logo__word" aria-hidden="true">
        KIDS<em>MODA</em>
      </span>
      {arc && (
        <svg className="km-logo__arc" viewBox="0 0 300 22" aria-hidden="true" focusable="false">
          {["var(--km-coral)", "var(--km-butter)", "var(--km-turquoise)", "var(--km-cobalt)"].map((c, i) => (
            <path
              key={c}
              d={`M4 ${17 - i * 2.4} C 90 ${4 - i * 2.4}, 210 ${4 - i * 2.4}, 296 ${17 - i * 2.4}`}
              stroke={c}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </svg>
      )}
    </span>
  );
}
