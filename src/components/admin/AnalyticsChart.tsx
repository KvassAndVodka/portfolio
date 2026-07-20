interface DailyVisit {
  isoDate: string;
  label: string;
  views: number;
  visitors: number;
}

export default function AnalyticsChart({ data }: { data: DailyVisit[] }) {
  const width = 720;
  const height = 220;
  const max = Math.max(...data.map((item) => item.views), 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - (item.views / max) * (height - 24) - 8;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  return (
    <section className="admin-panel h-full p-5 md:p-6" aria-labelledby="traffic-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="traffic-heading" className="admin-section-title">Traffic over 14 days</h2>
          <p className="mt-1 text-sm admin-muted">Page views and estimated daily visitors.</p>
        </div>
        <div className="flex gap-4 text-xs admin-muted" aria-hidden="true">
          <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-[var(--accent)]" />Views</span>
          <span>Hover or focus the points</span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg className="min-w-[36rem] overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="traffic-title traffic-description">
          <title id="traffic-title">Daily portfolio traffic</title>
          <desc id="traffic-description">A line chart of daily page views. The accessible table below contains every value.</desc>
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <line key={ratio} x1="0" x2={width} y1={height - ratio * (height - 24)} y2={height - ratio * (height - 24)} stroke="var(--admin-border)" strokeWidth="1" />
          ))}
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.isoDate} tabIndex={0} aria-label={`${point.label}: ${point.views} views, ${point.visitors} estimated visitors`}>
              <circle cx={point.x} cy={point.y} r="10" fill="transparent" />
              <circle cx={point.x} cy={point.y} r="4" fill="var(--admin-surface)" stroke="var(--accent)" strokeWidth="3" />
              <title>{point.label}: {point.views} views, {point.visitors} visitors</title>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex justify-between text-xs admin-muted" aria-hidden="true">
        <span>{data[0]?.label}</span>
        <span>{data.at(-1)?.label}</span>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-[var(--accent-hover)]">View traffic as a table</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-[var(--admin-border)]"><th className="py-2">Date</th><th className="py-2 text-right">Views</th><th className="py-2 text-right">Visitors</th></tr></thead>
            <tbody>{data.map((item) => <tr key={item.isoDate} className="border-b border-[var(--admin-border)]"><td className="py-2">{item.label}</td><td className="py-2 text-right tabular-nums">{item.views}</td><td className="py-2 text-right tabular-nums">{item.visitors}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
