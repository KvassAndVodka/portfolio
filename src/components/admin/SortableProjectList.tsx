'use client';

import { useState } from 'react';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent 
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaEdit, FaTrash, FaThumbtack, FaGripVertical, FaEye } from 'react-icons/fa';
import Link from 'next/link';
import { format } from 'date-fns';
import { updateProjectOrder } from '@/lib/actions'; // We will need to create this
import { useEffect } from 'react';

// Types matches prisma output roughly
interface Project {
    id: string;
    title: string;
    slug: string;
    techStack: string[];
    publishedAt: Date | string;
    isPinned: boolean;
    pinnedOrder: number | null;
}

export default function SortableProjectList({ initialProjects }: { initialProjects: Project[] }) {
    // We only want to sort PINNED projects usually, or maybe all?
    // The previous UI implied sorting was for pinned items: "Order" column in table.
    // Let's assume we are sorting PINNED items at the top, and unpinned below?
    // OR, if the user wants to sort EVERYTHING, we need a unified order field.
    // Based on previous code: `orderBy: [{ isPinned: 'desc' }, { pinnedOrder: 'asc' }, { publishedAt: 'desc' }]`
    // This suggests Pinned items have an order, others fall back to date.
    
    // Strategy: Only PINNED items are sortable. Unpinned items are just listed below.
    const pinnedProjects = initialProjects.filter(p => p.isPinned);
    const unpinnedProjects = initialProjects.filter(p => !p.isPinned);

    const [items, setItems] = useState(pinnedProjects);

    // Sync state when props change (e.g. after server revalidation)
    
    useEffect(() => {
        setItems(initialProjects.filter(p => p.isPinned));
    }, [initialProjects]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                
                const newOrder = arrayMove(items, oldIndex, newIndex);
                
                // Optimistic UI update done, now persist
                // We need to sending the ID and its NEW INDEX to the server
                // Or easier: send the whole list of IDs in their new order
                const orderedIds = newOrder.map(p => p.id);
                updateProjectOrder(orderedIds); // Server action to implement

                return newOrder;
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Pinned Projects Section */}
            {items.length > 0 && (
                 <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                        <FaThumbtack /> Pinned Projects (Drag to Reorder)
                    </h2>
                    
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={items.map(p => p.id)} 
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid gap-4">
                                {items.map((project) => (
                                    <SortableProjectItem key={project.id} project={project} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* Unpinned Projects Section */}
            {unpinnedProjects.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 pt-8 border-t border-stone-200 dark:border-white/10">
                        Other Projects
                    </h2>
                    <div className="grid gap-4">
                        {unpinnedProjects.map((project) => (
                            <ProjectItem key={project.id} project={project} isSortable={false} />
                        ))}
                    </div>
                </div>
            )}
             
             {initialProjects.length === 0 && (
                <div className="text-center py-20 rounded-2xl border border-dashed border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/5">
                    <p className="text-stone-500 mb-4">No projects yet.</p>
                </div>
             )}
        </div>
    );
}

// Drag & Drop wrapper
function SortableProjectItem({ project }: { project: Project }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
             <ProjectItem project={project} isSortable={true} dragHandleProps={listeners} />
        </div>
    );
}

import { deletePost, toggleProjectPin } from '@/lib/actions';

// ... (other imports)

// UI Card
function ProjectItem({ project, isSortable, dragHandleProps }: { project: Project, isSortable: boolean, dragHandleProps?: any }) {
    const deleteAction = deletePost.bind(null, project.id);
    
    return (
        <div className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 hover:border-[var(--accent)]/30 transition-all ${project.isPinned ? 'ring-1 ring-[var(--accent)]/20 bg-[var(--accent)]/[0.02]' : ''}`}>
            
            {/* Drag Handle / Pin Status */}
            <div className="flex items-center gap-3 self-start md:self-center pr-2 border-r border-stone-100 dark:border-white/5 mr-0 md:mr-2">
                {isSortable ? (
                     <button 
                        {...dragHandleProps}
                        className="p-2 text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 cursor-grab active:cursor-grabbing"
                        title="Drag to reorder"
                    >
                        <FaGripVertical />
                    </button>
                ) : (
                    <div className="p-2 w-8" /> // Spacer
                )}
                
                <form action={toggleProjectPin.bind(null, project.id)}>
                     <button className={`p-2 transition-all ${project.isPinned ? 'text-[var(--accent)]' : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400'}`}>
                         <FaThumbtack size={12} className={project.isPinned ? 'rotate-45' : ''} />
                     </button>
                 </form>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[var(--accent)] transition-colors">
                        {project.title}
                    </h3>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                    {project.techStack.map(tech => (
                        <span key={tech} className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-400 text-xs font-medium border border-stone-200 dark:border-white/5">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Meta & Actions */}
             <div className="flex flex-col md:flex-row items-end md:items-center gap-4 self-end md:self-center">
                <span className="text-xs font-mono text-stone-400">
                    {format(new Date(project.publishedAt), 'MMM dd, yyyy')}
                </span>
                
                <div className="flex items-center gap-2">
                    <Link 
                        href={`/projects/${project.slug}`}
                        className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                        title="View Live"
                        target="_blank"
                    >
                         <FaEye size={16} />
                    </Link>
                    <Link 
                        href={`/admin/projects/${project.slug}`}
                        className="p-2 text-stone-400 hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                        title="Edit"
                    >
                        <FaEdit size={16} />
                    </Link>
                    
                     <form action={deleteAction}>
                        <button className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                            <FaTrash size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
