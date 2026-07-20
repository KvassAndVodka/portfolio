import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import SortableProjectList from "@/components/admin/SortableProjectList";
import { prisma } from "@/lib/prisma";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";

export default async function AdminProjects({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = await searchParams;
  const projects = isAdminPreviewEnabled() ? [] : await prisma.post.findMany({
    where: { type: "PROJECT", deletedAt: null },
    orderBy: [{ isPinned: "desc" }, { pinnedOrder: "asc" }, { updatedAt: "desc" }],
  });
  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="admin-page-title">Projects</h1><p className="mt-2 max-w-2xl text-sm admin-muted">Manage project case studies and choose how featured work appears on the homepage.</p></div>
        <Link href="/admin/create?type=PROJECT" className="admin-button-primary"><FaPlus aria-hidden="true" />New project</Link>
      </header>
      <SortableProjectList initialProjects={projects} initialHealth={typeof filters.health === "string" ? filters.health : undefined} />
    </div>
  );
}
