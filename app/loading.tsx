/**
 * Route loading state. A calm ribbon rather than a spinner — it matches the
 * brand and it does not imply an error the way a stalled spinner can.
 */
export default function Loading() {
  return (
    <div className="km-routeloading" role="status" aria-live="polite">
      <span className="km-sr">Loading</span>
      <span className="km-routeloading__bar" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
