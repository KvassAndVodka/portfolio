import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Project {
    slug: string;
    title: string;
    summary: string;
    content: string;
    techStack: string[];
    githubUrl?: string;
    demoUrl?: string;
    projectUrl?: string;
    blogSlug?: string;
    category?: 'professional' | 'personal' | 'schoolwork';
}

const projectsDirectory = path.join(process.cwd(), 'content/projects');

export function getProjects(): Project[] {
    if (!fs.existsSync(projectsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(projectsDirectory);

    const allProjects = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(projectsDirectory,fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf-8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title,
            summary: data.summary,
            content: content,
            techStack: data.techStack || [],
            githubUrl: data.githubUrl,
            demoUrl: data.demoUrl,
            projectUrl: data.projectUrl,
            blogSlug: data.blogSlug,
            category: data.category,
        };
    });

    return allProjects.sort((a, b) => {
        if(a.slug < b.slug) {
            return 1;
        } else {
            return -1;
        }
    });
}