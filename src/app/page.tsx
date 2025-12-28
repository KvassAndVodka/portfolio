import { getProjects } from "@/lib/projects";
import Link from 'next/link';
import { FaDocker, FaPython, FaReact, FaGithub, FaLinkedin } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiPostgresql } from "react-icons/si";
import Image from "next/image";

// Reusable Section Header Component
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-10 pb-4 border-b border-stone-200 dark:border-white/10">
      <h2 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
        {title}
      </h2>
      {action}
    </div>
  );
}

export default function Home() {
  const projects = getProjects().slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-6">
      
            {/* ═══════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-32 border-b border-stone-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
          
          {/* Left: Text Content */}
          <div className="space-y-8 flex-1">
            <div className="inline-block px-3 py-1.5 border border-stone-300 dark:border-white/20 rounded-full text-xs font-mono text-stone-500 uppercase tracking-widest">
              ⚫ Available for work
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-stone-950 dark:text-stone-50">
              Javier Raut
            </h1>
            
            <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
              <span className="text-stone-950 dark:text-stone-200 font-semibold">Systems Engineer.</span>{" "}
              I build high-performance infrastructure and resilient applications.
              Specializing in AI solutions and bare-metal deployments.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/work" className="bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 px-8 py-4 rounded-lg font-medium hover:opacity-80 transition">
                View Deployments
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="border border-stone-300 dark:border-white/20 px-8 py-4 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition flex items-center gap-2">
                <FaGithub /> GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="border border-stone-300 dark:border-white/20 px-4 py-4 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-transparent blur-2xl"></div>
            <Image
              src="/javier-raut-hero.png"
              alt="Javier Raut"
              fill
              className="object-cover rounded-full border-2 border-stone-200 dark:border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
              priority
            />
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* STATS SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 border-b border-stone-200 dark:border-white/10">
        <SectionHeader title="By The Numbers" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Experience", value: "3+ Years" },
            { label: "Projects Completed", value: "12+" },
            { label: "Systems Deployed", value: "8+" },
            { label: "Uptime", value: "99.9%" }
          ].map(stat => (
            <div key={stat.label} className="p-6 bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/10 rounded-xl">
              <div className="text-4xl font-bold font-mono tracking-tighter text-stone-900 dark:text-stone-100">{stat.value}</div>
              <div className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* TECH STACK SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 border-b border-stone-200 dark:border-white/10">
        <SectionHeader title="Technical Arsenal" />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {[
            { icon: FaDocker, name: "Docker" },
            { icon: SiNextdotjs, name: "Next.js" },
            { icon: SiTypescript, name: "TypeScript" },
            { icon: FaPython, name: "Python" },
            { icon: SiPostgresql, name: "Postgres" },
            { icon: SiTailwindcss, name: "Tailwind" },
            { icon: FaReact, name: "React" },
            { icon: FaGithub, name: "CI/CD" },
          ].map(Tech => (
            <div key={Tech.name} className="aspect-square flex flex-col items-center justify-center bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/5 rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-300 group cursor-default">
              <Tech.icon size={28} className="text-stone-400 group-hover:text-[var(--accent)] transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURED WORK SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20">
        <SectionHeader 
          title="Featured Systems" 
          action={<Link href="/work" className="text-xs text-stone-500 hover:text-[var(--accent)] transition-colors uppercase tracking-wider">View All →</Link>}
        />
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => (
            <div key={project.slug} className="group relative bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-stone-300 dark:hover:border-white/20 transition-all">
              <div className="p-8 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-stone-100 group-hover:text-[var(--accent)] transition-colors">{project.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-8 flex-1">{project.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(0, 3).map(tech => (
                    <span key={tech} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white dark:bg-white/5 rounded text-stone-500">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}