import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaPlus, FaEye, FaCalendar, FaSearch } from 'react-icons/fa';
import { deletePost } from '@/lib/actions';

export default async function AdminBlogs() {
    const blogs = await prisma.post.findMany({
        where: { type: PostType.BLOG },
        orderBy: { publishedAt: 'desc' }
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 rounded-2xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 shadow-sm">
                <div>
                     <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Archives</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">Manage your articles, tutorials, and thoughts.</p>
                </div>
                <Link 
                    href="/admin/create?type=BLOG" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-stone-900/10 dark:shadow-white/5"
                >
                    <FaPlus size={14} />
                    <span>New Post</span>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 rounded-xl p-2 shadow-sm">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input 
                        placeholder="Search archives..." 
                        className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400"
                    />
                </div>
            </div>

            {/* Content List as Cards (Same style as Projects) */}
            <div className="space-y-4">
                {blogs.length > 0 && (
                     <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                        All Posts
                    </h2>
                )}

                <div className="grid gap-4">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 hover:border-[var(--accent)]/30 transition-all">
                            
                            {/* Icon / Spacer to match Project "Drag Handle" width if needed, or just standard spacing */}
                            <div className="flex items-center gap-3 self-start md:self-center pr-2 border-r border-stone-100 dark:border-white/5 mr-0 md:mr-2">
                                <div className="p-2 text-stone-300 dark:text-stone-600">
                                    <FaCalendar />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[var(--accent)] transition-colors">
                                        {blog.title}
                                    </h3>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                     <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-400 text-xs font-medium border border-stone-200 dark:border-white/5 font-mono">
                                        {format(new Date(blog.publishedAt), 'MMM dd, yyyy')}
                                    </span>
                                    {blog.category && (
                                         <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-400 text-xs font-medium border border-stone-200 dark:border-white/5">
                                            {blog.category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity self-end md:self-center">
                                <Link 
                                    href={`/archives/${blog.slug}`} 
                                    target="_blank"
                                    className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                                    title="View Live"
                                >
                                    <FaEye size={16} />
                                </Link>
                                <Link 
                                    href={`/admin/archives/${blog.slug}`}
                                    className="p-2 text-stone-400 hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </Link>
                                <DeleteButton id={blog.id} />
                            </div>
                        </div>
                    ))}
    
                    {blogs.length === 0 && (
                         <div className="text-center py-20 rounded-2xl border border-dashed border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/5">
                            <p className="text-stone-500 mb-4">No stories told yet.</p>
                            <Link 
                                href="/admin/create?type=BLOG"
                                className="text-[var(--accent)] hover:underline font-mono text-sm"
                            >
                                Start writing &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DeleteButton({ id }: { id: string }) {
    // Explicitly casting to any to bypass strict type check for server action in this context
    const deleteAction = deletePost.bind(null, id) as any;
    return (
        <form action={deleteAction}>
            <button className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                <FaTrash size={18} />
            </button>
        </form>
    )
}
