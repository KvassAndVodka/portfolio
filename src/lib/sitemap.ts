import type { MetadataRoute } from "next";

import type { Post } from "@/lib/posts";
import type { Project } from "@/lib/projects";
import { absoluteUrl } from "@/lib/seo";

type SitemapProject = Pick<Project, "slug" | "updatedAt">;
type SitemapPost = Pick<Post, "slug" | "updatedAt">;

function newestDate(dates: Date[]) {
  if (dates.length === 0) return undefined;
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

export function buildSitemap(
  projects: SitemapProject[],
  posts: SitemapPost[],
): MetadataRoute.Sitemap {
  const projectDates = projects.map((project) => new Date(project.updatedAt));
  const postDates = posts.map((post) => new Date(post.updatedAt));
  const latestProjectDate = newestDate(projectDates);
  const latestPostDate = newestDate(postDates);
  const latestSiteDate = newestDate([...projectDates, ...postDates]);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latestSiteDate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/projects"),
      lastModified: latestProjectDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: new Date(project.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/notes"),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/notes/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
