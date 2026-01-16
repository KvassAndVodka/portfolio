import Link from 'next/link';
import type { Project } from '@/lib/projects';

export default function ProjectCard({ project, className = "", style = {} }: { project: Project; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`group block h-full ${className}`} style={style}>
        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-[var(--accent)] hover:shadow-[0_0_20px_-5px_var(--accent)] transition-all duration-300 h-full flex flex-col">
            {/* Thumbnail */}
            {project.thumbnail ? (
                <div className="relative h-48 w-full overflow-hidden border-b border-stone-100 dark:border-white/5">
                    <img 
                        src={project.thumbnail} 
                        alt={project.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    />
                     {project.category && (
                        <div className="absolute top-4 left-4">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold shadow-lg ${
                                project.category === 'professional' ? 'bg-blue-500 text-white' :
                                project.category === 'personal' ? 'bg-green-500 text-white' :
                                'bg-purple-500 text-white'
                            }`}>
                                {project.category}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                /* Fallback layout if no thumbnail (similar to before but adapted) */
               <div className="h-2 bg-[var(--accent)] opacity-20 group-hover:opacity-100 transition-opacity" />
            )}

            <div className="p-8 flex flex-col flex-1">
                 {/* Show category here if no thumbnail */}
                {!project.thumbnail && project.category && (
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full w-fit mb-4 ${
                        project.category === 'professional' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        project.category === 'personal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                        {project.category}
                    </span>
                )}
                
                <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-stone-100 group-hover:text-[var(--accent)] dark:group-hover:text-[var(--accent)] transition-colors">
                    {project.title}
                </h3>
                
                <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {project.summary}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-white/5 rounded text-stone-500">
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 3 && <span className="text-[10px] text-stone-400 self-center">+{project.techStack.length - 3}</span>}
                </div>
            </div>
        </div>
    </div>
  );
}
