import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import NotesManager from "@/components/admin/NotesManager";
import { prisma } from "@/lib/prisma";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";

export default async function AdminNotes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = await searchParams;
  const notes = isAdminPreviewEnabled() ? [] : await prisma.post.findMany({
    where: { deletedAt: null, OR: [{ type: "BLOG" }, { showAsBlog: true }] },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="admin-page-title">Notes</h1><p className="mt-2 max-w-2xl text-sm admin-muted">Draft, schedule and publish writing. Project case studies shared as Notes appear here too.</p></div>
        <Link href="/admin/create?type=BLOG" className="admin-button-primary"><FaPlus aria-hidden="true" />New note</Link>
      </header>
      <NotesManager notes={notes} initialStatus={typeof filters.status === "string" ? filters.status : undefined} />
    </div>
  );
}
