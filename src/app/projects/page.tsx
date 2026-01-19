import { getProjects } from "@/lib/projects";
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import HeroBackground from "@/components/HeroBackground";

export default async function WorkPage() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen">
             {/* Simple Hero */}
             <section className="relative py-32 border-b border-stone-200 dark:border-white/10 overflow-hidden bg-stone-100 dark:bg-[#111]">
                 <HeroBackground />
                 <div className="max-w-5xl mx-auto px-6 relative z-10 pointer-events-none text-center md:text-left">
                     <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-stone-950 dark:text-stone-50">
                        Projects
                     </h1>
                     <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl mx-auto md:mx-0">
                        My collection of professional and personal projects that I have worked on from internships to personal projects.
                     </p>
                 </div>
             </section>

             {/* Projects Grid */}
             <section className="py-20 bg-stone-50 dark:bg-black">
                <ScrollReveal className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-1 gap-8">
                        {projects.map((project, index) => (
                            <Link key={project.slug} href={`/projects/${project.slug}`} className="block h-full">
                                <ProjectCard project={project} className="h-full" />
                            </Link>
                        ))}
                    </div>
                </ScrollReveal>
             </section>
        </div>
    );
}