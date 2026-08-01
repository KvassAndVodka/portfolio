type AdminRouteLoadingProps = Readonly<{
  label: string;
  items?: number;
  variant?: "list" | "grid";
}>;

export default function AdminRouteLoading({ label, items = 5, variant = "list" }: AdminRouteLoadingProps) {
  return (
    <div className="admin-route-loading space-y-6 pb-16" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading {label}</span>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <div className="admin-skeleton h-9 w-36" />
          <div className="admin-skeleton h-4 w-[min(30rem,82vw)]" />
        </div>
        <div className="admin-skeleton h-11 w-28" />
      </header>
      {variant === "grid" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: items }, (_, index) => (
            <div key={index} className="admin-panel overflow-hidden">
              <div className="admin-subtle aspect-square p-3">
                <div className="admin-skeleton size-full" />
              </div>
              <div className="space-y-2 border-t border-[var(--admin-border)] p-3">
                <div className="admin-skeleton h-3 w-4/5" />
                <div className="flex justify-between gap-3"><div className="admin-skeleton h-3 w-10" /><div className="admin-skeleton h-3 w-8" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="admin-panel overflow-hidden" aria-hidden="true">
          <div className="border-b border-[var(--admin-border)] px-5 py-4">
            <div className="admin-skeleton h-4 w-40" />
          </div>
          <div className="divide-y divide-[var(--admin-border)]">
            {Array.from({ length: items }, (_, index) => (
              <div key={index} className="flex min-h-20 items-center gap-4 px-5 py-4">
                <div className="admin-skeleton size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="admin-skeleton h-4 w-[min(20rem,65%)]" />
                  <div className="admin-skeleton h-3 w-[min(28rem,88%)]" />
                </div>
                <div className="admin-skeleton h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
