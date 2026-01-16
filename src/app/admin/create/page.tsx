import { createPost } from '@/lib/actions';
import PostForm from '@/components/admin/PostForm';

export default function CreatePage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
            <PostForm action={createPost} submitLabel="Create Post" />
        </div>
    );
}