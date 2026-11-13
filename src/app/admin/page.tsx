import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import TopPagesTable from "@/components/admin/TopPagesTable";
import VisitorCountryMap from "@/components/admin/VisitorCountryMap";
import VisitorStatsCards from "@/components/admin/VisitorStatsCards";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";
import { getContentHealth, getDailyVisits, getTopPages, getVisitorCountries, getVisitorStats } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

const pad = (n: number) => String(n).padStart(2, "0");
const editPath = (post: { type: string; slug: string }) => `/admin/${post.type === "PROJECT" ? "projects" : "notes"}/${post.slug}`;

/** Greeting and date in the owner's time zone, not the server's. */
function today() {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Manila" }).format(now));
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Manila" }).format(now);
  return { greeting: `Good ${part}`, date };
}

export default async function AdminDashboard() {
  const isPreview = isAdminPreviewEnabled();
  const [posts, drafts, stats, dailyVisits, topPages, countries, health] = isPreview
    ? [[], [], { days: 30, views: 0, visitors: 0, contactSubmissions: 0, viewsChange: 0, visitorsChange: 0 }, [], [], [], { drafts: 0, scheduled: 0, missingImages: 0, missingProjectLinks: 0 }]
    : await Promise.all([
        prisma.post.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 6 }),
        prisma.post.findMany({ where: { deletedAt: null, status: "DRAFT" }, orderBy: { updatedAt: "desc" }, take: 3 }),
        getVisitorStats(30),
        getDailyVisits(14),
        getTopPages(6, 30),
        getVisitorCountries(30),
        getContentHealth(),
      ]);

  const { greeting, date } = today();
  const firstName = siteConfig.name.split(" ")[0];
  const tidy = [
    { label: "Drafts waiting", value: health.drafts, href: "/admin/notes?status=DRAFT" },
    { label: "Scheduled", value: health.scheduled, href: "/admin/notes?status=SCHEDULED" },
    { label: "Missing thumbnails", value: health.missingImages, href: "/admin/projects?health=thumbnail" },
    { label: "Projects without links", value: health.missingProjectLinks, href: "/admin/projects?health=links" },
  ];
  const lead =
    health.drafts > 0
      ? `${health.drafts === 1 ? "One draft is" : `${health.drafts} drafts are`} waiting for review. Read them through, then publish what is ready.`
      : "Nothing is waiting for review. Start a note when you have something worth sharing.";

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-10 pt-12 md:flex-row md:items-end md:justify-between md:pt-16">
        <div data-reveal>
          <p className="admin-label text-[var(--accent)]">Desk · {date}</p>
          <h1 className="admin-page-title mt-4">{greeting}, {firstName}</h1>
          <p className="site-muted mt-5 max-w-[40rem] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.7]">{lead}</p>
        </div>
        <div data-reveal className="flex flex-wrap gap-2">
          <Link href="/admin/create?type=BLOG" className="admin-button-primary">New note</Link>
          <Link href="/admin/create?type=PROJECT" className="admin-button-secondary">New project</Link>
          <Link href="/" target="_blank" className="admin-button-secondary">View site<FaArrowUpRightFromSquare aria-hidden="true" className="text-[0.75em]" /></Link>
        </div>
      </header>

      <div className="grid gap-x-16 gap-y-14 py-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-14">
          {drafts.length > 0 && (
            <section aria-labelledby="waiting-heading">
              <h2 id="waiting-heading" className="admin-section-title flex gap-2 pb-4">Waiting for review <span className="text-[var(--accent)]">{pad(health.drafts)}</span></h2>
              <ul className="space-y-4">
                {drafts.map((draft) => (
                  <li key={draft.id} data-reveal className="admin-panel p-6">
                    <p className="admin-label site-muted">{draft.type === "PROJECT" ? "Project" : draft.category || "Note"} · edited {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}</p>
                    <Link href={editPath(draft)} className="mt-3 block text-[clamp(1.45rem,2.4vw,2.1rem)] font-[620] leading-[1.05] tracking-[-0.03em] hover:text-[var(--accent)]">{draft.title}</Link>
                    {draft.summary && <p className="site-muted mt-3 line-clamp-3 leading-[1.7]">{draft.summary}</p>}
                    <Link href={editPath(draft)} className="admin-button-primary mt-5">Review and edit</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="admin-section-title pb-4">Recently edited</h2>
            {posts.length > 0 ? (
              <ol className="border-t border-[var(--line)]">
                {posts.map((post, index) => (
                  <li key={post.id} data-reveal className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-[var(--line)] py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]">
                    <span className="admin-index pt-0.5">{pad(index + 1)}</span>
                    <Link href={editPath(post)} className="font-semibold hover:text-[var(--accent)]">{post.title}</Link>
                    <span className={`admin-status admin-status-${post.status.toLowerCase()} col-start-2 sm:col-start-auto sm:justify-end`}>
                      {post.status.toLowerCase()} · {formatDistanceToNow(post.updatedAt, { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="site-muted border-t border-[var(--line)] py-8">Nothing here yet. Create a project or start a note.</p>
            )}
          </section>
        </div>

        <aside className="space-y-14">
          <VisitorStatsCards {...stats} />
          <TopPagesTable pages={topPages} />
          <section aria-labelledby="tidy-heading">
            <h2 id="tidy-heading" className="admin-section-title pb-4">To tidy</h2>
            <ul className="border-t border-[var(--line)] text-sm">
              {tidy.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--line)] hover:text-[var(--accent)]">
                    <span>{item.label}</span>
                    <span className={`admin-index ${item.value === 0 ? "!text-[var(--muted)]" : ""}`}>{pad(item.value)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="space-y-12 border-t border-[var(--line)] pt-12">
        <AnalyticsChart data={dailyVisits} />
        <VisitorCountryMap countries={countries} />
      </div>
    </>
  );
}
