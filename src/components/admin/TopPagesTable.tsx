import Link from "next/link";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

interface PageStat { path: string; views: number }

function pageLabel(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  return decodeURIComponent(parts.at(-1) || path).replaceAll("-", " ");
}

export default function TopPagesTable({ pages }: { pages: PageStat[] }) {
  return (
    <section className="admin-panel h-full p-5 md:p-6" aria-labelledby="top-content-heading">
      <h2 id="top-content-heading" className="admin-section-title">Most viewed content</h2>
      <p className="mt-1 text-sm admin-muted">Public projects and notes from the last 30 days.</p>
      {pages.length > 0 ? (
        <ol className="mt-5 divide-y divide-[var(--admin-border)]">
          {pages.map((page, index) => (
            <li key={page.path} className="flex min-h-14 items-center gap-3 py-2">
              <span className="w-5 text-xs tabular-nums admin-muted">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium capitalize">{pageLabel(page.path)}</p>
                <p className="truncate text-xs admin-muted">{page.path}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{page.views}</span>
              <Link href={page.path} target="_blank" className="admin-icon-button" aria-label={`Open ${pageLabel(page.path)} in a new tab`}>
                <FaArrowUpRightFromSquare aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5 border-t border-[var(--admin-border)] py-8">
          <p className="font-medium">No content views yet</p>
          <p className="mt-1 text-sm admin-muted">Views of the homepage and admin routes are intentionally excluded.</p>
        </div>
      )}
    </section>
  );
}
