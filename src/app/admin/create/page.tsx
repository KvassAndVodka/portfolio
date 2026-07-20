import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import PostForm from "@/components/admin/PostForm";
import { createPost } from "@/lib/actions";

export default async function CreatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = await searchParams;
  const type = filters.type === "PROJECT" ? "PROJECT" : "BLOG";
  return (
    <div className="space-y-6 pb-16">
      <header className="flex items-start gap-3">
        <Link href={type === "PROJECT" ? "/admin/projects" : "/admin/notes"} className="admin-icon-button" aria-label={`Back to ${type === "PROJECT" ? "projects" : "notes"}`}><FaArrowLeft aria-hidden="true" /></Link>
        <div><h1 className="admin-page-title">New {type === "PROJECT" ? "project" : "note"}</h1><p className="mt-2 text-sm admin-muted">Start as a draft, then publish when it is ready.</p></div>
      </header>
      <PostForm action={createPost} submitLabel="Save content" initialData={{ title: "", slug: "", summary: "", content: "", type, status: "DRAFT", isPinned: false, showAsBlog: false }} />
    </div>
  );
}
