import { PostType } from "@prisma/client";
import { canonicalPostPath } from "@/lib/posts";
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { plateText } from "@/components/AsciiPlate";
import NotesIndex from "@/components/NotesIndex";
import ProjectGallery from "@/components/ProjectGallery";
import ProjectShowcase from "@/components/ProjectShowcase";
import {
  buildIndexNowPayload,
  INDEXNOW_ENDPOINT,
  isValidIndexNowKey,
  submitIndexNow,
  urlsForPost,
} from "@/lib/indexnow";
import { buildLlmsTxt } from "@/lib/llms";
import { breadcrumbJsonLd, createPageMetadata, serializeJsonLd } from "@/lib/seo";
import { buildSitemap } from "@/lib/sitemap";

test("page metadata contains a canonical URL and social preview data", () => {
  const metadata = createPageMetadata({
    title: "A dependable data platform",
    description: "A representative project description.",
    path: "/projects/data-platform",
    type: "article",
    publishedTime: "2026-07-01T00:00:00.000Z",
    modifiedTime: "2026-07-02T00:00:00.000Z",
  });

  assert.deepEqual(metadata.alternates, {
    canonical: "/projects/data-platform",
    types: { "text/markdown": "/llms.txt" },
  });
  assert.equal(Reflect.get(Object(metadata.openGraph), "type"), "article");
  assert.equal(Reflect.get(Object(metadata.twitter), "card"), "summary_large_image");
});

test("JSON-LD serialization escapes markup-capable characters", () => {
  assert.equal(serializeJsonLd({ title: "</script>" }), '{"title":"\\u003c/script>"}');
});

test("sitemap includes only supplied public content with real modification dates", () => {
  const sitemap = buildSitemap(
    [{ slug: "data-platform", updatedAt: "2026-07-02T00:00:00.000Z" }],
    [
      { slug: "shipping-notes", updatedAt: "2026-08-03T00:00:00.000Z", isProject: false },
      // A case study shown as a note: listed once, under /projects.
      { slug: "data-platform", updatedAt: "2026-07-02T00:00:00.000Z", isProject: true },
    ],
  );
  const urls = sitemap.map((entry) => entry.url);
  const urlSet = new Set(urls);

  assert.ok(urlSet.has("https://portfolio.jmraut.dev/projects/data-platform"));
  assert.ok(urlSet.has("https://portfolio.jmraut.dev/notes/shipping-notes"));
  assert.ok(!urlSet.has("https://portfolio.jmraut.dev/notes/data-platform"), "a case study shown as a note is not listed twice");
  assert.equal(urls.some((url) => /\/(?:admin|auth|api)(?:\/|$)/.test(url)), false);
  assert.equal(
    sitemap.find((entry) => entry.url.endsWith("/notes/shipping-notes"))?.lastModified?.toString(),
    new Date("2026-08-03T00:00:00.000Z").toString(),
  );
});

test("project and note links are present in server-rendered HTML", () => {
  const projectHtml = renderToStaticMarkup(
    <ProjectShowcase
      initialProjects={[
        {
          slug: "data-platform",
          title: "Data Platform",
          summary: "A dependable data platform.",
          techStack: ["Next.js", "PostgreSQL"],
          category: "infrastructure",
        },
      ]}
      loadImmediately
    />,
  );
  const noteHtml = renderToStaticMarkup(
    <NotesIndex
      initialNotes={[
        {
          slug: "shipping-notes",
          title: "Shipping Notes",
          summary: "Lessons from shipping software.",
          publishedAt: "2026-08-01T00:00:00.000Z",
          updatedAt: "2026-08-03T00:00:00.000Z",
          readTime: "4 min read",
          isProject: false,
        },
      ]}
    />,
  );

  assert.match(projectHtml, /href="\/projects\/data-platform"/);
  assert.match(projectHtml, /Data Platform/);
  assert.match(noteHtml, /href="\/notes\/shipping-notes"/);
  assert.match(noteHtml, /Shipping Notes/);
});

test("home gallery renders case-study, live, and code links on the server", () => {
  const html = renderToStaticMarkup(
    <ProjectGallery
      projects={[
        {
          slug: "data-platform",
          title: "Data Platform",
          summary: "A dependable data platform.",
          techStack: ["Next.js", "PostgreSQL"],
          githubUrl: "https://github.com/example/data-platform",
          demoUrl: "https://data.example.com",
          outcome: "Reports went from hours to minutes.",
          year: "2026",
        },
      ]}
    />,
  );

  assert.match(html, /href="\/projects\/data-platform"/);
  assert.match(html, /href="\/projects"/);
  assert.match(html, /href="https:\/\/data\.example\.com"/);
  assert.match(html, /href="https:\/\/github\.com\/example\/data-platform"/);
  assert.match(html, /Reports went from hours to minutes\./);
});

