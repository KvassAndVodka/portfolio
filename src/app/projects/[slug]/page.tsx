import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import AsciiPlate, { PLATE_TONES } from "@/components/AsciiPlate";
import { markdownComponents } from "@/components/markdownComponents";
import { FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import { formatProjectCategory } from "@/lib/projectCategory";
import SiteFooter from "@/components/SiteFooter";
import { getProject, getProjects } from "@/lib/projects";
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, defaultSocialImage, serializeJsonLd } from "@/lib/seo";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Readonly<{ params: Params }>): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    image: project.thumbnail,
    type: "article",
    publishedTime: project.publishedAt,
    modifiedTime: project.updatedAt,
  });
}

export default async function ProjectPage({
  params,
}: Readonly<{
  params: Params;
}>) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([getProject(slug), getProjects()]);

  if (!project) notFound();

  const pad = (value: number) => String(value).padStart(2, "0");
  // The same figure number the project has on the index.
  const currentIndex = projects.findIndex((entry) => entry.slug === project.slug);
  const figure = currentIndex + 1;
  const previousProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
  const liveProjectUrl = project.projectUrl || project.demoUrl;
  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${projectUrl}#project`,
    url: projectUrl,
    name: project.title,
    headline: project.title,
    description: project.summary,
    image: project.thumbnail ? absoluteUrl(project.thumbnail) : absoluteUrl(defaultSocialImage.url),
    dateCreated: project.publishedAt,
    dateModified: project.updatedAt,
    inLanguage: "en",
    creator: { "@id": absoluteUrl("/#person") },
    isPartOf: { "@id": absoluteUrl("/#website") },
    keywords: project.techStack,
    genre: formatProjectCategory(project.category),
    sameAs: [project.githubUrl, project.demoUrl, project.projectUrl].filter(Boolean),
  };

  return (
    <>
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(projectJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              breadcrumbJsonLd([
                { name: "Projects", path: "/projects" },
                { name: project.title, path: `/projects/${project.slug}` },
              ]),
            ),
          }}
        />
        <header className="subpage-hero">
          <div className="site-shell max-w-5xl">
            <Link className="back-link mb-12" href="/projects">
              <FaArrowLeft aria-hidden="true" />
              All projects
            </Link>
            <p className="page-head-labels">
              {figure > 0 && <span>Fig. {pad(figure)} / {pad(projects.length)}</span>}
              <span>{formatProjectCategory(project.category)}</span>
              <span>{project.publishedAt.slice(0, 4)}</span>
            </p>
            <h1 className="page-title !max-w-[15ch]">
              {project.title}
              <span className="title-dot">.</span>
            </h1>
            <p className="body-large mt-7">{project.summary}</p>

            <div className="project-spec">
              <dl>
                {project.outcome && (
                  <div>
                    <dt>What changed</dt>
                    <dd className="project-spec-outcome">{project.outcome}</dd>
                  </div>
                )}
                {project.techStack.length > 0 && (
                  <div>
                    <dt>Built with</dt>
                    <dd>
                      <ul>
                        {project.techStack.map((tool) => (
                          <li key={tool}>{tool}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
              {(liveProjectUrl || project.githubUrl) && (
                <div className="project-spec-links">
                  {liveProjectUrl && (
                    <a className="postcard-button postcard-button-primary" href={liveProjectUrl} rel="noreferrer" target="_blank">
                      Live project
                      <FaArrowUpRightFromSquare aria-hidden="true" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a className="postcard-button" href={project.githubUrl} rel="noreferrer" target="_blank">
                      <FaGithub aria-hidden="true" />
                      Source code
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="site-shell max-w-5xl pb-20 md:pb-28">
          <div className="paper-figure">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={`${project.title} project preview`}
                fill
                unoptimized
                sizes="(max-width: 767px) calc(100vw - 2rem), 64rem"
                className="object-cover"
                priority
              />
            ) : (
              <AsciiPlate
                pattern={Math.max(0, currentIndex)}
                color={PLATE_TONES[Math.max(0, currentIndex) % PLATE_TONES.length]}
                className="text-[clamp(4px,0.85vw,10px)] max-md:text-[clamp(4px,1.4vw,8px)]"
              />
            )}
          </div>
          <div className="paper-sheet">
            <div className="prose prose-lg article-prose max-w-none">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: true }]]}>{project.content}</ReactMarkdown>
            </div>
          </div>

          <nav className="detail-footer-nav" aria-label="Project navigation">
            <div className="detail-footer-actions">
              <Link className="back-link" href="/projects">
                <FaArrowLeft aria-hidden="true" />
                All projects
              </Link>
              {(liveProjectUrl || project.githubUrl) && (
                <div className="project-spec-links">
                  {liveProjectUrl && (
                    <a className="postcard-button postcard-button-primary" href={liveProjectUrl} rel="noreferrer" target="_blank">
                      Live project
                      <FaArrowUpRightFromSquare aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a className="postcard-button" href={project.githubUrl} rel="noreferrer" target="_blank">
                      <FaGithub aria-hidden="true" />
                      Source code
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {(previousProject || nextProject) && (
              <div className="detail-pager">
                {previousProject ? (
                  <Link className="detail-pager-link" href={`/projects/${previousProject.slug}`}>
                    <span className="detail-pager-label">
                      <FaArrowLeft aria-hidden="true" />
                      Previous project
                    </span>
                    <span className="detail-pager-title">
                      {previousProject.title}
                      <span className="title-dot">.</span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextProject && (
                  <Link className="detail-pager-link detail-pager-next" href={`/projects/${nextProject.slug}`}>
                    <span className="detail-pager-label">
                      Next project
                      <FaArrowRight aria-hidden="true" />
                    </span>
                    <span className="detail-pager-title">
                      {nextProject.title}
                      <span className="title-dot">.</span>
                    </span>
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
