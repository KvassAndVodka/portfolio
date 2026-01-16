'use server'

import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string;
    let slug = formData.get('slug') as string;
    
    if (!slug) {
        // Auto-generate slug from title
        slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
            
        // Append timestamp if still empty or to generic (optional, but simple collision avoidance)
        // For now, let's keep it clean. If duplicate, DB will throw, we can handle it or let it fail for now.
    }
    const summary = formData.get('summary') as string;
    const content = formData.get('content') as string;
    const type = formData.get('type') as PostType;
    const category = formData.get('category') as string;
    const isPinned = formData.get('isPinned') === 'on';
    const showAsBlog  = formData.get('showAsBlog') === 'on';
    const techStack = (formData.get('techStack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];

    await prisma.post.create({
        data: {
            title,
            slug,
            summary,
            content,
            type,
            category,
            isPinned,
            showAsBlog,
            techStack,
        }
    });

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/archives');
    redirect(type === 'PROJECT' ? '/admin/projects' : '/admin/blogs');
}

export async function updatePost(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const summary = formData.get('summary') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const isPinned = formData.get('isPinned') === 'on';
    const showAsBlog = formData.get('showAsBlog') === 'on';
    const techStack = (formData.get('techStack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];

    await prisma.post.update({
        where : { id },
        data: {
            title,
            slug,
            summary,
            content,
            category,
            isPinned,
            showAsBlog,
            techStack,
        }
    });

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/archives');
    revalidatePath(`/projects/${slug}`);
    revalidatePath(`/archives/${slug}`);
}

export async function deletePost(id: string) {
    const post = await prisma.post.delete({
        where: { id }
    });

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/archives');
    return { success: true }
}