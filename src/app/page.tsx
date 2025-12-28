import { getProjects } from "@/lib/projects";
import Link from 'next/link';
import Image from 'next/image';
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram, FaEnvelope, FaPython, FaDocker, FaLinux } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiPostgresql, SiOpencv, SiJavascript, SiSupabase, SiProxmox } from "react-icons/si";

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

export default function Home() {
  const projects = getProjects().slice(0, 2);

  return (
    <div>
      
      {/* HERO SECTION */}
      <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center border-b border-stone-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 animate-fade-in-up relative z-10">
            
            <div className="space-y-6 flex-1">
              <div className="inline-block px-3 py-1.5 border border-stone-300 dark:border-white/20 rounded-full text-xs font-mono text-stone-500 uppercase tracking-widest">
                Open to Opportunities
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-stone-950 dark:text-stone-50">
                Javier Raut
              </h1>
              
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
                <span className="text-stone-950 dark:text-stone-200 font-semibold">CS Student & AI Intern</span> with hands-on experience building real-time ML pipelines with YOLO and OpenVINO. Currently exploring self-hosted infrastructure on bare metal.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/work" className="bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 px-6 py-3 rounded-lg font-medium hover:opacity-80 transition">
                  View My Projects
                </Link>
                <a href="mailto:javier.raut@gmail.com" className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-80 transition">
                  Hire Me
                </a>
                <a href="https://github.com/KvassAndVodka" target="_blank" rel="noopener noreferrer" className="border border-stone-300 dark:border-white/20 px-4 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition flex items-center gap-2">
                  <FaGithub size={18} />
                </a>
                <a href="https://www.linkedin.com/in/raut-javier-m/" target="_blank" rel="noopener noreferrer" className="border border-stone-300 dark:border-white/20 px-4 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition">
                  <FaLinkedin size={18} />
                </a>
              </div>
            </div>

            <div className="relative w-64 h-64 md:w-72 md:h-72 flex-shrink-0">
              <Image
                src="/javier-raut-hero.png"
                alt="Javier Raut"
                fill
                className="object-cover rounded-full border-2 border-stone-200 dark:border-white/10"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* BACKGROUND SECTION */}
      <section className="py-20 bg-stone-100 dark:bg-[#111]">
        <div className="max-w-5xl mx-auto px-6">
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
        </div>
      </section>

      {/* SKILLS */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader title="Tech Stack" />
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">AI / Machine Learning</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: FaPython, name: "Python" },
                  { icon: SiOpencv, name: "OpenVINO" },
                  { icon: SiOpencv, name: "YOLO" },
                  { icon: SiOpencv, name: "PaddleOCR" },
                ].map(tech => (
                  <span key={tech.name} className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-white/5 rounded-full text-sm text-stone-700 dark:text-stone-300">
                    <tech.icon size={16} /> {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Backend / Infrastructure</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: FaDocker, name: "Docker" },
                  { icon: FaLinux, name: "Linux" },
                  { icon: SiProxmox, name: "Proxmox" },
                  { icon: SiPostgresql, name: "PostgreSQL" },
                  { icon: SiSupabase, name: "Supabase" },
                ].map(tech => (
                  <span key={tech.name} className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-white/5 rounded-full text-sm text-stone-700 dark:text-stone-300">
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
                  <span key={tech.name} className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-white/5 rounded-full text-sm text-stone-700 dark:text-stone-300">
                    <tech.icon size={16} /> {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-20 bg-stone-100 dark:bg-[#111]">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader 
            title="Projects" 
            action={<Link href="/work" className="text-xs text-stone-500 hover:text-[var(--accent)] transition-colors uppercase tracking-wider">View All →</Link>}
          />
<div className="grid md:grid-cols-2 gap-6">
  {projects.map((project, index) => (
    <Link key={project.slug} href={`/work`} className={`group block animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
      <div className="bg-white dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-stone-300 dark:hover:border-white/20 transition-all">
        <div className="p-8 h-full flex flex-col">
          {/* Category Badge */}
          {project.category && (
            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full w-fit mb-4 ${
              project.category === 'professional' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              project.category === 'personal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {project.category}
            </span>
          )}
          <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-stone-100 group-hover:text-[var(--accent)] transition-colors">{project.title}</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1">{project.summary}</p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 3).map(tech => (
              <span key={tech} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-white/5 rounded text-stone-500">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  ))}
</div>
        </div>
      </section>
      
      {/* CONTACT SECTION */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-stone-950 dark:text-stone-50">
              Let's Work Together
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              I'm open to internships, freelance projects, and collaboration opportunities.
            </p>
            
            <div className="flex justify-center gap-4 flex-wrap pt-4">
              <a href="mailto:javier.raut@gmail.com" className="flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-80 transition">
                <FaEnvelope size={18} /> Email Me
              </a>
              <a href="https://github.com/KvassAndVodka" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition">
                <FaGithub size={18} /> GitHub
              </a>
              <a href="https://linkedin.com/in/raut-javier-m" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition">
                <FaLinkedin size={18} /> LinkedIn
              </a>
              <a href="https://facebook.com/j.m.raut.29" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition">
                <FaFacebook size={18} /> Facebook
              </a>
              <a href="https://instagram.com/raut_javier" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-stone-300 dark:border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition">
                <FaInstagram size={18} /> Instagram
              </a>
            </div>
            
            <p className="text-xs text-stone-400 pt-16">
              © 2025 Javier Raut. Built with Next.js.
            </p>
          </div>
        </div>
      </section>
      
    </div>
  );
}