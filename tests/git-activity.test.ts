import assert from "node:assert/strict";
import test from "node:test";

import { cellOf, radiusOf } from "@/components/GitActivityBand";
import activity from "@/lib/gitActivity.json";

test("days fill weeks top to bottom, starting on the first day's weekday", () => {
  // The year starts on a Saturday (6): day 0 is the last row of week 0, day 1 opens week 1.
  assert.deepEqual(cellOf(0, 6), { column: 0, row: 6 });
  assert.deepEqual(cellOf(1, 6), { column: 1, row: 0 });
  assert.deepEqual(cellOf(364, 0), { column: 52, row: 0 });
});

test("empty days are specks and the busiest day gets the largest dot", () => {
  assert.equal(radiusOf(0, 101), 0.9);
  assert.ok(radiusOf(1, 101) > radiusOf(0, 101));
  assert.equal(radiusOf(101, 101), 4.4);
});

test("the snapshot is a whole year whose days add up to its total", () => {
  assert.ok(activity.counts.length >= 365);
  assert.equal(activity.counts.reduce((sum, count) => sum + count, 0), activity.total);
  assert.ok(activity.privatePrs <= activity.mergedPrs && activity.privateCount <= activity.total);
});
