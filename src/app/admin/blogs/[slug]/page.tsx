import { updateBlog } from '@/lib/actions';
import { notFound } from 'next/navigation';

async function getAdminPost(slug: string) {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/api/admin/blogs`, {
        headers: { 'x-api-key': process.env.ADMIN_API_KEY! },
        cache: 'no-store'
    });
    if (!res.ok) return null;
    const posts = await res.json();
    return posts.find((p: any) => p.slug === slug);
}

export default async function EditBlogPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getAdminPost(params.slug);

  if (!post) notFound();

  const updateBlogWithId = updateBlog.bind(null, post.id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      
      <form action={updateBlogWithId} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input name="title" defaultValue={post.title} required className="w-full p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input name="slug" defaultValue={post.slug} required className="w-full p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">Summary</label>
            <textarea name="summary" defaultValue={post.summary} required rows={3} className="w-full p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10" />
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
            <textarea name="content" defaultValue={post.content} required rows={15} className="w-full p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 font-mono text-sm" />
        </div>

        <div className="flex items-center gap-2">
            <input name="published" type="checkbox" id="published" defaultChecked={post.published} className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]" />
            <label htmlFor="published" className="text-sm font-medium">Publish Immediately</label>
        </div>

        <button type="submit" className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity mt-8">
            Save Changes
        </button>
      </form>
    </div>
  );
}
