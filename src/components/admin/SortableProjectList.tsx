"use client";

import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FaArrowUpRightFromSquare, FaGripVertical, FaMagnifyingGlass, FaThumbtack } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { MoveToTrashButton } from "@/components/admin/DeleteButton";
import { toast } from "@/components/admin/Toaster";
import { toggleProjectPin, updateProjectOrder } from "@/lib/actions";
import AdminTabs from "@/components/admin/AdminTabs";

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

const pad = (n: number) => String(n).padStart(2, "0");

const healthChecks = new Map<string | undefined, (project: Project) => boolean>([
  ["thumbnail", (project) => !project.thumbnail],
  ["links", (project) => !project.githubUrl && !project.demoUrl && !project.projectUrl],
]);

type SortableProjectListProps = Readonly<{
  initialProjects: readonly Project[];
  initialHealth?: string;
}>;

type SortableRowProps = Readonly<{
  project: Project;
  position: number;
  disabled: boolean;
}>;

export default function SortableProjectList({ initialProjects, initialHealth }: SortableProjectListProps) {
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
    const matchesHealth = healthChecks.get(initialHealth)?.(project) ?? true;
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
      toast("New order is live", { label: "Home page" });
      router.refresh();
    } catch {
      setItems(previous);
      setMessage("The order could not be saved. Refresh and try again.");
      toast("Couldn't save the order", { tone: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  const allProjects = filtered.length > 0
    ? <ol aria-label="Projects" className="admin-list-swap">{filtered.map((project, index) => <ProjectRow key={project.id} project={project} position={index + 1} />)}</ol>
    : <EmptyProjects message={initialProjects.length ? "No projects match these filters." : "Create your first project to start building the portfolio."} />;

  return (
    <>
      <div className="flex flex-col-reverse gap-4 border-b border-[var(--line)] md:flex-row md:items-center md:justify-between">
        <AdminTabs
          label="Project view"
          value={view}
          onChange={setView}
          options={[{ value: "manage", text: "All projects", count: initialProjects.length }, { value: "homepage", text: "Home page order", count: items.length }]}
        />
        {view === "manage" && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row md:mb-2 md:mt-0">
            <label className="relative"><span className="sr-only">Search projects</span><FaMagnifyingGlass className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" /><input className="admin-field !pl-9 md:w-64" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search projects" /></label>
            <label><span className="sr-only">Filter by status</span><select className="admin-select" value={status} onChange={(event) => setStatus(event.currentTarget.value)}><option value="ALL">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Drafts</option><option value="SCHEDULED">Scheduled</option></select></label>
          </div>
        )}
      </div>

      {view === "homepage" ? (
        <section aria-labelledby="homepage-order-heading" className="admin-list-swap pt-8">
          <h2 id="homepage-order-heading" className="admin-section-title">Featured on the home page</h2>
          <p className="site-muted mt-2 max-w-[60ch]">Drag projects into the order a recruiter should see them. With a keyboard, focus a handle, press Space, then use the arrow keys.</p>
          <p className="admin-label site-muted mt-3 min-h-5" aria-live="polite">{message || `${items.length} featured`}</p>
          {items.length > 0 ? <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}><ol className="mt-4 border-t border-[var(--line)]">{items.map((project, index) => <SortableRow key={project.id} project={project} position={index + 1} disabled={isSaving} />)}</ol></SortableContext></DndContext> : <EmptyProjects message="Feature a project from All projects to add it here." />}
        </section>
      ) : allProjects}
    </>
  );
}

function SortableRow({ project, position, disabled }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id, disabled });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-dragging={isDragging || undefined} className="admin-sortable-row flex min-h-16 items-center gap-3 border-b border-[var(--line)] bg-[var(--background)] py-3">
      <button type="button" {...attributes} {...listeners} disabled={disabled} className="admin-icon-button cursor-grab active:cursor-grabbing" aria-label={`Move ${project.title}`}><FaGripVertical aria-hidden="true" /></button>
      <span className="admin-index w-8">{pad(position)}</span>
      <div className="min-w-0 flex-1"><p className="truncate font-semibold">{project.title}</p><p className={`admin-status admin-status-${project.status.toLowerCase()} mt-1`}>{project.status.toLowerCase()}</p></div>
      <Link href={`/admin/projects/${project.slug}`} className="admin-button-secondary">Edit</Link>
    </li>
  );
}

function ProjectRow({ project, position }: Readonly<{ project: Project; position: number }>) {
  return (
    <li data-reveal className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-[var(--line)] py-7 md:grid-cols-[3rem_5rem_minmax(0,1fr)_auto]">
      <span className="admin-index pt-1.5">{pad(position)}</span>
      {project.thumbnail ? (
        <div className="admin-subtle relative hidden aspect-[4/3] w-20 overflow-hidden rounded-[2px] md:block"><Image src={project.thumbnail} alt="" fill sizes="5rem" unoptimized className="object-cover" /></div>
      ) : (
        <div className="admin-label site-muted hidden aspect-[4/3] w-20 place-items-center rounded-[2px] border border-dashed border-[var(--line-strong)] !text-[0.5625rem] md:grid">No image</div>
      )}
      <div className="min-w-0">
        <Link href={`/admin/projects/${project.slug}`} className="text-[clamp(1.2rem,2vw,1.55rem)] font-[620] leading-tight tracking-[-0.03em] hover:text-[var(--accent)]">{project.title}</Link>
        {project.summary && <p className="site-muted mt-2 line-clamp-2 max-w-[65ch] leading-[1.7]">{project.summary}</p>}
        <p className="admin-label site-muted mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <span className={`admin-status admin-status-${project.status.toLowerCase()}`}>{project.status.toLowerCase()}</span>
          {project.isPinned && <span className="text-[var(--accent)]">Featured</span>}
          <span>{project.category || "Uncategorized"}</span>
          <span>edited {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
        </p>
      </div>
      <div className="col-start-2 flex items-center gap-1 md:col-start-auto md:self-start">
        <Link href={`/admin/projects/${project.slug}`} className="admin-button-secondary">Edit</Link>
        <form action={async () => { await toggleProjectPin(project.id); toast(project.isPinned ? `${project.title} is off the home page` : `${project.title} is on the home page`, { label: "Home page" }); }}><button type="submit" aria-pressed={project.isPinned} className={`admin-icon-button ${project.isPinned ? "!text-[var(--accent)]" : ""}`} aria-label={project.isPinned ? `Remove ${project.title} from the home page` : `Feature ${project.title} on the home page`}><FaThumbtack aria-hidden="true" /></button></form>
        <a href={`/projects/${project.slug}`} target="_blank" className="admin-icon-button" aria-label={`Preview ${project.title} (opens in a new tab)`}><FaArrowUpRightFromSquare aria-hidden="true" /></a>
        <MoveToTrashButton id={project.id} />
      </div>
    </li>
  );
}

function EmptyProjects({ message }: Readonly<{ message: string }>) { return <div className="py-14"><p className="font-semibold">No projects to show</p><p className="site-muted mt-1">{message}</p></div>; }
