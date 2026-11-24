import { buildLlmsTxt, llmsTxtResponse } from "@/lib/llms";
import { getPosts } from "@/lib/posts";
import { getProjects } from "@/lib/projects";

// Render against live DB on request (backed by 60s unstable_cache) so deploys never serve an empty index.
export const dynamic = "force-dynamic";

export async function GET() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return llmsTxtResponse(buildLlmsTxt(projects, posts));
}
