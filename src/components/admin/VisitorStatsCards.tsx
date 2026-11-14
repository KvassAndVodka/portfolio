import Link from "next/link";

type StatsProps = Readonly<{
  views: number;
  visitors: number;
  contactSubmissions: number;
  previousViews: number;
  previousVisitors: number;
  drafts: number;
}>;

/** A percentage on a tiny base shouts (1 → 0 is −100%), so under five the previous count is shown instead. */
export function delta(current: number, previous: number) {
  if (previous < 5) return `was ${previous}`;
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change > 0 ? "+" : ""}${change}% vs prior`;
}

/** The period's numbers as one ruled ticket strip; drafts waiting is the only cell that asks for action. */
export default function VisitorStatsCards(props: StatsProps) {
  const metrics = [
    { label: "Views", value: props.views, note: delta(props.views, props.previousViews) },
    { label: "Visitors", value: props.visitors, note: delta(props.visitors, props.previousVisitors) },
    { label: "Messages", value: props.contactSubmissions, note: "sent" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px border-y border-[var(--line)] bg-[var(--line)] md:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-[var(--background)] px-4 py-6 md:px-6">
          <dt className="admin-label site-muted">{metric.label}</dt>
          <dd className="mt-3 text-[clamp(2rem,3.4vw,2.75rem)] font-[620] leading-none tracking-[-0.035em] tabular-nums">{metric.value.toLocaleString()}</dd>
          <dd className="site-muted mt-3 font-mono text-[0.75rem]">{metric.note}</dd>
        </div>
      ))}
      <div className="bg-[var(--background)] px-4 py-6 md:px-6">
        <dt className="admin-label site-muted">Drafts waiting</dt>
        <dd className={`mt-3 text-[clamp(2rem,3.4vw,2.75rem)] font-[620] leading-none tracking-[-0.035em] tabular-nums ${props.drafts > 0 ? "text-[var(--accent)]" : ""}`}>{props.drafts}</dd>
        <dd className="mt-3 font-mono text-[0.75rem]">
          {props.drafts > 0 ? <Link href="/admin/notes?status=DRAFT" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">Review →</Link> : <span className="site-muted">none</span>}
        </dd>
      </div>
    </dl>
  );
}
