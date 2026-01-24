'use client';

import { useState } from 'react';
import { FaTrash, FaUndo, FaTrashRestore } from 'react-icons/fa';
import { deletePost, restorePost, permanentDeletePost } from '@/lib/actions';

interface DeleteButtonProps {
    id: string;
    isTrash?: boolean;
}

export default function DeleteButton({ id, isTrash = false }: DeleteButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const message = isTrash 
            ? "Are you sure you want to PERMANENTLY delete this? This action cannot be undone."
            : "Are you sure you want to move this to the trash?";

        if (window.confirm(message)) {
            if (isTrash) {
                await permanentDeletePost(id);
            } else {
                await deletePost(id);
            }
        }
    };

    const handleRestore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (window.confirm("Restore this item?")) {
            await restorePost(id);
        }
    };

    if (isTrash) {
        return (
            <div className="flex items-center gap-2">
                <form onSubmit={handleRestore}>
                     <button 
                        type="submit"
                        className="p-2 text-stone-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20" 
                        title="Restore"
                    >
                        <FaUndo size={16} />
                    </button>
                </form>
                <form onSubmit={handleDelete}>
                    <button 
                        type="submit"
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" 
                        title="Delete Forever"
                    >
                        <FaTrash size={16} />
                    </button>
                </form>
            </div>
        );
    }

    return (
        <form onSubmit={handleDelete}>
            <button 
                type="submit"
                className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" 
                title="Move to Trash"
            >
                <FaTrash size={16} />
            </button>
        </form>
    );
}
