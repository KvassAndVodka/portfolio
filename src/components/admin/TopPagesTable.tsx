import Link from "next/link";

interface PageStat { path: string; views: number }

function pageLabel(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  const last = parts.at(-1) || path;
  try {
    return decodeURIComponent(last).replaceAll("-", " ");
  } catch {
    return last; // malformed %-escape from a visitor-supplied path
  }
}

export default function TopPagesTable({ pages }: Readonly<{ pages: PageStat[] }>) {
  return (
    <section aria-labelledby="top-content-heading">
      <h2 id="top-content-heading" className="admin-section-title flex justify-between pb-4">Most read <span className="site-muted font-mono font-normal normal-case tracking-normal">excl. home</span></h2>
      {pages.length > 0 ? (
        <ol className="border-t border-[var(--line)]">
          {pages.map((page, index) => (
            <li key={page.path}>
              <Link href={page.path} target="_blank" aria-label={`${pageLabel(page.path)}, ${page.views} views (opens in a new tab)`} className="grid min-h-12 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--line)] text-sm hover:text-[var(--accent)]">
                <span className="admin-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate font-mono text-[0.8125rem]">{page.path}</span>
                <span className="site-muted font-mono text-[0.8125rem] tabular-nums">{page.views.toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="site-muted border-t border-[var(--line)] py-6 text-sm">No views yet. Views of the home page and admin are left out.</p>
      )}
    </section>
  );
}
