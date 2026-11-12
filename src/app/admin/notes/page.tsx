import Link from "next/link";
import AdminPageHead from "@/components/admin/AdminPageHead";
import NotesManager from "@/components/admin/NotesManager";
import { prisma } from "@/lib/prisma";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";

export default async function AdminNotes({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const filters = await searchParams;
  const notes = isAdminPreviewEnabled() ? [] : await prisma.post.findMany({
    where: { deletedAt: null, OR: [{ type: "BLOG" }, { showAsBlog: true }] },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <>
      <AdminPageHead kicker="Writing" title="Notes" lead="Draft, schedule, and publish writing. Project case studies shared as notes show here too.">
        <Link href="/admin/create?type=BLOG" className="admin-button-primary">New note</Link>
      </AdminPageHead>
      <NotesManager notes={notes} initialStatus={typeof filters.status === "string" ? filters.status : undefined} />
    </>
  );
}
