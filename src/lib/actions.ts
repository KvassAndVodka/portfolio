'use server'

import { mediaUrl } from "@/lib/media";
import { prisma } from '@/lib/prisma';
import { PostStatus, PostType } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/require-admin';
import { applyRevision, revalidateContent, trashPost } from '@/lib/post-ops';
import { scheduleIndexNow, submitIndexNow, urlsForPost } from '@/lib/indexnow';
import { getPosts } from '@/lib/posts';
import { getProjects } from '@/lib/projects';
import { buildSitemap } from '@/lib/sitemap';

// Browsers submit form fields with CRLF line endings; store Markdown with LF so saving never rewrites a post.
function normalizeNewlines(value: FormDataEntryValue | null) {
    return (typeof value === 'string' ? value : '').replace(/\r\n?/g, '\n');
}

function formText(formData: FormData, name: string) {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
}

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
    await requireAdmin();
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
    const content = normalizeNewlines(formData.get('content'));
    const type = formData.get('type') as PostType;
    const requestedStatus = formData.get('status');
    const status = Object.values(PostStatus).includes(requestedStatus as PostStatus)
        ? requestedStatus as PostStatus
        : PostStatus.DRAFT;
    const scheduledFor = formText(formData, 'scheduledFor');
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
    const outcome = (formData.get('outcome') as string)?.trim().slice(0, 200) || null;
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
            projectUrl,
            outcome
        }
    });

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/notes');
    revalidatePath('/admin');
    revalidatePath('/admin/projects');
    revalidatePath('/admin/notes');
    revalidatePublicContent();
    if (status === PostStatus.PUBLISHED) {
        scheduleIndexNow(urlsForPost({ slug, type, showAsBlog }));
    }
    redirect(type === 'PROJECT' ? '/admin/projects' : '/admin/notes');
}

function chosenStatus(requested: FormDataEntryValue | null, current: PostStatus) {
    return Object.values(PostStatus).includes(requested as PostStatus) ? requested as PostStatus : current;
}

export async function updatePost(id: string, formData: FormData) {
    await requireAdmin();
    const existingPost = await prisma.post.findUniqueOrThrow({ where: { id } });
    const title = formData.get('title') as string;
    const slug = existingPost.revisionOfId ? existingPost.slug : formData.get('slug') as string;
    const summary = formData.get('summary') as string;
    const content = normalizeNewlines(formData.get('content'));
    const requestedStatus = formData.get('status');
    // A staged edit stays a draft under its own slug; choosing Published applies it to the live post below.
    const isRevision = existingPost.revisionOfId !== null;
    const publishRevision = isRevision && requestedStatus === PostStatus.PUBLISHED;
    const status = isRevision ? PostStatus.DRAFT : chosenStatus(requestedStatus, existingPost.status);
    const scheduledFor = formText(formData, 'scheduledFor');
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
    const outcome = (formData.get('outcome') as string)?.trim().slice(0, 200) || null;
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
                projectUrl,
                outcome
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
    revalidatePath('/admin');
    revalidatePath(`/admin/${existingPost.type === PostType.PROJECT ? 'projects' : 'notes'}`);
    revalidatePath(`/admin/${existingPost.type === PostType.PROJECT ? 'projects' : 'notes'}/${slug}`);
    revalidatePublicContent();

    if (publishRevision) {
        const live = await applyRevision(await prisma.post.findUniqueOrThrow({ where: { id } }));
        revalidateContent(live.slug);
        scheduleIndexNow(urlsForPost(live));
        redirect(`/admin/${live.type === PostType.PROJECT ? 'projects' : 'notes'}/${live.slug}`);
    }

    if (status === PostStatus.PUBLISHED || existingPost.status === PostStatus.PUBLISHED) {
        scheduleIndexNow(
            urlsForPost(
                { slug, type: existingPost.type, showAsBlog: showAsBlog || existingPost.showAsBlog },
                existingPost.slug,
            ),
        );
    }
}

export async function deletePost(id: string) {
    await requireAdmin();
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return;

    // Soft delete, unpinned so it leaves no gap in the home page order.
    await trashPost(post);

    revalidatePath('/admin/projects');
    revalidatePath('/admin/archives');
    revalidatePath('/admin/notes');
    revalidatePath('/admin/trash');
    revalidatePublicContent();
    if (post.status === PostStatus.PUBLISHED) {
        scheduleIndexNow(urlsForPost(post));
    }
}

export async function restorePost(id: string) {
    await requireAdmin();
    const restored = await prisma.post.update({
        where: { id },
        data: { deletedAt: null }
    });

    revalidatePath('/admin/projects');
    revalidatePath('/admin/archives');
    revalidatePath('/admin/notes');
    revalidatePath('/admin/trash');
    revalidatePublicContent();
    if (restored.status === PostStatus.PUBLISHED) {
        scheduleIndexNow(urlsForPost(restored));
    }
}

export async function permanentDeletePost(id: string) {
    await requireAdmin();
    await prisma.post.delete({ where: { id } });
    revalidatePath('/admin/trash');
    revalidatePublicContent();
}

export async function toggleProjectPin(id: string) {
    await requireAdmin();
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
    await requireAdmin();
    const project = await prisma.post.findUnique({ where: { id } });
    if (!project?.isPinned || project.pinnedOrder === null) return;

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
    await requireAdmin();
    revalidatePath('/', 'layout');
}

export async function submitSitemapToIndexNow() {
    await requireAdmin();
    const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
    const urls = buildSitemap(projects, posts).map((entry) => entry.url);
    return submitIndexNow(urls);
}

export async function updateProjectOrder(orderedIds: string[]) {
    await requireAdmin();
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
    await requireAdmin();
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
        url: mediaUrl(m.id, m.mimeType),
        createdAt: m.createdAt.toISOString()
    }));
}
