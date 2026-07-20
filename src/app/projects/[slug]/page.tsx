import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { FaArrowLeft, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import { formatProjectCategory } from "@/components/ProjectCard";
import ProjectTechnologyList from "@/components/ProjectTechnologyList";
import { getProject, getProjects } from "@/lib/projects";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = true;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const liveProjectUrl = project.projectUrl || project.demoUrl;

  return (
    <article>
      <header className="subpage-hero">
        <div className="site-shell max-w-5xl">
          <Link className="back-link mb-12" href="/projects">
            <FaArrowLeft aria-hidden="true" />
            Back to projects
          </Link>
          <p className="eyebrow mb-6">{formatProjectCategory(project.category)}</p>
          <h1 className="page-title !max-w-[15ch]">{project.title}</h1>
          <p className="body-large mt-7">{project.summary}</p>

          <div className="mt-10 flex flex-col gap-7 border-t site-rule pt-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold text-[var(--muted)]">Built with</p>
              <ProjectTechnologyList technologies={project.techStack} />
            </div>
            <div className="flex flex-wrap gap-3">
              {project.githubUrl && (
                <a className="button-secondary" href={project.githubUrl} rel="noreferrer" target="_blank">
                  <FaGithub aria-hidden="true" />
                  Source code
                </a>
              )}
              {liveProjectUrl && (
                <a className="button-primary" href={liveProjectUrl} rel="noreferrer" target="_blank">
                  Live project
                  <FaArrowUpRightFromSquare aria-hidden="true" className="button-external-icon" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="site-shell max-w-5xl py-16 md:py-24">
        {project.thumbnail && (
          <div className="relative mb-16 aspect-[16/9] overflow-hidden rounded-[0.75rem] bg-[var(--surface)] md:mb-24">
            <Image
              src={project.thumbnail}
              alt={`${project.title} project preview`}
              fill
              unoptimized
              sizes="(max-width: 767px) calc(100vw - 2rem), 64rem"
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="prose prose-lg article-prose mx-auto max-w-3xl">
          <ReactMarkdown>{project.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