test("ascii plates are deterministic and fit their grid", () => {
  const plate = plateText(1, 40, 12);
  assert.equal(plate, plateText(1, 40, 12));
  const rows = plate.split("\n");
  assert.equal(rows.length, 12);
  assert.ok(rows.every((row) => row.length === 40));
  assert.ok(/[#%@]/.test(plate), "a plate draws dense glyphs");
});

test("breadcrumbs start at home and use absolute URLs", () => {
  const crumbs = breadcrumbJsonLd([{ name: "Notes", path: "/notes" }]).itemListElement;

  assert.deepEqual(
    crumbs.map((crumb) => [crumb.position, crumb.item]),
    [
      [1, "https://portfolio.jmraut.dev/"],
      [2, "https://portfolio.jmraut.dev/notes"],
    ],
  );
});

test("llms.txt lists content by summary and llms-full.txt inlines the bodies", () => {
  const projects = [
    { slug: "data-platform", title: "Data Platform", summary: "A data platform.", content: "PROJECT BODY", techStack: ["Next.js"] },
  ];
  const posts = [
    { slug: "shipping-notes", title: "Shipping Notes", summary: "Lessons.", content: "NOTE BODY", publishedAt: "2026-08-01T00:00:00.000Z", isProject: false },
    { slug: "data-platform", title: "Data Platform", summary: "A data platform.", content: "PROJECT BODY", publishedAt: "2026-07-01T00:00:00.000Z", isProject: true },
  ];
  const index = buildLlmsTxt(projects, posts);
  const full = buildLlmsTxt(projects, posts, true);

  assert.match(index, /^# Javier Raut\n/);
  assert.match(index, /- \[Data Platform\]\(https:\/\/portfolio\.jmraut\.dev\/projects\/data-platform\): A data platform\./);
  assert.match(index, /\/llms-full\.txt/);
  assert.doesNotMatch(index, /PROJECT BODY|NOTE BODY/);
  assert.match(full, /PROJECT BODY[\s\S]*Built with: Next\.js|Built with: Next\.js[\s\S]*PROJECT BODY/);
  assert.match(full, /Published: 2026-08-01[\s\S]*NOTE BODY/);
  assert.doesNotMatch(index, /\/notes\/data-platform/, "a case study shown as a note is listed once, under Projects");
  assert.equal(full.split("PROJECT BODY").length - 1, 1, "its body is inlined once");
});

test("a case study shown as a note points its canonical URL at the project page", () => {
  assert.equal(canonicalPostPath({ slug: "data-platform", isProject: true }), "/projects/data-platform");
  assert.equal(canonicalPostPath({ slug: "shipping-notes", isProject: false }), "/notes/shipping-notes");
});

test("IndexNow key validation and payload building enforce host and key rules", () => {
  assert.equal(isValidIndexNowKey("short"), false);
  assert.equal(isValidIndexNowKey("bad key!"), false);
  assert.equal(isValidIndexNowKey("a1b2c3d4e5f6a7b8"), true);

  const payload = buildIndexNowPayload(
    [
      "/",
      "/notes/shipping-notes",
      "https://portfolio.jmraut.dev/notes/shipping-notes",
      "https://evil.example.com/phishing",
    ],
    {
      key: "a1b2c3d4e5f6a7b8",
      origin: new URL("https://portfolio.jmraut.dev"),
    },
  );

  assert.deepEqual(payload, {
    host: "portfolio.jmraut.dev",
    key: "a1b2c3d4e5f6a7b8",
    keyLocation: "https://portfolio.jmraut.dev/indexnow-key.txt",
    urlList: [
      "https://portfolio.jmraut.dev/",
      "https://portfolio.jmraut.dev/notes/shipping-notes",
    ],
  });
});

test("IndexNow submission handles accepted responses, missing keys, and localhost", async () => {
  const skippedNoKey = await submitIndexNow(["/"], { key: "" });
  assert.equal(skippedNoKey.ok, false);
  assert.equal(skippedNoKey.skipped, true);

  const skippedLocalhost = await submitIndexNow(["/"], {
    key: "a1b2c3d4e5f6a7b8",
    origin: new URL("http://localhost:3000"),
  });
  assert.equal(skippedLocalhost.ok, false);
  assert.equal(skippedLocalhost.skipped, true);

  let capturedUrl = "";
  let capturedBody = "";
  const mockFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedBody = String(init?.body ?? "");
    return new Response(null, { status: 202 });
  }) as typeof fetch;

  const accepted = await submitIndexNow(["/", "/projects/data-platform"], {
    key: "a1b2c3d4e5f6a7b8",
    origin: new URL("https://portfolio.jmraut.dev"),
    fetchImpl: mockFetch,
  });

  assert.equal(capturedUrl, INDEXNOW_ENDPOINT);
  assert.equal(accepted.ok, true);
  if (accepted.ok) {
    assert.equal(accepted.status, 202);
    assert.equal(accepted.submitted, 2);
  }
  const parsed = JSON.parse(capturedBody);
  assert.equal(parsed.keyLocation, "https://portfolio.jmraut.dev/indexnow-key.txt");
  assert.deepEqual(parsed.urlList, [
    "https://portfolio.jmraut.dev/",
    "https://portfolio.jmraut.dev/projects/data-platform",
  ]);
});

test("urlsForPost covers canonical paths, index pages, and renamed slugs", () => {
  assert.deepEqual(
    urlsForPost({ slug: "data-platform", type: PostType.PROJECT, showAsBlog: true }, "old-slug"),
    ["/", "/projects", "/projects/data-platform", "/notes", "/projects/old-slug"],
  );
  assert.deepEqual(
    urlsForPost({ slug: "shipping-notes", type: PostType.BLOG }),
    ["/", "/notes", "/notes/shipping-notes"],
  );
});
