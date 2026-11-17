import assert from "node:assert/strict";
import test from "node:test";

import { handle } from "../cloudflare/outage-guard/src/index.js";

// A stand-in for caches.default and the Worker context.
function setup() {
  const store = new Map<string, Response>();
  const cache = {
    put: async (key: Request, response: Response) => void store.set(key.url, response),
    match: async (key: Request) => store.get(key.url)?.clone(),
  };
  const pending: Promise<unknown>[] = [];
  const ctx = { waitUntil: (promise: Promise<unknown>) => void pending.push(promise) };
  const run = async (request: Request, origin: () => Promise<Response>) => {
    const response = await handle(request, ctx, { fetchOrigin: origin, cache });
    await Promise.all(pending.splice(0));
    return response;
  };
  return { store, run };
}

const page = (path: string, init?: RequestInit) => new Request(`https://portfolio.jmraut.dev${path}`, init);
const html = (body: string, headers: Record<string, string> = {}) =>
  async () => new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", ...headers } });
const down = (status: number) => async () => new Response("Cloudflare error page", { status });
const unreachable = async (): Promise<Response> => {
  throw new Error("connection refused");
};

test("a healthy page passes through unchanged and is remembered", async () => {
  const { store, run } = setup();
  const response = await run(page("/projects/demo"), html("LIVE PAGE"));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "LIVE PAGE");
  assert.ok(store.has("https://portfolio.jmraut.dev/projects/demo?__outage_copy=1"));
});

test("while the origin is down, the last good copy is served with 200", async () => {
  const { run } = setup();
  await run(page("/projects/demo"), html("LIVE PAGE"));
  for (const outage of [down(530), down(502), down(522), unreachable]) {
    const response = await run(page("/projects/demo"), outage);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "LIVE PAGE");
    assert.equal(response.headers.get("x-outage-copy"), "1");
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("a page with no copy gets 503 with Retry-After during an outage", async () => {
  const { run } = setup();
  const response = await run(page("/notes/never-seen"), down(530));
  assert.equal(response.status, 503);
  assert.ok(Number(response.headers.get("retry-after")) > 0);
  assert.match(await response.text(), /Back soon/);
});

test("admin, API, auth, non-GET and cookie-setting responses are never copied or replaced", async () => {
  const { store, run } = setup();
  await run(page("/admin/projects"), html("ADMIN"));
  await run(page("/api/projects"), html("API"));
  await run(page("/auth/signin"), html("SIGN IN"));
  await run(page("/"), html("SESSION PAGE", { "set-cookie": "session=1" }));
  await run(page("/notes", { method: "POST" }), html("POSTED"));
  assert.equal(store.size, 0);

  // The origin's own error stays visible for admin and API traffic.
  assert.equal((await run(page("/admin/projects"), down(530))).status, 530);
  assert.equal((await run(page("/api/projects"), down(502))).status, 502);
});

test("non-HTML and non-200 responses are not remembered", async () => {
  const { store, run } = setup();
  await run(page("/sitemap.xml"), async () => new Response("<urlset/>", { status: 200, headers: { "content-type": "application/xml" } }));
  await run(page("/projects/missing"), async () => new Response("Not found", { status: 404, headers: { "content-type": "text/html" } }));
  assert.equal(store.size, 0);
});

test("a real 404 or 500 from a running site passes through untouched", async () => {
  const { run } = setup();
  assert.equal((await run(page("/projects/missing"), async () => new Response("Not found", { status: 404 }))).status, 404);
  assert.equal((await run(page("/broken"), async () => new Response("Error", { status: 500 }))).status, 500);
});
