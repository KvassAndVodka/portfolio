import { PostStatus, PostType } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

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

export type ProjectPreview = Omit<Project, "content">;

const getCachedProjects = unstable_cache(
    async (): Promise<Project[]> => {
        const projects = await prisma.post.findMany({
            where: {
                type: PostType.PROJECT,
                deletedAt: null,
                OR: [
                    { status: PostStatus.PUBLISHED },
                    { status: PostStatus.SCHEDULED, publishedAt: { lte: new Date() } },
                ],
            },
            orderBy: [
                { isPinned: "desc" },
                { pinnedOrder: "asc" },
                { publishedAt: "desc" },
            ],
        });

        return projects.map((project) => ({
            slug: project.slug,
            title: project.title,
            summary: project.summary,
            content: project.content,
            techStack: project.techStack,
            githubUrl: project.githubUrl || undefined,
            demoUrl: project.demoUrl || undefined,
            projectUrl: project.projectUrl || undefined,
            category: project.category || undefined,
            isPinned: project.isPinned,
            thumbnail: project.thumbnail || undefined,
        }));
    },
    ["projects-list"],
    { revalidate: 60, tags: ["projects"] },
);

export async function getProjectsStrict(): Promise<Project[]> {
    return getCachedProjects();
}

export async function getProjects(): Promise<Project[]> {
    try {
        return await getProjectsStrict();
    } catch {
        console.warn("Database unreachable during build (getProjects), returning empty list.");
        return [];
    }
}


// Removed dead code


export async function getProject(slug: string): Promise<Project | null> {
     const p = await prisma.post.findUnique({
        where: { slug }
    });
    
    const isPublic = p?.status === PostStatus.PUBLISHED || (p?.status === PostStatus.SCHEDULED && p.publishedAt <= new Date());
    if (!p || p.type !== PostType.PROJECT || p.deletedAt || !isPublic) return null;

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
