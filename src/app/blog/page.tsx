import Link from 'next/link';
import { getPosts } from '@/lib/posts';
import { format } from 'date-fns';
import HeroBackground from '@/components/HeroBackground';
import ScrollReveal from '@/components/ScrollReveal';

export default function BlogIndex() {
    const posts = getPosts();

    return (
        <div className="min-h-screen">
             {/* Simple Hero */}
             <section className="relative py-32 border-b border-stone-200 dark:border-white/10 overflow-hidden bg-stone-100 dark:bg-[#111]">
                 <HeroBackground />
                 <div className="max-w-5xl mx-auto px-6 relative z-10 pointer-events-none">
                     <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-stone-950 dark:text-stone-50">
                        Archives
                     </h1>
                     <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl">
                        Technical notes, research, and documentation of my journey in Systems Engineering.
                     </p>
                 </div>
             </section>

             <section className="py-20 bg-stone-50 dark:bg-black min-h-[50vh]">
                <ScrollReveal className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-stone-300 dark:border-white/10 text-xs font-mono text-stone-500 uppercase tracking-wider mb-8">
                            <div className="col-span-2">Date</div>
                            <div className="col-span-8">Title</div>
                            <div className="col-span-2 text-right">Read Time</div>
                        </div>

                        {posts.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                                <article className="md:grid grid-cols-12 gap-4 py-8 border-b border-stone-200 dark:border-white/5 items-baseline hover:bg-white dark:hover:bg-white/5 transition-colors -mx-4 px-4 rounded-lg">
                                    {/* Date */}
                                    <div className="col-span-2 mb-2 md:mb-0">
                                        <time className="text-sm font-mono text-[var(--accent)]">
                                            {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                                        </time>
                                    </div>
                                    
                                    {/* Title */}
                                    <div className="col-span-8">
                                        <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[var(--accent)] transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-stone-500 mt-2 text-sm leading-relaxed max-w-2xl">
                                            {post.summary}
                                        </p>
                                    </div>

                                    {/* Meta/Action */}
                                    <div className="col-span-2 text-right hidden md:block">
                                         <span className="text-xs font-mono text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                                            {post.readTime}
                                         </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </ScrollReveal>
             </section>
        </div>
    );
}