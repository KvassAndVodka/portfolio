// Outage guard for portfolio.jmraut.dev, a Cloudflare Worker in front of the self-hosted site.
//
// The site runs on a home line behind a Cloudflare Tunnel. When the line or the app is down, Cloudflare
// answers with its own 530/52x error page, and after a day or two of those, search engines drop pages.
// This Worker passes every request through unchanged. It keeps the last good copy of each public page at
// the Cloudflare location that served it, and while the origin is unreachable it serves that copy. With no
// copy, it answers 503 with Retry-After, the documented "temporarily unavailable, come back later" signal.

// Origin errors Cloudflare produces when the tunnel or the app behind it is unreachable.
export const ORIGIN_DOWN = new Set([502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 530]);
const COPY_SECONDS = 14 * 24 * 60 * 60;
const RETRY_AFTER_SECONDS = 1800;

/** A plain page view: GET of a public path. Admin, auth and API traffic is never copied or replaced. */
export function isPublicPage(request) {
  if (request.method !== "GET") return false;
  return !/^\/(admin|api|auth)(\/|$)/.test(new URL(request.url).pathname);
}

// The copy's cache key: the page path with a marker query, so it never collides with a real cached URL.
export const copyKey = (request) => {
  const url = new URL(request.url);
  return new Request(`${url.origin}${url.pathname}?__outage_copy=1`);
};

const isCopyable = (response) =>
  response.status === 200 &&
  (response.headers.get("content-type") || "").includes("text/html") &&
  !response.headers.has("set-cookie");

async function remember(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.set("cache-control", `public, max-age=${COPY_SECONDS}`);
  await cache.put(copyKey(request), new Response(await response.arrayBuffer(), { status: 200, headers }));
}

function unavailable() {
  return new Response(
    "<!doctype html><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><title>Back soon | Javier Raut</title>" +
      "<body style=\"font:16px/1.6 system-ui,sans-serif;max-width:34rem;margin:15vh auto;padding:0 1rem\">" +
      "<h1>Back soon.</h1><p>This site is self-hosted, and its server is briefly offline. Please try again in a little while.</p></body>",
    {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8", "retry-after": String(RETRY_AFTER_SECONDS), "cache-control": "no-store" },
    },
  );
}

export async function handle(request, ctx, { fetchOrigin = fetch, cache = caches.default } = {}) {
  const page = isPublicPage(request);
  let response = null;
  try {
    response = await fetchOrigin(request);
  } catch {
    response = null; // the origin could not be reached at all
  }

  if (response && !ORIGIN_DOWN.has(response.status)) {
    if (page && isCopyable(response)) ctx.waitUntil(remember(cache, request, response.clone()));
    return response;
  }

  // Non-page traffic keeps the origin's own answer, so admin and API errors stay visible.
  if (!page) return response ?? unavailable();

  const copy = await cache.match(copyKey(request));
  if (!copy) return unavailable();
  const headers = new Headers(copy.headers);
  headers.set("cache-control", "no-store");
  headers.set("x-outage-copy", "1");
  return new Response(copy.body, { status: 200, headers });
}

const worker = {
  fetch: (request, env, ctx) => handle(request, ctx),
};

export default worker;
