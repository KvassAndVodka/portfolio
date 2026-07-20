interface DailyVisit {
  isoDate: string;
  label: string;
  views: number;
  visitors: number;
}

interface ChartPoint extends DailyVisit {
  x: number;
  viewsY: number;
  visitorsY: number;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 300;
const CHART_TOP = 16;
const CHART_BOTTOM = 32;

function linePath(points: ChartPoint[], key: "viewsY" | "visitorsY") {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point[key]}`)
    .join(" ");
}

export default function AnalyticsChart({ data }: { data: DailyVisit[] }) {
  const maximum = Math.max(...data.flatMap((item) => [item.views, item.visitors]), 1);
  const chartHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
  const points = data.map((item, index) => {
    const x = data.length === 1 ? CHART_WIDTH / 2 : (index / (data.length - 1)) * CHART_WIDTH;
    return {
      ...item,
      x,
      viewsY: CHART_TOP + chartHeight - (item.views / maximum) * chartHeight,
      visitorsY: CHART_TOP + chartHeight - (item.visitors / maximum) * chartHeight,
    };
  });

  return (
    <section className="admin-panel h-full min-w-0 p-5 md:p-6" aria-labelledby="traffic-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="traffic-heading" className="admin-section-title">Traffic over 14 days</h2>
          <p className="mt-1 text-sm admin-muted">Page views and estimated daily visitors.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs admin-muted" aria-hidden="true">
          <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-[var(--accent)]" />Views</span>
          <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-[var(--admin-success)]" />Visitors</span>
        </div>
      </div>

      <div className="mt-6 min-w-0">
        <svg className="block h-auto w-full" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-labelledby="traffic-title traffic-description">
          <title id="traffic-title">Daily portfolio traffic</title>
          <desc id="traffic-description">Line chart comparing daily page views and estimated visitors. Every value is also available below the chart.</desc>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = CHART_TOP + chartHeight - ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1="0"
                x2={CHART_WIDTH}
                y1={y}
                y2={y}
                stroke="var(--admin-border)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <path d={linePath(points, "visitorsY")} fill="none" stroke="var(--admin-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={linePath(points, "viewsY")} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {points.map((point) => (
            <g
              key={point.isoDate}
              tabIndex={0}
              className="traffic-point"
              aria-label={`${point.label}: ${point.views} views, ${point.visitors} estimated visitors`}
            >
              <circle cx={point.x} cy={point.viewsY} r="11" fill="transparent" />
              <circle cx={point.x} cy={point.viewsY} r="4" fill="var(--admin-surface)" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              <circle cx={point.x} cy={point.visitorsY} r="3" fill="var(--admin-surface)" stroke="var(--admin-success)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <title>{point.label}: {point.views} views, {point.visitors} visitors</title>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs admin-muted" aria-hidden="true">
        <span>{data[0]?.label}</span>
        <span>{data.at(-1)?.label}</span>
      </div>

      <details className="mt-4 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium text-[var(--accent-hover)]">View daily values</summary>

        <dl className="mt-2 divide-y divide-[var(--admin-border)] border-y border-[var(--admin-border)] sm:hidden">
          {data.map((item) => (
            <div key={item.isoDate} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-3">
              <dt className="font-medium">{item.label}</dt>
              <dd className="text-right"><strong className="block tabular-nums">{item.views}</strong><span className="text-xs admin-muted">views</span></dd>
              <dd className="text-right"><strong className="block tabular-nums">{item.visitors}</strong><span className="text-xs admin-muted">visitors</span></dd>
            </div>
          ))}
        </dl>

        <div className="mt-2 hidden sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)]">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 text-right font-medium">Views</th>
                <th className="py-2 text-right font-medium">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.isoDate} className="border-b border-[var(--admin-border)]">
                  <td className="py-2">{item.label}</td>
                  <td className="py-2 text-right tabular-nums">{item.views}</td>
                  <td className="py-2 text-right tabular-nums">{item.visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
