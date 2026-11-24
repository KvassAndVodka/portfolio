import { PostType } from "@prisma/client";
import { after } from "next/server";

import { siteConfig } from "@/lib/seo";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";
const INDEXNOW_KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;
const MAX_URLS_PER_REQUEST = 10_000;
const REQUEST_TIMEOUT_MS = 10_000;

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export type IndexNowResult =
  | { ok: true; status: number; submitted: number; urls: string[] }
  | { ok: false; skipped?: boolean; status?: number; reason: string };

export function isValidIndexNowKey(key: string | undefined | null): key is string {
  return typeof key === "string" && INDEXNOW_KEY_PATTERN.test(key);
}

export function getIndexNowKey(): string | null {
  const configured = process.env.INDEXNOW_KEY?.trim();
  return isValidIndexNowKey(configured) ? configured : null;
}

export function isPublicOrigin(origin: URL): boolean {
  const hostname = origin.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  ) {
    return false;
  }
  return origin.protocol === "https:" || origin.protocol === "http:";
}

export function buildIndexNowPayload(
  urls: string[],
  options: { key?: string | null; origin?: URL } = {},
): IndexNowPayload | null {
  const key = options.key === undefined ? getIndexNowKey() : options.key?.trim() ?? null;
  if (!isValidIndexNowKey(key)) return null;

  const origin = options.origin ?? siteConfig.origin;
  const normalized = new Set<string>();

  for (const raw of urls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    try {
      const resolved = new URL(trimmed, origin);
      if (resolved.host !== origin.host) continue;
      normalized.add(resolved.toString());
      if (normalized.size >= MAX_URLS_PER_REQUEST) break;
    } catch {
      continue;
    }
  }

  if (normalized.size === 0) return null;

  return {
    host: origin.host,
    key,
    keyLocation: new URL(INDEXNOW_KEY_PATH, origin).toString(),
    urlList: [...normalized],
  };
}

export async function submitIndexNow(
  urls: string[],
  options: { key?: string | null; origin?: URL; fetchImpl?: typeof fetch } = {},
): Promise<IndexNowResult> {
  const key = options.key === undefined ? getIndexNowKey() : options.key?.trim() ?? null;
  if (!isValidIndexNowKey(key)) {
    return { ok: false, skipped: true, reason: "INDEXNOW_KEY is not configured or invalid." };
  }

  const origin = options.origin ?? siteConfig.origin;
  if (!isPublicOrigin(origin)) {
    return { ok: false, skipped: true, reason: `Skipping IndexNow for non-public origin (${origin.origin}).` };
  }

  const payload = buildIndexNowPayload(urls, { key, origin });
  if (!payload) {
    return { ok: false, skipped: true, reason: "No valid same-host URLs to submit." };
  }

  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 200 || response.status === 202) {
      return {
        ok: true,
        status: response.status,
        submitted: payload.urlList.length,
        urls: payload.urlList,
      };
    }

    const bodyText = await response.text().catch(() => "");
    return {
      ok: false,
      status: response.status,
      reason: bodyText.trim() || `IndexNow responded with HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "IndexNow request failed.",
    };
  }
}

export function urlsForPost(
  post: { slug: string; type: PostType; showAsBlog?: boolean },
  previousSlug?: string,
): string[] {
  const isProject = post.type === PostType.PROJECT;
  const base = isProject ? "/projects" : "/notes";
  const paths = ["/", base, `${base}/${post.slug}`];

  if (isProject && post.showAsBlog) {
    paths.push("/notes");
  }
  if (previousSlug && previousSlug !== post.slug) {
    paths.push(`${base}/${previousSlug}`);
  }

  return [...new Set(paths)];
}

/** Schedules a non-blocking IndexNow submission after the current response completes. */
export function scheduleIndexNow(urls: string[]) {
  if (urls.length === 0 || !getIndexNowKey()) return;

  const task = async () => {
    const result = await submitIndexNow(urls);
    if (result.ok) {
      console.info(JSON.stringify({ event: "indexnow", status: result.status, submitted: result.submitted }));
    } else if (!result.skipped) {
      console.warn(JSON.stringify({ event: "indexnow", status: result.status ?? null, reason: result.reason }));
    }
  };

  try {
    after(task);
  } catch {
    // Fallback if invoked outside a Next.js request context.
    void task();
  }
}
