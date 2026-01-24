import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';

export interface Project {
    slug: string;
    title: string;
    summary: string;
    content: string;
    techStack: string[];
    githubUrl?: string;
    demoUrl?: string;
    projectUrl?: string;
    category?: string;
    isPinned?: boolean;
    thumbnail?: string;
}

import { unstable_cache } from 'next/cache';

export async function getProjects(): Promise<Project[]> {
    return await unstable_cache(
        async () => {
             try {
                const projects = await prisma.post.findMany({
                    where: {
                        type: PostType.PROJECT,
                        deletedAt: null
                    },
                    orderBy: [
                        { isPinned: 'desc' }, 
                        { pinnedOrder: 'asc' },
                        { publishedAt: 'desc' }
                    ]
                });
                return projects.map(p => ({
                    slug: p.slug,
                    title: p.title,
                    summary: p.summary,
                    content: p.content,
                    techStack: p.techStack,
                    githubUrl: p.githubUrl || undefined,
                    demoUrl: p.demoUrl || undefined,
                    projectUrl: p.projectUrl || undefined,
                    category: p.category || undefined,
                    isPinned: p.isPinned,
                    thumbnail: p.thumbnail || undefined,
                }));
            } catch (error) {
                console.warn("Database unreachable during build (getProjects), returning empty list.");
                return [];
            }
        },
        ['projects-list'],
        { revalidate: 60, tags: ['projects'] }
    )();
}


// Removed dead code


export async function getProject(slug: string): Promise<Project | null> {
     const p = await prisma.post.findUnique({
        where: { slug }
    });
    
    if (!p || p.type !== PostType.PROJECT || p.deletedAt) return null;

    return {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        content: p.content,
        techStack: p.techStack,
        githubUrl: p.githubUrl || undefined,
        demoUrl: p.demoUrl || undefined,
        projectUrl: p.projectUrl || undefined,
        category: p.category || undefined,
        thumbnail: p.thumbnail || undefined,
    }
}