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
}

export async function getProjects(): Promise<Project[]> {
    const projects = await prisma.post.findMany({
        where: {
            type: PostType.PROJECT
        },
        orderBy: [
            { isPinned: 'desc' }, // Pinned items first
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
    }));
}

export async function getProject(slug: string): Promise<Project | null> {
     const p = await prisma.post.findUnique({
        where: { slug }
    });
    
    if (!p || p.type !== PostType.PROJECT) return null;

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
    }
}