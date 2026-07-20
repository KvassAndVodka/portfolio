"use client";

import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FaArrowUpRightFromSquare, FaGripVertical, FaMagnifyingGlass, FaPencil, FaThumbtack } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleProjectPin, updateProjectOrder } from "@/lib/actions";

interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  techStack: string[];
  category: string | null;
  thumbnail: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  updatedAt: Date | string;
  isPinned: boolean;
  pinnedOrder: number | null;
  githubUrl: string | null;
  demoUrl: string | null;
  projectUrl: string | null;
}

export default function SortableProjectList({ initialProjects, initialHealth }: { initialProjects: Project[]; initialHealth?: string }) {
  const [view, setView] = useState<"manage" | "homepage">("manage");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [items, setItems] = useState(initialProjects.filter((project) => project.isPinned));
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const filtered = useMemo(() => initialProjects.filter((project) => {
    const matchesQuery = `${project.title} ${project.summary} ${project.techStack.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "ALL" || project.status === status;
    const matchesHealth = initialHealth === "thumbnail" ? !project.thumbnail : initialHealth === "links" ? !project.githubUrl && !project.demoUrl && !project.projectUrl : true;
    return matchesQuery && matchesStatus && matchesHealth;
  }), [initialHealth, initialProjects, query, status]);

  async function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id || isSaving) return;
    const oldIndex = items.findIndex((item) => item.id === event.active.id);
    const newIndex = items.findIndex((item) => item.id === event.over?.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setIsSaving(true);
    setMessage("Saving homepage order…");
    try {
      await updateProjectOrder(next.map((item) => item.id));
      setMessage("Homepage order saved.");
      router.refresh();
    } catch {
      setItems(previous);
      setMessage("The order could not be saved. Refresh and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex self-start rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1" role="group" aria-label="Project view">
          <button type="button" onClick={() => setView("manage")} aria-pressed={view === "manage"} className={`min-h-9 rounded-md px-4 text-sm font-medium ${view === "manage" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted"}`}>Manage</button>
          <button type="button" onClick={() => setView("homepage")} aria-pressed={view === "homepage"} className={`min-h-9 rounded-md px-4 text-sm font-medium ${view === "homepage" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted"}`}>Homepage order <span className="ml-1 tabular-nums">{items.length}</span></button>
        </div>
        {view === "manage" && <div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><span className="sr-only">Search projects</span><FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 admin-muted" aria-hidden="true" /><input className="admin-field min-w-64 !pl-9" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search projects" /></label><label><span className="sr-only">Filter by status</span><select className="admin-select" value={status} onChange={(event) => setStatus(event.currentTarget.value)}><option value="ALL">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Drafts</option><option value="SCHEDULED">Scheduled</option></select></label></div>}
      </div>

      {view === "homepage" ? (
        <section className="admin-panel overflow-hidden" aria-labelledby="homepage-order-heading">
          <div className="border-b border-[var(--admin-border)] px-5 py-4"><h2 id="homepage-order-heading" className="admin-section-title">Homepage bento order</h2><p className="mt-1 text-sm admin-muted">Drag featured projects into the order recruiters should see them. Keyboard reordering is supported.</p><p className="mt-2 min-h-5 text-xs admin-muted" aria-live="polite">{message || `${items.length} featured projects`}</p></div>
          {items.length > 0 ? <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}><ol className="divide-y divide-[var(--admin-border)]">{items.map((project, index) => <SortableRow key={project.id} project={project} position={index + 1} disabled={isSaving} />)}</ol></SortableContext></DndContext> : <EmptyProjects message="Feature a project from the Manage view to add it here." />}
        </section>
      ) : (
        <section className="admin-panel overflow-hidden" aria-label="Projects">
          {filtered.length > 0 ? <ul className="divide-y divide-[var(--admin-border)]">{filtered.map((project) => <ProjectRow key={project.id} project={project} />)}</ul> : <EmptyProjects message={initialProjects.length ? "No projects match these filters." : "Create your first project to start building the portfolio."} />}
        </section>
      )}
    </div>
  );
}

function SortableRow({ project, position, disabled }: { project: Project; position: number; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id, disabled });
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 }} className="flex min-h-16 items-center gap-3 px-4 py-3"><span className="w-6 text-sm font-semibold tabular-nums admin-muted">{position}</span><button type="button" {...attributes} {...listeners} disabled={disabled} className="admin-icon-button cursor-grab active:cursor-grabbing" aria-label={`Move ${project.title}`}><FaGripVertical aria-hidden="true" /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{project.title}</p><p className="mt-0.5 text-xs admin-muted">{project.status.toLowerCase()}</p></div><Link href={`/admin/projects/${project.slug}`} className="admin-button-secondary">Edit</Link></li>;
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center md:px-5">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="admin-subtle relative hidden size-16 shrink-0 overflow-hidden rounded-lg sm:block">{project.thumbnail && <Image src={project.thumbnail} alt="" fill sizes="4rem" unoptimized className="object-cover" />}</div>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/admin/projects/${project.slug}`} className="truncate font-semibold hover:text-[var(--accent-hover)]">{project.title}</Link><span className={`admin-status admin-status-${project.status.toLowerCase()}`}>{project.status.toLowerCase()}</span>{project.isPinned && <span className="admin-status bg-[var(--accent-soft)] text-[var(--accent-hover)]"><FaThumbtack aria-hidden="true" />Featured</span>}</div><p className="mt-1 line-clamp-1 text-sm admin-muted">{project.summary}</p><p className="mt-2 text-xs admin-muted">{project.category || "Uncategorized"} · edited {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</p></div>
      </div>
      <div className="flex items-center justify-end gap-1">
        <form action={toggleProjectPin.bind(null, project.id)}><button type="submit" className="admin-icon-button" aria-label={project.isPinned ? `Remove ${project.title} from homepage` : `Feature ${project.title} on homepage`}><FaThumbtack aria-hidden="true" /></button></form>
        <a href={`/projects/${project.slug}`} target="_blank" className="admin-icon-button" aria-label={`Preview ${project.title}`}><FaArrowUpRightFromSquare aria-hidden="true" /></a>
        <Link href={`/admin/projects/${project.slug}`} className="admin-icon-button" aria-label={`Edit ${project.title}`}><FaPencil aria-hidden="true" /></Link>
        <DeleteButton id={project.id} />
      </div>
    </li>
  );
}

function EmptyProjects({ message }: { message: string }) { return <div className="px-5 py-12"><p className="font-medium">No projects to show</p><p className="mt-1 text-sm admin-muted">{message}</p></div>; }
