import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deletePost } from '@/lib/actions';
import { getVisitorStats, getDailyVisits, getTopPages } from '@/lib/analytics';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaPlus, FaThumbtack, FaNewspaper, FaProjectDiagram, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';
import VisitorStatsCards from '@/components/admin/VisitorStatsCards';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import TopPagesTable from '@/components/admin/TopPagesTable';

export default async function AdminDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 10
  });

  // Parallel data fetching
  const [stats, dailyVisits, topPages] = await Promise.all([
      getVisitorStats(),
      getDailyVisits(14),
      getTopPages(6)
  ]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Dashboard</h1>
                  <p className="text-stone-500 dark:text-stone-400 mt-2">Overview of your portfolio's performance.</p>
              </div>
              <div className="flex gap-3">
                 <Link 
                    href="/" 
                    target="_blank"
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-white/5 transition-colors"
                >
                     <FaExternalLinkAlt /> View Site
                 </Link>
              </div>
          </div>

          <VisitorStatsCards {...stats} />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[420px]">
          <div className="lg:col-span-2 h-[350px] lg:h-full">
              <AnalyticsChart data={dailyVisits} />
          </div>
          <div className="h-[350px] lg:h-full">
              <TopPagesTable pages={topPages} />
          </div>
      </div>

      <div className="border-t border-stone-200 dark:border-white/10 my-8"></div>

      {/* Content Management Section */}
      <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Recent Content</h2>
                    <p className="text-sm text-stone-500">Manage your latest projects and posts</p>
                </div>
                <div className="flex gap-2">
                        <Link href="/admin/create?type=PROJECT" className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-white/5 font-medium text-sm transition-all shadow-sm">
                        <FaPlus size={12} /> Project
                    </Link>
                    <Link href="/admin/create?type=BLOG" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 font-bold text-sm shadow-lg shadow-orange-500/20 transition-all">
                        <FaPlus size={12} /> Archive
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0c0a09] rounded-xl border border-stone-200 dark:border-white/10 shadow-sm overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02]">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input 
                            placeholder="Search content..." 
                            className="w-full bg-white dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all placeholder-stone-400"
                        />
                    </div>
                </div>

                {/* Content List */}
                <div className="divide-y divide-stone-200 dark:divide-white/5">
                    {posts.map((post) => (
                        <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                post.type === 'PROJECT' 
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' 
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                                {post.type === 'PROJECT' ? <FaProjectDiagram size={18} /> : <FaNewspaper size={18} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-stone-900 dark:text-stone-100 truncate text-sm md:text-base">{post.title}</h3>
                                    {post.isPinned && (
                                        <span className="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <FaThumbtack size={8} /> Pinned
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                                    <span className="font-mono">{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
                                    <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></span>
                                    <span className="capitalize">{post.type.toLowerCase()}</span>
                                    {post.category && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></span>
                                            <span className="text-stone-400">{post.category}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                <Link 
                                    href={`/admin/${post.type === 'PROJECT' ? 'projects' : 'archives'}/${post.slug}`}
                                    className="p-2 text-stone-400 hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </Link>
                                <DeleteButton id={post.id} />
                            </div>
                        </div>
                    ))}
                    
                    {posts.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-stone-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                <FaNewspaper size={24} />
                            </div>
                            <h3 className="text-stone-900 dark:text-stone-100 font-bold mb-1">No content yet</h3>
                            <p className="text-stone-500 text-sm mb-4">Create your first project or archive post to get started.</p>
                            <Link href="/admin/create?type=PROJECT" className="inline-flex items-center gap-2 text-[var(--accent)] font-bold text-sm hover:underline">
                                <FaPlus /> Create Content
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
    // Explicitly casting the action to any to bypass the loose strictness of the server action type in this context
    // In a production app you'd wrap this in a client component with useTransition
    const deleteAction = deletePost.bind(null, id) as any;
    return (
        <form action={deleteAction}>
            <button 
                type="submit"
                className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                title="Delete"
            >
                <FaTrash size={16} />
            </button>
        </form>
    )
}