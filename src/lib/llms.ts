import type { Post } from "@/lib/posts";
import { formatProjectCategory } from "@/lib/projectCategory";
import type { Project } from "@/lib/projects";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type LlmsProject = Pick<Project, "slug" | "title" | "summary" | "content" | "techStack" | "category" | "githubUrl" | "projectUrl" | "demoUrl">;
type LlmsPost = Pick<Post, "slug" | "title" | "summary" | "content" | "publishedAt" | "isProject">;

// The llms.txt convention (llmstxt.org): a Markdown index of the site for language models.
// `full` inlines every project and note body, for /llms-full.txt.
export function buildLlmsTxt(projects: LlmsProject[], posts: LlmsPost[], full = false) {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description} Based in Cagayan de Oro, Philippines.`,
    "",
    `- Website: ${absoluteUrl("/")}`,
    `- Resume: ${absoluteUrl("/resume.pdf")}`,
    `- GitHub: ${siteConfig.github}`,
    `- LinkedIn: ${siteConfig.linkedin}`,
    "",
    "## Projects",
    "",
  ];

  for (const project of projects) {
    const url = absoluteUrl(`/projects/${project.slug}`);
    lines.push(...(full ? projectSection(project, url) : [`- [${project.title}](${url}): ${project.summary}`]));
  }

  // Case studies shown as notes are already listed under Projects.
  const notes = posts.filter((post) => !post.isProject);
  if (notes.length) lines.push("", "## Notes", "");
  for (const post of notes) {
    const url = absoluteUrl(`/notes/${post.slug}`);
    if (!full) {
      lines.push(`- [${post.title}](${url}): ${post.summary}`);
      continue;
    }
    lines.push(`### ${post.title}`, "", `URL: ${url}`, `Published: ${post.publishedAt.slice(0, 10)}`, post.summary, "", post.content.trim(), "");
  }

  if (!full) lines.push("", "## Optional", "", `- [Full text of every project and note](${absoluteUrl("/llms-full.txt")})`);
  return `${lines.join("\n").trim()}\n`;
}

function projectSection(project: LlmsProject, url: string) {
  const lines = [`### ${project.title}`, "", `URL: ${url}`, project.summary, ""];
  if (project.category) lines.push(`Category: ${formatProjectCategory(project.category)}`);
  if (project.techStack.length) lines.push(`Built with: ${project.techStack.join(", ")}`);
  for (const link of [project.projectUrl || project.demoUrl, project.githubUrl]) if (link) lines.push(`Link: ${link}`);
  lines.push("", project.content.trim(), "");
  return lines;
}

export function llmsTxtResponse(body: string) {
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
