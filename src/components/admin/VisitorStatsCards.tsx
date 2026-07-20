import { FaArrowDown, FaArrowUp, FaMinus } from "react-icons/fa6";

interface StatsProps {
  days: number;
  views: number;
  visitors: number;
  contactSubmissions: number;
  viewsChange: number;
  visitorsChange: number;
}

function Change({ value }: { value: number }) {
  const Icon = value > 0 ? FaArrowUp : value < 0 ? FaArrowDown : FaMinus;
  return (
    <span className="inline-flex items-center gap-1 text-xs admin-muted">
      <Icon aria-hidden="true" />
      {Math.abs(value)}% vs previous period
    </span>
  );
}

export default function VisitorStatsCards(props: StatsProps) {
  const metrics = [
    { label: "Page views", value: props.views, change: props.viewsChange },
    { label: "Estimated visitors", value: props.visitors, change: props.visitorsChange },
    { label: "Messages sent", value: props.contactSubmissions, change: null },
  ];

  return (
    <dl className="admin-panel grid divide-y divide-[var(--admin-border)] md:grid-cols-3 md:divide-x md:divide-y-0">
      {metrics.map((metric) => (
        <div key={metric.label} className="px-5 py-4 md:px-6">
          <dt className="text-sm admin-muted">{metric.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-[-0.035em] tabular-nums">
            {metric.value.toLocaleString()}
          </dd>
          <div className="mt-2 min-h-5">
            {metric.change === null ? (
              <span className="text-xs admin-muted">Successful submissions in {props.days} days</span>
            ) : (
              <Change value={metric.change} />
            )}
          </div>
        </div>
      ))}
    </dl>
  );
}
