import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/posts";
import { getProjects } from "@/lib/projects";
import { buildSitemap } from "@/lib/sitemap";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return buildSitemap(projects, posts);
}
