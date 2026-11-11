import assert from "node:assert/strict";
import test from "node:test";

import { draftSlug, isValidDraftToken, parseDraftInput } from "@/lib/drafts";

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
  assert.deepEqual(parseDraftInput(valid), valid);
  assert.equal(parseDraftInput({ ...valid, weekId: "2026-46" }), null);
  assert.equal(parseDraftInput({ ...valid, title: " " }), null);
  assert.equal(parseDraftInput({ ...valid, title: "x".repeat(121) }), null);
  assert.equal(parseDraftInput({ ...valid, content: 42 }), null);
  assert.equal(parseDraftInput(null), null);
  assert.equal(draftSlug("2026-W46"), "week-2026-w46");
});
