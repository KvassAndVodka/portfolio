import { getProjects } from "@/lib/projects";
import Link from 'next/link';
import Image from 'next/image';
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram, FaEnvelope, FaPython, FaDocker, FaLinux, FaGitAlt } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiPostgresql, SiOpencv, SiJavascript, SiSupabase, SiProxmox, SiGnubash } from "react-icons/si";
import HeroBackground from "@/components/HeroBackground";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";

// Reusable Section Header Component
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-12 pb-4 border-b border-stone-200 dark:border-white/10">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
        {title}
      </h2>
      {action}
    </div>
  );
}

export default async function Home() {
  const allProjects = await getProjects();
  // Show all pinned projects. If none are pinned, show the 3 most recent.
  const pinnedProjects = allProjects.filter(p => p.isPinned);
  const projects = pinnedProjects.length > 0 ? pinnedProjects : allProjects.slice(0, 3);

  return (
    <div>
      
      {/* HERO SECTION */}
      <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center border-b border-stone-200 dark:border-white/10 relative overflow-hidden py-24 md:py-0">
        <HeroBackground />
        
        <div className="max-w-5xl mx-auto px-6 w-full pointer-events-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 animate-fade-in-up relative z-10 pointer-events-auto bg-stone-100/80 dark:bg-[#0c0a09]/60 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-stone-200/50 dark:border-white/5 shadow-2xl shadow-stone-200/50 dark:shadow-black/50">
            {/* CONTENT */}
            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="space-y-6">
                <div className="inline-block px-3 py-1.5 border border-stone-300 dark:border-white/20 rounded-full text-xs font-mono text-stone-500 uppercase tracking-widest bg-white/50 dark:bg-black/20">
                  Open to Opportunities
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-stone-950 dark:text-stone-50">
                  Javier Raut
                </h1>
                
                <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed mx-auto md:mx-0">
                  <span className="text-stone-950 dark:text-stone-200 font-semibold">Software Engineer</span> from the Philippines specializing in <span className="text-stone-950 dark:text-stone-200">Backend Systems</span> and <span className="text-stone-950 dark:text-stone-200">Infrastructure</span>.
                  I aim for scalable and maintainable solutions, and conduct self-hosting as a hobby.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 pt-2 w-full md:w-auto">
                <Link href="/projects" className="bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 px-6 py-3 rounded-lg font-medium hover:opacity-80 transition w-full md:w-auto text-center">
                  View My Projects
                </Link>
                <a href="mailto:javier.raut@gmail.com" className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-80 transition w-full md:w-auto text-center">
                  Hire Me
                </a>
                <div className="flex gap-4 w-full md:w-auto">
                    <a href="https://github.com/KvassAndVodka" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none border border-stone-300 dark:border-white/20 px-4 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition flex items-center justify-center gap-2">
                      <FaGithub size={18} />
                    </a>
                    <a href="https://www.linkedin.com/in/raut-javier-m/" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none border border-stone-300 dark:border-white/20 px-4 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition flex items-center justify-center">
                      <FaLinkedin size={18} />
                    </a>
                </div>
              </div>
            </div>

            {/* PROFILE IMAGE */}
            <div className="relative group mx-auto md:mx-0 shrink-0">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-stone-100 dark:border-[#1c1917] shadow-2xl grayscale hover:grayscale-0 transition-all duration-500 z-10">
                <Image 
                  src="/javier-raut-hero.png" 
                  alt="Javier Raut" 
                  fill 
                  sizes="(max-width: 768px) 256px, 320px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BACKGROUND SECTION */}
      <section className="py-20 bg-stone-100 dark:bg-[#111] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <ScrollReveal className="max-w-5xl mx-auto px-6">
          <SectionHeader title="Background" />
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-300 dark:bg-white/10"></div>
            
            <div className="space-y-8">
              <div className="relative pl-12">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-[var(--accent)] ring-4 ring-stone-100 dark:ring-[#111]"></div>
                <span className="text-xs font-mono text-stone-400 block mb-2">Jun 2025 — Jul 2025</span>
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/10 rounded-xl">
                  <h3 className="font-bold text-stone-900 dark:text-stone-100">ML/AI Intern</h3>
                  <p className="text-sm text-[var(--accent)] font-medium mb-3">meldCX</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Built a real-time License Plate Recognition pipeline using YOLO, PaddleOCR & OpenVINO.
                    Packaged it into a scalable Docker container.
                  </p>
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-stone-400 ring-4 ring-stone-100 dark:ring-[#111]"></div>
                <span className="text-xs font-mono text-stone-400 block mb-2">Aug 2023 — Jun 2024</span>
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/10 rounded-xl">
                  <h3 className="font-bold text-stone-900 dark:text-stone-100">VP - Internal</h3>
                  <p className="text-sm text-[var(--accent)] font-medium mb-3">Computer Science Student Society (CS³)</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Founding member. Led the creation of Constitution & By-Laws. 
                    Achieved 100% completion of Annual Work & Financial Plan.
                  </p>
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-stone-300 ring-4 ring-stone-100 dark:ring-[#111]"></div>
                <span className="text-xs font-mono text-stone-400 block mb-2">Sep 2022 — Present</span>
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/10 rounded-xl">
                  <h3 className="font-bold text-stone-900 dark:text-stone-100">BS in Computer Science</h3>
                  <p className="text-sm text-[var(--accent)] font-medium mb-3">University of Science and Technology of Southern Philippines</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Specializing in AI-Driven Systems. DOST-SEI JLSS Scholar. 
                    Consistent Dean's Lister. Level 2 TOPCIT Certified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* SKILLS */}
      <section className="py-20 relative overflow-hidden bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        {/* Power Core Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_70%)] opacity-[0.12] dark:opacity-5 pointer-events-none"></div>
        <ScrollReveal className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader title="Tech Stack" />
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Backend & Infrastructure</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: FaPython, name: "Python" },
                  { icon: FaLinux, name: "Linux" },
                  { icon: FaDocker, name: "Docker" },
                  { icon: SiProxmox, name: "Proxmox" },
                  { icon: SiPostgresql, name: "PostgreSQL" },
                  { icon: SiSupabase, name: "Supabase" },
                ].map(tech => (
                  <span key={tech.name} className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200/80 dark:bg-white/5 border border-stone-300 dark:border-transparent rounded-full text-sm text-stone-800 dark:text-stone-300 font-medium">
                    <tech.icon size={16} /> {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Frontend</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: SiNextdotjs, name: "Next.js" },
                  { icon: SiTypescript, name: "TypeScript" },
                  { icon: SiJavascript, name: "JavaScript" },
                ].map(tech => (
                  <span key={tech.name} className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200/80 dark:bg-white/5 border border-stone-300 dark:border-transparent rounded-full text-sm text-stone-800 dark:text-stone-300 font-medium">
                    <tech.icon size={16} /> {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Specialized Tools & AI</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: SiOpencv, name: "OpenCV" },
                  { icon: SiOpencv, name: "YOLO" },
                  { icon: SiOpencv, name: "OpenVINO" },
                  { icon: SiOpencv, name: "PaddleOCR" },
                  { icon: FaGitAlt, name: "Git" },
                  { icon: SiGnubash, name: "Bash Scripting" },
                ].map(tech => (
                  <span key={tech.name} className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200/80 dark:bg-white/5 border border-stone-300 dark:border-transparent rounded-full text-sm text-stone-800 dark:text-stone-300 font-medium">
                    <tech.icon size={16} /> {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* PROJECTS */}
      <section className="py-20 bg-stone-200 dark:bg-black relative">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)] pointer-events-none"></div>
        <ScrollReveal className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader 
            title="Projects" 
            action={<Link href="/projects" className="text-xs text-stone-500 hover:text-[var(--accent)] transition-colors uppercase tracking-wider">View All →</Link>}
          />
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="block h-full">
                <ProjectCard project={project} className="h-full" />
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>
      
      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-stone-100 dark:bg-[#0c0a09]">
        <ScrollReveal className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-stone-950 dark:text-stone-50">
              Let's Work Together
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              I'm open to internships, freelance projects, and collaboration opportunities.
            </p>
            
            {/* Email - Full width mobile, Centered desktop */}
            <div className="flex justify-center pt-8 w-full md:w-auto">
              <a href="mailto:javier.raut@gmail.com" className="w-full md:w-auto flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-8 py-3 rounded-lg font-medium hover:opacity-80 transition shadow-lg shadow-orange-500/20">
                <FaEnvelope size={18} /> javier.raut@gmail.com
              </a>
            </div>

            {/* Socials - Stacked mobile, Row desktop */}
            <div className="flex flex-col md:flex-row justify-center gap-4 pt-4 w-full">
              <a href="https://github.com/KvassAndVodka" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition bg-white dark:bg-transparent">
                <FaGithub size={16} /> @KvassAndVodka
              </a>
              <a href="https://linkedin.com/in/raut-javier-m" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition bg-white dark:bg-transparent">
                <FaLinkedin size={16} /> @raut-javier-m
              </a>
              <a href="https://facebook.com/j.m.raut.29" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition bg-white dark:bg-transparent">
                <FaFacebook size={16} /> @j.m.raut.29
              </a>
              <a href="https://instagram.com/raut_javier" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition bg-white dark:bg-transparent">
                <FaInstagram size={16} /> @raut_javier
              </a>
            </div>
            
            <p className="text-xs text-stone-400 pt-16">
              © 2025 Javier Raut. Built with Next.js.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}