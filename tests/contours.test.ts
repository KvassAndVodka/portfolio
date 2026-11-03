import assert from "node:assert/strict";
import { test } from "node:test";

import { contourLevels, heightAt } from "../src/lib/contours";

const hill = [{ x: 200, y: 100, height: 300, spread: 60 }];

test("the summit is the highest point", () => {
  assert.ok(heightAt(hill, 200, 100) > heightAt(hill, 320, 100));
});

test("levels climb, stay inside the box, and flag every fifth as an index", () => {
  const levels = contourLevels(hill, { width: 400, height: 200, step: 20 });
  assert.ok(levels.length > 5);
  levels.forEach((level, i) => i && assert.ok(level.elevation > levels[i - 1].elevation));
  for (const level of levels) {
    for (const [, x, y] of level.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) {
      assert.ok(+x >= 0 && +x <= 408 && +y >= 0 && +y <= 204, `point ${x},${y} outside the box`);
    }
    assert.equal(level.index, Math.round(level.elevation / 20) % 5 === 0);
  }
});
