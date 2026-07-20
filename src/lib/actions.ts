'use server'

import { prisma } from '@/lib/prisma';
import { PostStatus, PostType } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

function revalidatePublicContent() {
    revalidateTag('projects', 'max');
    revalidateTag('notes', 'max');
}

async function getNextPinnedProjectOrder() {
    const result = await prisma.post.aggregate({
        _max: { pinnedOrder: true },
        where: { type: PostType.PROJECT, isPinned: true, deletedAt: null }
    });

    return (result._max.pinnedOrder ?? 0) + 1;
}

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
    const requestedStatus = formData.get('status');
    const status = Object.values(PostStatus).includes(requestedStatus as PostStatus)
        ? requestedStatus as PostStatus
        : PostStatus.DRAFT;
    const scheduledFor = String(formData.get('scheduledFor') || '');
    const publishedAt = status === PostStatus.SCHEDULED && scheduledFor
        ? new Date(scheduledFor)
        : new Date();
    const category = (formData.get('category') as string) || null;
    const isPinned = formData.get('isPinned') === 'on';
    const showAsBlog  = formData.get('showAsBlog') === 'on';
    const techStack = (formData.get('techStack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const thumbnail = (formData.get('thumbnail') as string) || null;
    const githubUrl = (formData.get('githubUrl') as string) || null;
    const demoUrl = (formData.get('demoUrl') as string) || null;
    const projectUrl = (formData.get('projectUrl') as string) || null;
    const shouldPinProject = type === PostType.PROJECT && isPinned;
    const pinnedOrder = shouldPinProject ? await getNextPinnedProjectOrder() : null;

    await prisma.post.create({
        data: {
            title,
            slug,
            summary,
            content,
            type,
            status,
            publishedAt,
            category,
            isPinned: shouldPinProject,
            pinnedOrder,
            showAsBlog,
            techStack,
            thumbnail,
            githubUrl,
            demoUrl,
            projectUrl
        }
    });

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/notes');
    revalidatePublicContent();
    redirect(type === 'PROJECT' ? '/admin/projects' : '/admin/notes');
}

export async function updatePost(id: string, formData: FormData) {
    const existingPost = await prisma.post.findUniqueOrThrow({ where: { id } });
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const summary = formData.get('summary') as string;
    const content = formData.get('content') as string;
    const requestedStatus = formData.get('status');
    const status = Object.values(PostStatus).includes(requestedStatus as PostStatus)
        ? requestedStatus as PostStatus
        : existingPost.status;
    const scheduledFor = String(formData.get('scheduledFor') || '');
    const publishedAt = status === PostStatus.SCHEDULED && scheduledFor
        ? new Date(scheduledFor)
        : existingPost.publishedAt;
    const category = (formData.get('category') as string) || null;
    const isPinned = formData.get('isPinned') === 'on';
    const showAsBlog = formData.get('showAsBlog') === 'on';
    const techStack = (formData.get('techStack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const thumbnail = (formData.get('thumbnail') as string) || null;
    const githubUrl = (formData.get('githubUrl') as string) || null;
    const demoUrl = (formData.get('demoUrl') as string) || null;
    const projectUrl = (formData.get('projectUrl') as string) || null;
    const shouldPinProject = existingPost.type === PostType.PROJECT && isPinned;
    const wasPinnedProject = existingPost.type === PostType.PROJECT && existingPost.isPinned;
    const pinnedOrder = shouldPinProject
        ? existingPost.pinnedOrder ?? await getNextPinnedProjectOrder()
        : null;

    await prisma.$transaction([
        prisma.post.update({
            where : { id },
            data: {
                title,
                slug,
                summary,
                content,
                status,
                publishedAt,
                category,
                isPinned: shouldPinProject,
                pinnedOrder,
                showAsBlog,
                techStack,
                thumbnail,
                githubUrl,
                demoUrl,
                projectUrl
            }
        }),
        ...(!shouldPinProject && wasPinnedProject && existingPost.pinnedOrder !== null ? [
            prisma.post.updateMany({
                where: {
                    type: PostType.PROJECT,
                    isPinned: true,
                    pinnedOrder: { gt: existingPost.pinnedOrder }
                },
                data: { pinnedOrder: { decrement: 1 } }
            })
        ] : [])
    ]);

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/notes');
    revalidatePath(`/projects/${slug}`);
    revalidatePath(`/notes/${slug}`);
    revalidatePath(`/admin/${existingPost.type === PostType.PROJECT ? 'projects' : 'notes'}/${slug}`);
    revalidatePublicContent();
}

export async function deletePost(id: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return;

    // Soft delete: just set deletedAt
    await prisma.post.update({
        where: { id },
        data: { deletedAt: new Date() }
    });

    // If pinned, we might want to unpin it so it doesn't leave a gap or stay in the pinned list?
    // Let's unpin it to be safe and clean up order.
    if (post.isPinned && post.pinnedOrder) {
        await prisma.post.updateMany({
            where: {
                isPinned: true,
                pinnedOrder: { gt: post.pinnedOrder }
            },
            data: {
                pinnedOrder: { decrement: 1 }
            }
        });
        // Also update the post itself to not be pinned anymore in the background
        await prisma.post.update({
            where: { id },
            data: { isPinned: false, pinnedOrder: null }
        });
    }

    revalidatePath('/admin/projects');
    revalidatePath('/admin/archives');
    revalidatePath('/admin/notes');
    revalidatePath('/admin/trash');
    revalidatePublicContent();
}

export async function restorePost(id: string) {
    await prisma.post.update({
        where: { id },
        data: { deletedAt: null }
    });

    revalidatePath('/admin/projects');
    revalidatePath('/admin/archives');
    revalidatePath('/admin/notes');
    revalidatePath('/admin/trash');
    revalidatePublicContent();
}

export async function permanentDeletePost(id: string) {
    await prisma.post.delete({ where: { id } });
    revalidatePath('/admin/trash');
    revalidatePublicContent();
}

export async function toggleProjectPin(id: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.type !== PostType.PROJECT || post.deletedAt) return;

    const newPinnedState = !post.isPinned;

    if (newPinnedState) {
        // Pinning: Add to end of list
        const maxOrder = await prisma.post.aggregate({
            _max: { pinnedOrder: true },
            where: { type: PostType.PROJECT, isPinned: true, deletedAt: null }
        });
        const nextOrder = (maxOrder._max.pinnedOrder || 0) + 1;

        await prisma.post.update({
            where: { id },
            data: { isPinned: true, pinnedOrder: nextOrder }
        });
    } else {
        // Unpinning: Remove order and shift others
        const currentOrder = post.pinnedOrder;
        
        await prisma.$transaction([
            prisma.post.update({
                where: { id },
                data: { isPinned: false, pinnedOrder: null }
            }),
            ...(currentOrder ? [
                prisma.post.updateMany({
                    where: {
                        type: PostType.PROJECT,
                        isPinned: true,
                        pinnedOrder: { gt: currentOrder }
                    },
                    data: {
                        pinnedOrder: { decrement: 1 }
                    }
                })
            ] : [])
        ]);
    }
    revalidatePath('/admin/projects');
    revalidatePath('/');
    revalidatePublicContent();
}

export async function reorderProject(id: string, direction: 'up' | 'down') {
    const project = await prisma.post.findUnique({ where: { id } });
    if (!project || !project.isPinned || project.pinnedOrder === null) return;

    const currentOrder = project.pinnedOrder;
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find the adjacent project
    const swapProject = await prisma.post.findFirst({
        where: {
            type: PostType.PROJECT,
            isPinned: true,
            pinnedOrder: targetOrder
        }
    });

    if (swapProject) {
        // Swap orders
        await prisma.$transaction([
            prisma.post.update({
                where: { id: project.id },
                data: { pinnedOrder: targetOrder }
            }),
            prisma.post.update({
                where: { id: swapProject.id },
                data: { pinnedOrder: currentOrder }
            })
        ]);
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    revalidatePublicContent();
}

export async function revalidateAll() {
    revalidatePath('/', 'layout');
}

export async function updateProjectOrder(orderedIds: string[]) {
    const pinnedProjects = await prisma.post.findMany({
        where: { type: PostType.PROJECT, isPinned: true, deletedAt: null },
        select: { id: true }
    });
    const pinnedIds = new Set(pinnedProjects.map((project) => project.id));
    const hasEveryPinnedProject =
        orderedIds.length === pinnedIds.size &&
        new Set(orderedIds).size === orderedIds.length &&
        orderedIds.every((id) => pinnedIds.has(id));

    if (!hasEveryPinnedProject) {
        throw new Error('Pinned project order is stale. Refresh the page and try again.');
    }

    const updates = orderedIds.map((id, index) => {
        return prisma.post.update({
            where: { id, type: PostType.PROJECT, isPinned: true },
            data: { pinnedOrder: index + 1 }
        });
    });

    await prisma.$transaction(updates);

    revalidatePath('/admin/projects');
    revalidatePath('/');
    revalidatePublicContent();
}

export async function getRecentMedia() {
    const media = await prisma.media.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            filename: true,
            mimeType: true,
            createdAt: true
        }
    });
    
    // Serialize dates for client components
    return media.map(m => ({
        ...m,
        url: `/api/media/${m.id}`,
        createdAt: m.createdAt.toISOString()
    }));
}
