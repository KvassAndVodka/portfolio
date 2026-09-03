import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import NotesIndex from "@/components/NotesIndex";
import ProjectShowcase from "@/components/ProjectShowcase";
import { createPageMetadata, serializeJsonLd } from "@/lib/seo";
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

  assert.deepEqual(metadata.alternates, { canonical: "/projects/data-platform" });
  assert.equal(Reflect.get(Object(metadata.openGraph), "type"), "article");
  assert.equal(Reflect.get(Object(metadata.twitter), "card"), "summary_large_image");
});

test("JSON-LD serialization escapes markup-capable characters", () => {
  assert.equal(serializeJsonLd({ title: "</script>" }), '{"title":"\\u003c/script>"}');
});

test("sitemap includes only supplied public content with real modification dates", () => {
  const sitemap = buildSitemap(
    [{ slug: "data-platform", updatedAt: "2026-07-02T00:00:00.000Z" }],
    [{ slug: "shipping-notes", updatedAt: "2026-08-03T00:00:00.000Z" }],
  );
  const urls = sitemap.map((entry) => entry.url);

  assert.ok(urls.includes("https://portfolio.jmraut.dev/projects/data-platform"));
  assert.ok(urls.includes("https://portfolio.jmraut.dev/notes/shipping-notes"));
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
        },
      ]}
    />,
  );

  assert.match(projectHtml, /href="\/projects\/data-platform"/);
  assert.match(projectHtml, /Data Platform/);
  assert.match(noteHtml, /href="\/notes\/shipping-notes"/);
  assert.match(noteHtml, /Shipping Notes/);
});
