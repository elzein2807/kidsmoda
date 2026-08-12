/**
 * CHARTS — hand-drawn SVG, no charting library.
 *
 * The dashboard needs two shapes: revenue over time and a ranked comparison.
 * Both are a few lines of SVG, which keeps the admin bundle small and means
 * the charts inherit the design tokens instead of fighting a library's theme.
 * Every chart also exposes its numbers as a table to screen readers.
 */

export function LineChart({
  data,
  height = 180,
  label,
}: {
  data: { label: string; value: number }[];
  height?: number;
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100;
  const points = data.map((d, i) => ({
    x: data.length === 1 ? w / 2 : (i / (data.length - 1)) * w,
    y: 100 - (d.value / max) * 88,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const area = `${path} L100 100 L0 100 Z`;
  const allZero = data.every((d) => d.value === 0);

  return (
    <figure className="km-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} aria-hidden="true">
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--km-border)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
        ))}
        {!allZero && (
          <>
            <path d={area} fill="var(--km-cobalt)" opacity="0.1" />
            <path
              d={path}
              fill="none"
              stroke="var(--km-cobalt)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>

      {allZero && <p className="km-chart__empty">No sales recorded in this period yet.</p>}

      <figcaption className="km-sr">
        <table>
          <caption>{label}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>${d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>

      <ul className="km-chart__axis" aria-hidden="true">
        <li>{data[0]?.label}</li>
        <li>{data[data.length - 1]?.label}</li>
      </ul>
    </figure>
  );
}

export function BarList({
  data,
  format = (n: number) => `$${n.toLocaleString("en-US")}`,
}: {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="km-barlist">
      {data.map((d) => (
        <li key={d.label}>
          <span className="km-barlist__label">{d.label.replace(/-/g, " ")}</span>
          <span className="km-barlist__track" aria-hidden="true">
            <span className="km-barlist__fill" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="km-barlist__value" data-numeric>{format(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}
