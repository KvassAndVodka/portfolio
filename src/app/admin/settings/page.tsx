import { FaArrowRotateRight } from "react-icons/fa6";
import { revalidateAll } from "@/lib/actions";
import ThemeSettings from "./ThemeSettings";

export default function AdminSettings() {
  return <div className="max-w-4xl space-y-6 pb-16"><header><h1 className="admin-page-title">Settings</h1><p className="mt-2 text-sm admin-muted">Appearance and maintenance controls for this admin session.</p></header><div className="admin-panel divide-y divide-[var(--admin-border)]"><section className="p-5 md:p-6" aria-labelledby="appearance-heading"><h2 id="appearance-heading" className="admin-section-title">Appearance</h2><p className="mt-1 mb-5 text-sm admin-muted">The public site and admin use the same theme preference.</p><ThemeSettings /></section><section className="p-5 md:p-6" aria-labelledby="cache-heading"><h2 id="cache-heading" className="admin-section-title">Refresh public content</h2><p className="mt-1 max-w-xl text-sm admin-muted">Use this when a saved update has not appeared on the public portfolio after its normal cache window.</p><form action={revalidateAll} className="mt-4"><button className="admin-button-secondary"><FaArrowRotateRight aria-hidden="true" />Refresh cached content</button></form></section></div><p className="text-xs admin-muted">Next.js · Prisma · PostgreSQL</p></div>;
}
