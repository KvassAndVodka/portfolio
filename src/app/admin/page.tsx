import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FaArrowRight, FaArrowUpRightFromSquare, FaFileCirclePlus, FaFolderOpen } from "react-icons/fa6";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import TopPagesTable from "@/components/admin/TopPagesTable";
import VisitorRegionMap from "@/components/admin/VisitorRegionMap";
import VisitorStatsCards from "@/components/admin/VisitorStatsCards";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";
import { getContentHealth, getDailyVisits, getTopPages, getVisitorRegions, getVisitorStats } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const isPreview = isAdminPreviewEnabled();
  const [posts, stats, dailyVisits, topPages, regions, health] = isPreview
    ? [[], { days: 30, views: 0, visitors: 0, contactSubmissions: 0, viewsChange: 0, visitorsChange: 0 }, [], [], [], { drafts: 0, scheduled: 0, missingImages: 0, missingProjectLinks: 0 }]
    : await Promise.all([
        prisma.post.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 6 }),
        getVisitorStats(30),
        getDailyVisits(14),
        getTopPages(6, 30),
        getVisitorRegions(30),
        getContentHealth(),
      ]);

  const healthItems = [
    { label: "Drafts waiting", value: health.drafts, href: "/admin/notes?status=DRAFT" },
    { label: "Scheduled", value: health.scheduled, href: "/admin/notes?status=SCHEDULED" },
    { label: "Missing thumbnails", value: health.missingImages, href: "/admin/projects?health=thumbnail" },
    { label: "Projects without links", value: health.missingProjectLinks, href: "/admin/projects?health=links" },
  ];

  return (
    <div className="space-y-7 pb-16">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm admin-muted">A 30-day view of what people read and what needs your attention.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/create?type=PROJECT" className="admin-button-secondary"><FaFolderOpen aria-hidden="true" />New project</Link>
          <Link href="/admin/create?type=BLOG" className="admin-button-primary"><FaFileCirclePlus aria-hidden="true" />New note</Link>
          <Link href="/" target="_blank" className="admin-icon-button" aria-label="Open portfolio in a new tab"><FaArrowUpRightFromSquare aria-hidden="true" /></Link>
        </div>
      </header>

      <VisitorStatsCards {...stats} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.75fr)]">
        <AnalyticsChart data={dailyVisits} />
        <TopPagesTable pages={topPages} />
      </div>

      <VisitorRegionMap regions={regions} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <section className="admin-panel" aria-labelledby="recent-content-heading">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
            <div><h2 id="recent-content-heading" className="admin-section-title">Recently edited</h2><p className="mt-1 text-sm admin-muted">Your latest content changes.</p></div>
          </div>
          {posts.length > 0 ? (
            <ul className="divide-y divide-[var(--admin-border)]">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/admin/${post.type === "PROJECT" ? "projects" : "notes"}/${post.slug}`} className="flex min-h-16 items-center gap-4 px-5 py-3 hover:bg-[var(--admin-surface-subtle)] focus-visible:outline-offset-[-2px]">
                    <span className={`admin-status admin-status-${post.status.toLowerCase()}`}>{post.status.toLowerCase()}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{post.title}</p><p className="mt-0.5 text-xs admin-muted">{post.type === "PROJECT" ? "Project" : "Note"} · edited {formatDistanceToNow(post.updatedAt, { addSuffix: true })}</p></div>
                    <FaArrowRight className="admin-muted" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10"><p className="font-medium">Nothing published yet</p><p className="mt-1 text-sm admin-muted">Create a project or start a note to build your portfolio.</p></div>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="content-health-heading">
          <div className="border-b border-[var(--admin-border)] px-5 py-4"><h2 id="content-health-heading" className="admin-section-title">Content health</h2><p className="mt-1 text-sm admin-muted">Items worth reviewing.</p></div>
          <ul className="divide-y divide-[var(--admin-border)]">
            {healthItems.map((item) => (
              <li key={item.label}><Link href={item.href} className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 hover:bg-[var(--admin-surface-subtle)]"><span className="text-sm">{item.label}</span><strong className="tabular-nums">{item.value}</strong></Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
