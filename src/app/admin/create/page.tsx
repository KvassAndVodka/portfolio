import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import AdminPageHead from "@/components/admin/AdminPageHead";
import PostForm from "@/components/admin/PostForm";
import { createPost } from "@/lib/actions";

export default async function CreatePage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const filters = await searchParams;
  const type = filters.type === "PROJECT" ? "PROJECT" : "BLOG";
  return (
    <>
      <AdminPageHead kicker={type === "PROJECT" ? "Work · new" : "Writing · new"} title={`New ${type === "PROJECT" ? "project" : "note"}`} lead="It starts as a draft. Publish it when it is ready.">
        <Link href={type === "PROJECT" ? "/admin/projects" : "/admin/notes"} className="admin-button-secondary"><FaArrowLeft aria-hidden="true" />All {type === "PROJECT" ? "projects" : "notes"}</Link>
      </AdminPageHead>
      <div className="pt-10">
      <PostForm action={createPost} submitLabel="Save content" initialData={{ title: "", slug: "", summary: "", content: "", type, status: "DRAFT", isPinned: false, showAsBlog: false }} />
      </div>
    </>
  );
}
