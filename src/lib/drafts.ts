import crypto from "crypto";

export const MAX_DRAFT_BODY_BYTES = 100_000;

export interface DraftInput {
  weekId: string;
  title: string;
  summary: string;
  content: string;
}

// The length check reveals only the token length, which is public for a random hex token.
export function isValidDraftToken(header: string | null, expected: string | undefined) {
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted);
}

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max ? value.trim() : null;
}

export function parseDraftInput(payload: unknown): DraftInput | null {
  if (!payload || typeof payload !== "object") return null;
  const fields = payload as Record<string, unknown>;
  const weekId = typeof fields.weekId === "string" && /^\d{4}-W\d{2}$/.test(fields.weekId) ? fields.weekId : null;
  const title = text(fields.title, 120);
  const summary = text(fields.summary, 300);
  const content = text(fields.content, 50_000);
  return weekId && title && summary && content ? { weekId, title, summary, content } : null;
}

export function draftSlug(weekId: string) {
  return `week-${weekId.toLowerCase()}`;
}
