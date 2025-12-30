import { getProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import HeroBackground from "@/components/HeroBackground";
import ScrollReveal from "@/components/ScrollReveal";
import { FaGithub, FaExternalLinkAlt, FaArrowLeft } from "react-icons/fa";

export async function generateStaticParams() {
  const projects = getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = getProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black">
      {/* HEADER */}
      <section className="relative py-32 border-b border-stone-200 dark:border-white/10 overflow-hidden bg-stone-100 dark:bg-[#111]">
         <HeroBackground />
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
         
         <div className="max-w-4xl mx-auto px-6 relative z-10">
             <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-mono text-stone-500 hover:text-[var(--accent)] mb-8 transition-colors">
                <FaArrowLeft /> Back to Projects
             </Link>
             
             <div className="flex flex-wrap gap-3 mb-6">
                {project.category && (
                    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full ${
                        project.category === 'professional' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        project.category === 'personal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                        {project.category}
                    </span>
                )}
             </div>

             <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-stone-950 dark:text-stone-50">
                {project.title}
             </h1>
             
             <p className="text-xl text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mb-12">
                {project.summary}
             </p>

             {/* SPECS & ACTIONS */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-stone-200 dark:border-white/10">
                <div className="space-y-3">
                     <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Technologies</h3>
                     <div className="flex flex-wrap gap-2">
                         {project.techStack.map(tech => (
                             <span key={tech} className="text-xs font-mono px-2 py-1 bg-stone-100 dark:bg-white/5 rounded text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-white/5">
                                 {tech}
                             </span>
                         ))}
                     </div>
                </div>

                <div className="flex gap-4">
                     {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition">
                            <FaGithub size={18} /> Source
                        </a>
                     )}
                     {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-stone-300 dark:border-white/20 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-white/5 transition">
                            <FaExternalLinkAlt size={14} /> Demo
                        </a>
                     )}
                     {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-orange-500/20">
                            <FaExternalLinkAlt size={14} /> View Project
                        </a>
                     )}
                </div>
             </div>
         </div>
      </section>

      {/* CONTENT */}
      <section className="py-20">
        <ScrollReveal className="max-w-3xl mx-auto px-6">
            <article className="prose prose-stone dark:prose-invert prose-lg max-w-none">
                <ReactMarkdown>{project.content}</ReactMarkdown>
            </article>
        </ScrollReveal>
      </section>
    </div>
  );
}
