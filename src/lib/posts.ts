import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
    slug: string;
    title: string;
    publishedAt: string;
    summary: string;
    content: string;
}

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getPosts(): Post[] {
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf-8');
        
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title,
            publishedAt: data.publishedAt,
            summary: data.summary,
            content,
        };
    });

    return allPostsData.sort((a, b) => {
        if(a.publishedAt < b.publishedAt) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getPost(slug: string): Post {   
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(fileContents);

    return {
        slug,
        title: data.title,
        publishedAt: data.publishedAt,
        summary: data.summary,
        content,
    };
}