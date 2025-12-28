'use server'

import fs from 'fs';
import path from 'path';
import { auth } from './auth';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Unauthorized');
    }
}

export async function getFiles() {
    await checkAuth();

    const postsDir = path.join(CONTENT_ROOT, 'posts');
    const projectsDir = path.join(CONTENT_ROOT, 'projects');

    const readDirSafe = (dir: string) =>
        fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.mdx')) : [];

    return {
        posts: readDirSafe(postsDir).map(f => ({ name: f, path: `posts/${f}`})),
        projects: readDirSafe(projectsDir).map(f => ({ name: f, path: `projects/${f}`})),
    };
}

export async function getFileContent(relativePath: string) {
    await checkAuth();

    if (relativePath.includes('..')) throw new Error('Invalid path');

    const fullPath = path.join(CONTENT_ROOT, relativePath);
    return fs.readFileSync(fullPath, 'utf-8');
}

export async function saveFileContent(relativePath: string, content: string) {
    await checkAuth();

    if (relativePath.includes('..')) throw new Error('Invalid path');

    const fullPath = path.join(CONTENT_ROOT, relativePath);
    fs.writeFileSync(fullPath, content, 'utf-8');
    return { success: true };
}