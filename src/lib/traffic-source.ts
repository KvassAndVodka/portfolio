/**
 * Where a visit came from, as a short label: a `?ref=` / `utm_source` tag you put on a link wins,
 * then the referring site's host. Only the host is kept, never the full referring URL.
 */
export function trafficSource(tag: unknown, referrer: unknown, ownHost: string | null) {
  if (typeof tag === "string" && /^[a-z0-9._-]{1,40}$/i.test(tag)) return tag.toLowerCase();
  if (typeof referrer !== "string" || referrer.length > 2000) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    return host && host !== ownHost?.replace(/^www\./, "").split(":")[0] ? host : null;
  } catch {
    return null;
  }
}
