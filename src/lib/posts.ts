import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';

export interface Post {
    slug: string;
    title: string;
    publishedAt: string;
    summary: string;
    content: string;
    readTime: string;
    category?: string | null;
}

function calculateReadTime(content: string): string {
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 200);
    return `${time} min read`;
}

export async function getPosts(): Promise<Post[]> {
    try {
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { type: PostType.BLOG },
                    { showAsBlog: true }
                ]
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });

        return posts.map(post => ({
            slug: post.slug,
            title: post.title,
            publishedAt: post.publishedAt.toISOString(),
            summary: post.summary,
            content: post.content,
            readTime: calculateReadTime(post.content),
            category: post.category
        }));
    } catch (error) {
         console.warn("Database unreachable during build (getPosts), returning empty list.");
         return [];
    }
}

export async function getPost(slug: string): Promise<Post | null> {
    const post = await prisma.post.findUnique({
        where: { slug }
    });

    if (!post || (post.type !== PostType.BLOG && !post.showAsBlog)) return null;

    return {
        slug: post.slug,
        title: post.title,
        publishedAt: post.publishedAt.toISOString(),
        summary: post.summary,
        content: post.content,
        readTime: calculateReadTime(post.content),
        category: post.category
    };
}