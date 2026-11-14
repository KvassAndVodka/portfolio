import DotsReveal from "@/components/admin/DotsReveal";
import { monotoneAt, monotoneSlopes } from "@/lib/monotone";

interface DailyVisit {
  isoDate: string;
  label: string;
  views: number;
  visitors: number;
}

type Series = "views" | "visitors";

const W = 960;
const H = 300;
const LEFT = 48;
const RIGHT = 16;
const TOP = 34;
const BOTTOM = 40;
const STEP = 9;
const BASE = H - BOTTOM;
const SPAN = W - LEFT - RIGHT;

/** Daily traffic as a halftone elevation profile: dots fill the area under the views ridge; visitors run as a dashed line on the same count scale. */
export default function AnalyticsChart({ data }: Readonly<{ data: DailyVisit[] }>) {
  const max = Math.max(...data.map((d) => d.views), 1);
  const empty = data.every((d) => d.views === 0);
  const peak = data.findIndex((d) => d.views === max);
  const last = data.length - 1;
  const x = (i: number) => (last > 0 ? LEFT + (i * SPAN) / last : LEFT + SPAN / 2);
  // One monotone curve per series: through every day's value, with no bumps or dips the data doesn't have.
  // The ridge and the dots under it read from the same curve.
  const curves = {
    views: { values: data.map((d) => d.views), slopes: monotoneSlopes(data.map((d) => d.views)) },
    visitors: { values: data.map((d) => d.visitors), slopes: monotoneSlopes(data.map((d) => d.visitors)) },
  };
  const y = (value: number) => BASE - (Math.max(0, value) / max) * (BASE - TOP);
  const at = (px: number, key: Series) => y(monotoneAt(curves[key].values, curves[key].slopes, last < 1 ? 0 : ((px - LEFT) / SPAN) * last));
  // Drawn as true cubic Béziers between the days, so the line has no corners.
  const ridge = (key: Series) => {
    const { values, slopes } = curves[key];
    if (last < 1) return `M${LEFT},${y(values[0] ?? 0)}H${W - RIGHT}`;
    const third = 1 / 3;
    return values.reduce((path, value, i) => {
      if (i === 0) return `M${x(0).toFixed(1)},${y(value).toFixed(1)}`;
      const c1 = `${(x(i - 1) + (x(i) - x(i - 1)) * third).toFixed(1)},${y(values[i - 1] + slopes[i - 1] * third).toFixed(1)}`;
      const c2 = `${(x(i) - (x(i) - x(i - 1)) * third).toFixed(1)},${y(value - slopes[i] * third).toFixed(1)}`;
      return `${path}C${c1} ${c2} ${x(i).toFixed(1)},${y(value).toFixed(1)}`;
    }, "");
  };

  const dots: { cx: number; cy: number; r: number }[] = [];
  for (let cx = LEFT + STEP / 2; cx < W - RIGHT; cx += STEP) {
    const top = at(cx, "views");
    for (let cy = BASE - STEP / 2; cy > top; cy -= STEP) {
      const height = (BASE - cy) / (BASE - TOP); // 0 at the baseline, 1 at the highest peak
      dots.push({ cx, cy, r: 0.8 + height * 3.2 });
    }
  }
  // A round step for the scale bar, about a fifth of the peak.
  const scale = Math.max(1, Math.round(max / 5 / (max >= 50 ? 10 : 1)) * (max >= 50 ? 10 : 1));
  const scaleTop = BASE - (scale / max) * (BASE - TOP);

  return (
    <section className="admin-panel h-full min-w-0 p-5 md:p-6" aria-labelledby="traffic-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="traffic-heading" className="admin-section-title">Traffic</h2>
        <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] admin-muted" aria-hidden="true">
          <span className="flex items-center gap-1.5"><svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="var(--line-strong)" /></svg>views</span>
          <span className="flex items-center gap-1.5"><svg width="18" height="10"><path d="M0 5h18" stroke="var(--foreground)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>visitors</span>
          <span className="flex items-center gap-1.5"><svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="var(--postcard-orange)" /></svg>today</span>
        </p>
      </div>

      <DotsReveal className="mt-6 min-w-0">
        <svg className="traffic-chart block h-auto w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="traffic-title traffic-description">
          <title id="traffic-title">Daily portfolio traffic</title>
          <desc id="traffic-description">Halftone elevation profile of daily page views over the last {data.length} days, with estimated visitors as a dashed line. Every value is also available below the chart.</desc>
          {dots.map((d) => <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r={d.r} fill="var(--line-strong)" />)}
          {empty ? (
            <>
              {Array.from({ length: Math.floor(SPAN / STEP) }, (_, k) => <circle key={k} cx={LEFT + STEP / 2 + k * STEP} cy={BASE - STEP / 2} r="0.9" fill="var(--line-strong)" />)}
              <text x={LEFT + SPAN / 2} y={BASE - 70} textAnchor="middle" className="chart-text fill-[var(--muted)] font-mono text-[13px]">No views in the last 14 days</text>
            </>
          ) : (
            <>
              <path d={ridge("views")} fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d={ridge("visitors")} fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="5 4" />
            </>
          )}
          <line x1={LEFT} x2={W - RIGHT} y1={BASE} y2={BASE} stroke="var(--foreground)" strokeWidth="1.5" />
          {data.map((d, i) => (
            <g key={d.isoDate} tabIndex={0} className="traffic-point" aria-label={`${d.label}: ${d.views} views, ${d.visitors} estimated visitors`}>
              <rect x={x(i) - SPAN / Math.max(last, 1) / 2} y={TOP} width={SPAN / Math.max(last, 1)} height={BASE - TOP} fill="transparent" />
              <line x1={x(i)} x2={x(i)} y1={BASE} y2={BASE + 6} stroke="var(--foreground)" />
              {(last - i) % 7 === 0 && <text x={x(i)} y={BASE + 22} textAnchor="middle" className="chart-text fill-[var(--muted)] font-mono text-[11px]">{d.label}</text>}
              <title>{`${d.label}: ${d.views} views, ${d.visitors} visitors`}</title>
            </g>
          ))}
          {!empty && (
            <>
              <circle cx={x(last)} cy={at(x(last) - 0.01, "views")} r="5" fill="var(--postcard-orange)" stroke="var(--background)" strokeWidth="2" />
              <g transform={`translate(${x(peak)},${at(x(peak), "views") - 12})`}>
                <path d="M-6 0L0 -10L6 0Z" fill="var(--foreground)" />
                <text x="10" y="-1" className="chart-text fill-[var(--foreground)] font-mono text-[12px] font-semibold">{max} · {data[peak].label}</text>
              </g>
            </>
          )}
          <g className="font-mono text-[11px]" visibility={empty ? "hidden" : undefined}>
            <line x1={LEFT - 22} x2={LEFT - 22} y1={BASE} y2={scaleTop} stroke="var(--foreground)" strokeWidth="1.5" />
            <text x={LEFT - 26} y={scaleTop - 8} className="chart-text fill-[var(--muted)]">{scale} views</text>
          </g>
        </svg>
      </DotsReveal>

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
