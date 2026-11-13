import PostForm from "@/components/admin/PostForm";
import { createPost } from "@/lib/actions";

export default async function CreatePage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const filters = await searchParams;
  const type = filters.type === "PROJECT" ? "PROJECT" : "BLOG";
  return (
    <PostForm action={createPost} submitLabel="Save content" initialData={{ title: "", slug: "", summary: "", content: "", type, status: "DRAFT", isPinned: false, showAsBlog: false }} />
  );
}
