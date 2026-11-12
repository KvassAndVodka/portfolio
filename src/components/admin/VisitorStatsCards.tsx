type StatsProps = Readonly<{
  days: number;
  views: number;
  visitors: number;
  contactSubmissions: number;
  viewsChange: number;
  visitorsChange: number;
}>;

const change = (value: number) => (value > 0 ? `+${value}%` : `${value}%`);

/** The period's three numbers as a ruled ledger: views, visitors, messages. */
export default function VisitorStatsCards(props: StatsProps) {
  const metrics = [
    { label: "Views", value: props.views, note: `${change(props.viewsChange)} vs previous` },
    { label: "Visitors", value: props.visitors, note: `${change(props.visitorsChange)} vs previous` },
    { label: "Messages", value: props.contactSubmissions, note: "sent" },
  ];

  return (
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="admin-section-title pb-4">Last {props.days} days</h2>
      <dl className="grid grid-cols-3 border-y border-[var(--line)]">
        {metrics.map((metric) => (
          <div key={metric.label} className="border-r border-[var(--line)] py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
            <dt className="admin-label site-muted">{metric.label}</dt>
            <dd className="mt-2 text-[1.75rem] font-[620] leading-none tracking-[-0.035em] tabular-nums">{metric.value.toLocaleString()}</dd>
            <dd className="site-muted mt-2 font-mono text-[0.75rem]">{metric.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
