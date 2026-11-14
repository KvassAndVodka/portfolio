import { buildLlmsTxt, llmsTxtResponse } from "@/lib/llms";
import { getPosts } from "@/lib/posts";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

export async function GET() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return llmsTxtResponse(buildLlmsTxt(projects, posts));
}
