import assert from "node:assert/strict";
import test from "node:test";

import { draftSlug, isValidDraftToken, parseDraftInput, parseEditFields, projectSlug, tokenRole } from "@/lib/drafts";

test("draft token check fails closed", () => {
  assert.equal(isValidDraftToken("Bearer s3cret", "s3cret"), true);
  assert.equal(isValidDraftToken("Bearer wrong", "s3cret"), false);
  assert.equal(isValidDraftToken("s3cret", "s3cret"), false);
  assert.equal(isValidDraftToken(null, "s3cret"), false);
  assert.equal(isValidDraftToken("Bearer ", ""), false);
  assert.equal(isValidDraftToken("Bearer anything", undefined), false);
});

test("draft input requires a week id and bounded fields", () => {
  const valid = { weekId: "2026-W46", title: "Week 46", summary: "What I built.", content: "Body" };
  assert.deepEqual(parseDraftInput(valid), { type: "BLOG", ...valid });
  assert.equal(parseDraftInput({ ...valid, weekId: "2026-46" }), null);
  assert.equal(parseDraftInput({ ...valid, title: " " }), null);
  assert.equal(parseDraftInput({ ...valid, title: "x".repeat(121) }), null);
  assert.equal(parseDraftInput({ ...valid, content: 42 }), null);
  assert.equal(parseDraftInput(null), null);
  assert.equal(draftSlug("2026-W46"), "week-2026-w46");
});

test("project draft input carries the case-study fields", () => {
  const project = {
    type: "PROJECT",
    title: "Postcard from the Map",
    summary: "A self-hosted portfolio built around a live map.",
    content: "The problem, the decisions, the tradeoffs.",
    slug: "postcard-from-the-map",
    category: "Web Platform",
    techStack: ["Next.js", "MapLibre GL"],
    outcome: "Turned a project grid into an argument.",
    githubUrl: "https://github.com/KvassAndVodka/portfolio",
    projectUrl: "https://portfolio.jmraut.dev",
  };
  assert.deepEqual(parseDraftInput(project), project);
  assert.equal(parseDraftInput({ ...project, type: "VIDEO" }), null);
  assert.equal(parseDraftInput({ ...project, githubUrl: "http://insecure.example" }), null);
  assert.equal(parseDraftInput({ ...project, techStack: ["ok", ""] }), null);
  assert.equal(parseDraftInput({ ...project, slug: "Not A Slug" }), null);
  assert.equal(parseDraftInput({ ...project, outcome: "x".repeat(201) }), null);
  // A project does not need a week id.
  assert.ok(parseDraftInput({ type: "PROJECT", title: "T", summary: "S", content: "C" }));
  assert.equal(projectSlug("Postcard from the Map!"), "postcard-from-the-map");
});

test("each token maps to its role, and the owner token wins when both match", () => {
  const saved = { owner: process.env.CONTENT_OWNER_TOKEN, drafts: process.env.DRAFTS_API_TOKEN };
  try {
    process.env.CONTENT_OWNER_TOKEN = "owner-secret";
    process.env.DRAFTS_API_TOKEN = "drafts-secret";
    assert.equal(tokenRole("Bearer owner-secret"), "owner");
    assert.equal(tokenRole("Bearer drafts-secret"), "drafts");
    assert.equal(tokenRole("Bearer nope"), null);
    assert.equal(tokenRole(null), null);
    delete process.env.CONTENT_OWNER_TOKEN; // an unset owner token never matches, even an empty bearer
    assert.equal(tokenRole("Bearer "), null);
  } finally {
    process.env.CONTENT_OWNER_TOKEN = saved.owner;
    process.env.DRAFTS_API_TOKEN = saved.drafts;
    if (saved.owner === undefined) delete process.env.CONTENT_OWNER_TOKEN;
    if (saved.drafts === undefined) delete process.env.DRAFTS_API_TOKEN;
  }
});

test("a staged edit takes only valid fields, and at least one", () => {
  assert.deepEqual(parseEditFields({ slug: "x", content: "New body", thumbnail: "/api/media/abc123" }), { content: "New body", thumbnail: "/api/media/abc123" });
  assert.deepEqual(parseEditFields({ demoUrl: "https://example.com", techStack: ["Next.js"] }), { demoUrl: "https://example.com", techStack: ["Next.js"] });
  assert.equal(parseEditFields({ slug: "x" }), null);
  assert.equal(parseEditFields({ title: "x".repeat(121) }), null);
  assert.equal(parseEditFields({ demoUrl: "http://example.com" }), null);
  assert.equal(parseEditFields({ thumbnail: "/etc/passwd" }), null);
  assert.equal(parseEditFields({ thumbnail: "javascript:alert(1)" }), null);
});
