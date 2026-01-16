import { getPost, getPosts } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost(props: { params: Params }) {
    const params = await props.params;
    const post = await getPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="max-w-3xl mx-auto p-8">
            <header className="mb-12 border-b border-stone-200 dark:border-white/10 pb-8">
                <Link href="/archives" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-500 hover:text-[var(--accent)] mb-8 transition-colors">
                    <FaArrowLeft /> Back to Archives
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-stone-500">
                    <time dateTime={post.publishedAt}>
                        {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
                    </time>
                    <span>•</span>
                    <span>{post.readTime}</span>
                    {post.category && (
                        <>
                            <span>•</span>
                            <span className="text-[var(--accent)]">{post.category}</span>
                        </>
                    )}
                </div>
            </header>
            
            <div className="prose prose-stone prose-lg dark:prose-invert">
                <MDXRemote source={post.content} />
            </div>
        </article>
    );
}