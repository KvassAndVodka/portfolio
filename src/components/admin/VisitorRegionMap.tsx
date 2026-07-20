interface Region {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  views: number;
  visitors: number;
}

function project(latitude: number, longitude: number) {
  const lat = Math.max(-85.0511, Math.min(85.0511, latitude));
  const x = ((longitude + 180) / 360) * 100;
  const radians = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 100;
  return { x, y };
}

export default function VisitorRegionMap({ regions }: { regions: Region[] }) {
  return (
    <section className="admin-panel overflow-hidden" aria-labelledby="regions-heading">
      <div className="border-b border-[var(--admin-border)] p-5 md:px-6">
        <h2 id="regions-heading" className="admin-section-title">Approximate visitor regions</h2>
        <p className="mt-1 text-sm admin-muted">Coarse, aggregated IP regions—not precise visitor locations.</p>
      </div>
      {regions.length > 0 ? (
        <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]">
          <div className="relative aspect-[2/1] min-h-64 overflow-hidden bg-[#d9e4e2] dark:bg-[#222826]">
            {/* The zoom-zero OpenStreetMap tile is a low-request GIS basemap. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://tile.openstreetmap.org/0/0/0.png" alt="" className="absolute inset-0 h-full w-full object-fill opacity-80 saturate-50 dark:brightness-75 dark:invert-[0.08]" />
            {regions.map((region) => {
              const point = project(region.latitude, region.longitude);
              const label = [region.city, region.country].filter(Boolean).join(", ") || "Approximate region";
              return (
                <span
                  key={`${region.latitude}:${region.longitude}`}
                  className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[var(--admin-surface)] bg-[var(--accent)] text-[10px] font-bold text-[var(--accent-ink)]"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  title={`${label}: ${region.visitors} estimated visitors`}
                >
                  {Math.min(region.visitors, 99)}
                </span>
              );
            })}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="absolute bottom-1 right-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-black">© OpenStreetMap</a>
          </div>
          <ol className="divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)] lg:border-l lg:border-t-0">
            {regions.slice(0, 6).map((region) => (
              <li key={`${region.latitude}:${region.longitude}`} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{region.city || "Unknown city"}</p><p className="text-xs admin-muted">{region.country || "Unknown country"}</p></div>
                <span className="text-sm font-semibold tabular-nums">{region.visitors}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="px-5 py-12 md:px-6">
          <p className="font-medium">No approximate regions yet</p>
          <p className="mt-1 max-w-xl text-sm admin-muted">Local and private-network traffic cannot be geolocated. Regions will appear here after public visits are resolved.</p>
        </div>
      )}
    </section>
  );
}
