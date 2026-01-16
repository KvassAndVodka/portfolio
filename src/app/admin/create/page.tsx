import { createPost } from '@/lib/actions';
import PostForm from '@/components/admin/PostForm';

export default async function CreatePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const filters = await searchParams;
    const type = (typeof filters.type === 'string' && (filters.type === 'PROJECT' || filters.type === 'BLOG')) 
        ? filters.type as 'PROJECT' | 'BLOG' 
        : 'BLOG';

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
            <PostForm 
                action={createPost} 
                submitLabel="Create Post" 
                initialData={{
                    title: '',
                    slug: '',
                    summary: '',
                    content: '',
                    type: type, // Pass the type from URL or default to BLOG
                    isPinned: false,
                    showAsBlog: false
                }}
            />
        </div>
    );
}