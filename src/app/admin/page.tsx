import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PostType } from '@prisma/client';
import { updatePost, deletePost } from '@/lib/actions';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaPlus, FaThumbtack, FaNewspaper } from 'react-icons/fa';

export default async function AdminDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Dashboard</h1>
        <div className="flex gap-4">
            <Link href="/admin/create" className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 font-bold">
                <FaPlus /> New Post
            </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-stone-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 dark:bg-white/5 border-b border-stone-200 dark:border-white/10 font-mono uppercase text-stone-500">
                    <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-center">Pin</th>
                        <th className="p-4 text-center">Blog Ref</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-white/5">
                    {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium max-w-xs truncate" title={post.title}>{post.title}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    post.type === 'PROJECT' 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                    {post.type}
                                </span>
                            </td>
                            <td className="p-4 text-stone-500 font-mono">
                                {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                            </td>
                            {/* Toggle Pin */}
                            <td className="p-4 text-center">
                                <ToggleForm id={post.id} field="isPinned" value={post.isPinned} icon={<FaThumbtack />} />
                            </td>
                            {/* Toggle ShowAsBlog */}
                            <td className="p-4 text-center">
                                {post.type === 'PROJECT' && (
                                    <ToggleForm id={post.id} field="showAsBlog" value={post.showAsBlog} icon={<FaNewspaper />} />
                                )}
                            </td>
                            
                            <td className="p-4 flex gap-2 justify-end">
                                <Link 
                                    href={`/admin/edit/${post.slug}`}
                                    className="p-2 text-stone-500 hover:text-[var(--accent)] transition-colors"
                                >
                                    <FaEdit size={16} />
                                </Link>
                                <DeleteButton id={post.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function ToggleForm({ id, field, value, icon }: { id: string, field: string, value: boolean, icon: React.ReactNode }) {
    const update = updatePost.bind(null, id);
    return (
        <form action={update}>
            <input type="hidden" name={field} value={value ? "" : "on"} />
             <div className={`${value ? 'text-[var(--accent)]' : 'text-stone-300 dark:text-white/10'}`}>
                {icon}
             </div>
        </form>
    )
}

function DeleteButton({ id }: { id: string }) {
    const deleteAction = deletePost.bind(null, id);
    return (
        <form action={deleteAction}>
            <button className="p-2 text-stone-500 hover:text-red-500 transition-colors">
                <FaTrash size={16} />
            </button>
        </form>
    )
}