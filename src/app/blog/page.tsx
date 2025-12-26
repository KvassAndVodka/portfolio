import Link from 'next/link';
import { getPosts } from '@/lib/posts';
import { format } from 'date-fns';

export default function BlogIndex() {
    const posts = getPosts();

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-12 tracking-tighter">Writing</h1>
            <div className="flex flex-col gap-8">
                {posts.map((post) => (
                    <article key={post.slug} className="group">
                        <Link href={`/blog/${post.slug}`} className="block">
                            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
                                <h2 className="text-2xl font-medium group-hover:underline underline-offset-4 decoration-stone-400">
                                    {post.title}
                                </h2>
                            </div>
                            <p className="text-stone-500 font-mono text-sm shrink-0">
                                {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
                            </p>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}