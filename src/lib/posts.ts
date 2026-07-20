import { PostStatus, PostType } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

export interface Post {
    slug: string;
    title: string;
    publishedAt: string;
    summary: string;
    content: string;
    readTime: string;
  category?: string | null;
}

export type PostPreview = Omit<Post, "content">;

function calculateReadTime(content: string): string {
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 200);
    return `${time} min read`;
}

const getCachedPosts = unstable_cache(
    async (): Promise<Post[]> => {
        const posts = await prisma.post.findMany({
            where: {
                AND: [
                    { OR: [{ type: PostType.BLOG }, { showAsBlog: true }] },
                    {
                        OR: [
                            { status: PostStatus.PUBLISHED },
                            { status: PostStatus.SCHEDULED, publishedAt: { lte: new Date() } },
                        ],
                    },
                ],
                deletedAt: null,
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });

        return posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            publishedAt: post.publishedAt.toISOString(),
            summary: post.summary,
            content: post.content,
            readTime: calculateReadTime(post.content),
            category: post.category
        }));
    },
    ["notes-list"],
    { revalidate: 60, tags: ["notes"] },
);

export async function getPostsStrict(): Promise<Post[]> {
    return getCachedPosts();
}

export async function getPosts(): Promise<Post[]> {
    try {
        return await getPostsStrict();
    } catch {
        console.warn("Database unreachable during build (getPosts), returning empty list.");
        return [];
    }
}

export async function getPost(slug: string): Promise<Post | null> {
    const post = await prisma.post.findUnique({
        where: { slug }
    });

    const isPublic = post?.status === PostStatus.PUBLISHED || (post?.status === PostStatus.SCHEDULED && post.publishedAt <= new Date());
    if (!post || (post.type !== PostType.BLOG && !post.showAsBlog) || post.deletedAt || !isPublic) return null;

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
