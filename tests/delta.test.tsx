import assert from "node:assert/strict";
import { test } from "node:test";
import { delta } from "../src/components/admin/VisitorStatsCards";

test("a tiny base shows the previous count, not a percentage", () => {
  assert.equal(delta(595, 0), "was 0");
  assert.equal(delta(0, 1), "was 1");
});

test("a real base shows a signed percentage", () => {
  assert.equal(delta(150, 100), "+50% vs prior");
  assert.equal(delta(50, 100), "-50% vs prior");
  assert.equal(delta(100, 100), "0% vs prior");
});
