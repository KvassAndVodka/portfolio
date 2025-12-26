'use client';

import { useState} from 'react';
import type { Project } from '@/lib/projects';
import ReactMarkdown from 'react-markdown';

export default function WorkWrapper({ projects }: { projects: Project[] }) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    return (
        <>
            <div className=" grid">
                {projects.map((project) => (
                    <div key={project.slug} className="border border-stong-200 p-6 rounded-lg hover:border-stone-400 transition-colors">
                        <h3 className="text-x1 font-bold">{project.title}</h3>
                        <p className="text-stone-600 mt-2 mb-4">{project.summary}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.techStack.map(tech => (
                                <span key={tech} className="text-xs font-mono bg-stone-100 px-2 py-1 rounded">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <button
                                onClick={() => setSelectedProject(project)}
                                className="font-medium underline underline-offset-4 hover:text-blue-600"
                            >
                                View Brief
                            </button>

                            {project.blogSlug && (
                                <a href={`/blog/${project.blogSlug}`} className="text-stone-500 hover:text-black">
                                    Read Case Study →
                                </a>
                            )}
                        </div>
                    </div>
                ))}                
            </div>

            {selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProject(null)}>
                    <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                            <button onClick={() => setSelectedProject(null)} className="text-stone-400 hover:text-black">
                                ✕
                            </button>
                        </div>

                        <div className="prose prose-stone">
                            <ReactMarkdown>{selectedProject.content}</ReactMarkdown>
                        </div>

                        <div className="mt-8 flex gap-4 border-t pt-6">
                            {selectedProject.githubUrl && (
                                <a href={selectedProject.githubUrl} target="_blank" className="bg-black text-white px-5 py-2 rounded text-sm">
                                    Github Repo
                                </a>
                            )}
                            {selectedProject.blogSlug && (
                                <a href={`/blog/${selectedProject.blogSlug}`} className="border border-stone-300 px-4 py-2">
                                    Read Case Study
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
        
    )
}