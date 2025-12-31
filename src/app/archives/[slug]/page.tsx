import { getPost, getPosts } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
    const posts = getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost(props: { params: Params}) {
    const params = await props.params;

    try {
        const post = getPost(params.slug);

        return (
            <article className="max-w-3xl mx-auto p-8">
                <header className="mb-10">
                    <time className="text-stone-500 font-mono text-sm">
                        {format(new Date(post.publishedAt), 'MMMM dd, yyyy')} • {post.readTime}
                    </time>
                </header>
                {}
                <div className="prose prose-stone prose-lg dark:prose-invert">
                    <MDXRemote source={post.content} />
                </div>
            </article>
        );
    } catch (error) {
        notFound();
    }
}