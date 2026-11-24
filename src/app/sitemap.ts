import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/posts";
import { getProjects } from "@/lib/projects";
import { buildSitemap } from "@/lib/sitemap";

// Render against live DB on request (backed by 60s unstable_cache) so deploys never serve an empty sitemap.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return buildSitemap(projects, posts);
}
