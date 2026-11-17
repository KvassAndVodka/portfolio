import crypto from "node:crypto";

export const MAX_DRAFT_BODY_BYTES = 100_000;

export type DraftType = "BLOG" | "PROJECT";

export interface DraftInput {
  type: DraftType;
  weekId?: string;
  slug?: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  techStack?: string[];
  githubUrl?: string;
  demoUrl?: string;
  projectUrl?: string;
  outcome?: string;
}

// The length check reveals only the token length, which is public for a random hex token.
export function isValidDraftToken(header: string | null, expected: string | undefined) {
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted);
}

export type TokenRole = "owner" | "drafts";

/**
 * Which machine role a request carries. The drafts token (the weekly job) writes drafts and adds media;
 * the owner token also publishes, stages edits of live posts, and trashes posts.
 */
export function tokenRole(header: string | null): TokenRole | null {
  if (isValidDraftToken(header, process.env.CONTENT_OWNER_TOKEN)) return "owner";
  if (isValidDraftToken(header, process.env.DRAFTS_API_TOKEN)) return "drafts";
  return null;
}

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max ? value.trim() : null;
}

// Optional fields return undefined when absent, a string when valid, and null when the value is wrong.
function bounded(value: unknown, max: number) {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, max);
}

function href(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.length > 500) return null;
  try {
    return new URL(value).protocol === "https:" ? value.trim() : null;
  } catch {
    return null;
  }
}

function technologies(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.length > 24) return null;
  const items = value.map((entry) => text(entry, 40));
  return items.every(Boolean) ? (items as string[]) : null;
}

function slugText(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  return typeof value === "string" && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : null;
}

export function parseDraftInput(payload: unknown): DraftInput | null {
  if (!payload || typeof payload !== "object") return null;
  const fields = payload as Record<string, unknown>;
  const type =
    fields.type === undefined || fields.type === "BLOG"
      ? "BLOG"
      : fields.type === "PROJECT"
        ? "PROJECT"
        : null;
  if (!type) return null;

  const title = text(fields.title, 120);
  const summary = text(fields.summary, 300);
  const content = text(fields.content, 50_000);
  if (!title || !summary || !content) return null;

  if (type === "BLOG") {
    const weekId = typeof fields.weekId === "string" && /^\d{4}-W\d{2}$/.test(fields.weekId) ? fields.weekId : null;
    return weekId ? { type, weekId, title, summary, content } : null;
  }

  // A project draft carries the evidence the case-study page shows: card line, stack and links.
  const slug = slugText(fields.slug);
  const category = bounded(fields.category, 60);
  const outcome = bounded(fields.outcome, 200);
  const githubUrl = href(fields.githubUrl);
  const demoUrl = href(fields.demoUrl);
  const projectUrl = href(fields.projectUrl);
  const techStack = technologies(fields.techStack);
  if ([slug, category, outcome, githubUrl, demoUrl, projectUrl, techStack].some((value) => value === null)) {
    return null;
  }

  return {
    type,
    title,
    summary,
    content,
    ...(slug ? { slug } : {}),
    ...(category ? { category } : {}),
    ...(outcome ? { outcome } : {}),
    ...(githubUrl ? { githubUrl } : {}),
    ...(demoUrl ? { demoUrl } : {}),
    ...(projectUrl ? { projectUrl } : {}),
    ...(techStack ? { techStack } : {}),
  };
}

export function draftSlug(weekId: string) {
  return `week-${weekId.toLowerCase()}`;
}

export function projectSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** A media library path, or an https link: the forms a thumbnail can take. */
function picture(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string" && /^\/api\/media\/[a-z0-9]+(\.(mp4|webm))?$/.test(value)) return value;
  return href(value);
}

/**
 * The fields of a staged edit. Every field is optional; null means a field is present but wrong.
 * Content keeps the same limits as a new draft.
 */
export function parseEditFields(fields: Record<string, unknown>) {
  const edit = {
    title: bounded(fields.title, 120),
    summary: bounded(fields.summary, 300),
    content: bounded(fields.content, 50_000),
    category: bounded(fields.category, 60),
    outcome: bounded(fields.outcome, 200),
    githubUrl: href(fields.githubUrl),
    demoUrl: href(fields.demoUrl),
    projectUrl: href(fields.projectUrl),
    thumbnail: picture(fields.thumbnail),
    techStack: technologies(fields.techStack),
  };
  if (Object.values(edit).some((value) => value === null)) return null;
  const present = Object.fromEntries(Object.entries(edit).filter(([, value]) => value !== undefined));
  return Object.keys(present).length > 0 ? (present as { [K in keyof typeof edit]?: NonNullable<(typeof edit)[K]> }) : null;
}
