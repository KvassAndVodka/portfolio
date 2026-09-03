import { PostStatus, PostType } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

export interface Project {
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  projectUrl?: string;
  category?: string;
  isPinned?: boolean;
  thumbnail?: string;
}

export type ProjectPreview = Omit<Project, "content" | "publishedAt" | "updatedAt">;

export function toProjectPreview(project: Project): ProjectPreview {
    return {
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        techStack: project.techStack,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        projectUrl: project.projectUrl,
        category: project.category,
        isPinned: project.isPinned,
        thumbnail: project.thumbnail,
    };
}

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
            publishedAt: project.publishedAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
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
        console.warn("No cached project snapshot is available; returning an empty project list.");
        return [];
    }
}


export async function getProject(slug: string): Promise<Project | null> {
    try {
        const projects = await getProjectsStrict();
        return projects.find((project) => project.slug === slug) ?? null;
    } catch {
        return null;
    }
}
