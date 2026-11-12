import Image from "next/image";
import Link from "next/link";
import { FaArrowRotateRight } from "react-icons/fa6";
import { auth } from "@/auth";
import SignOutButton from "@/app/admin/SignOutButton";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { revalidateAll } from "@/lib/actions";
import { adminPreviewUser, isAdminPreviewEnabled } from "@/lib/admin-preview";
import ThemeSettings from "./ThemeSettings";

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
  const user = isPreview ? adminPreviewUser : (await auth())?.user;
  return (
    <>
      <AdminPageHead kicker="Account" title="Settings" />
      <Section index={1} title="Signed in as">
        <div className="flex items-center gap-3">
          {user?.image ? <Image src={user.image} alt="" width={40} height={40} className="rounded-full" /> : <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--postcard-orange)] font-semibold text-[var(--postcard-on-orange)]">{user?.name?.charAt(0) || "A"}</span>}
          <div className="min-w-0"><p className="truncate font-semibold">{user?.name || "Administrator"}</p><p className="site-muted truncate text-sm">{user?.email}</p></div>
        </div>
        <div className="mt-5 w-fit"><SignOutButton /></div>
      </Section>
      <Section index={2} title="Appearance">
        <p className="site-muted mb-5 text-sm">The public site and the admin share this theme.</p>
        <ThemeSettings />
      </Section>
      <Section index={3} title="Public content">
        <p className="site-muted text-sm">Use this when a saved change does not show on the public site after its normal cache window.</p>
        <form action={revalidateAll} className="mt-4"><button type="submit" className="admin-button-secondary"><FaArrowRotateRight aria-hidden="true" />Refresh cached content</button></form>
      </Section>
      <Section index={4} title="Deleted items">
        <p className="site-muted text-sm">Deleted projects and notes stay in the trash until you delete them forever.</p>
        <Link href="/admin/trash" className="admin-button-secondary mt-4">Open the trash</Link>
      </Section>
    </>
  );
}
