import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { auth } from "@/auth";
import SignOutButton from "@/app/admin/SignOutButton";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { adminPreviewUser, isAdminPreviewEnabled } from "@/lib/admin-preview";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import RefreshButton from "./RefreshButton";
import ThemeSettings from "./ThemeSettings";

// What's live, one mono row each: the page, and the files machines and recruiters read.
const publicLinks = [
  { label: "Site", path: "/" },
  { label: "Resume", path: "/resume.pdf" },
  { label: "llms.txt", path: "/llms.txt" },
  { label: "Sitemap", path: "/sitemap.xml" },
];
const pad = (value: number) => String(value).padStart(2, "0");

function Section({ index, title, children }: Readonly<{ index: number; title: string; children: React.ReactNode }>) {
  return (
    <section data-reveal className="grid gap-6 border-b border-[var(--line)] py-10 md:grid-cols-[16rem_minmax(0,1fr)]">
      <h2 className="flex gap-4"><span className="admin-index pt-0.5">{String(index).padStart(2, "0")}</span><span className="font-semibold">{title}</span></h2>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

export default async function AdminSettings() {
  const isPreview = isAdminPreviewEnabled();
  const [user, trashed] = await Promise.all([
    isPreview ? adminPreviewUser : auth().then((session) => session?.user),
    prisma.post.count({ where: { deletedAt: { not: null } } }).catch(() => null),
  ]);
  const host = siteConfig.origin.host;

  return (
    <>
      <AdminPageHead kicker="Account" title="Settings" />
      <Section index={1} title="Signed in as">
        <div className="flex items-center gap-4">
          {user?.image ? <Image src={user.image} alt="" width={48} height={48} className="rounded-full" /> : <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--postcard-orange)] text-lg font-[620] text-[var(--postcard-on-orange)]">{user?.name?.charAt(0) || "A"}</span>}
          <div className="min-w-0">
            <p className="truncate text-[1.35rem] font-[620] leading-tight tracking-[-0.03em]">{user?.name || "Administrator"}</p>
            <p className="admin-label site-muted mt-1 truncate">{isPreview ? "Local preview" : user?.email}</p>
          </div>
        </div>
        <div className="mt-6 w-fit"><SignOutButton /></div>
      </Section>
      <Section index={2} title="Appearance">
        <p className="site-muted mb-5 text-sm">The public site and the admin share this theme.</p>
        <ThemeSettings />
      </Section>
      <Section index={3} title="Public site">
        <ul className="settings-links">
          {publicLinks.map((link) => (
            <li key={link.path}>
              <a href={link.path} target="_blank" rel="noreferrer">
                <span className="admin-label site-muted">{link.label}</span>
                <span className="truncate">{host}{link.path === "/" ? "" : link.path}</span>
                <FaArrowUpRightFromSquare aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="site-muted mt-6 text-sm">If a saved change doesn&apos;t show on the public site after its normal cache window, refresh it here.</p>
        <RefreshButton />
      </Section>
      <Section index={4} title="Trash">
        <p className="flex items-baseline gap-3">
          <span className="admin-index !text-[1.75rem] leading-none">{trashed === null ? "--" : pad(trashed)}</span>
          <span className="site-muted text-sm">{trashed === 1 ? "item" : "items"} waiting. Deleted projects and notes stay here until you delete them forever.</span>
        </p>
        <Link href="/admin/trash" className="admin-button-secondary mt-5">Open the trash <FaArrowRight aria-hidden="true" /></Link>
      </Section>
    </>
  );
}
