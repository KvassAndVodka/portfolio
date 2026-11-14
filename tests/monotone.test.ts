import assert from "node:assert/strict";
import test from "node:test";

import { monotoneAt, monotoneSlopes } from "@/lib/monotone";

const spiky = [0, 0, 40, 0, 3, 152, 2, 0, 0, 25];

test("the curve passes through every value", () => {
  const slopes = monotoneSlopes(spiky);
  spiky.forEach((value, i) => assert.ok(Math.abs(monotoneAt(spiky, slopes, i) - value) < 1e-9));
});

test("the curve never leaves the range of the two values it joins", () => {
  const slopes = monotoneSlopes(spiky);
  for (let i = 0; i < spiky.length - 1; i++) {
    const low = Math.min(spiky[i], spiky[i + 1]);
    const high = Math.max(spiky[i], spiky[i + 1]);
    for (let t = 0; t <= 1; t += 0.05) {
      const value = monotoneAt(spiky, slopes, i + t);
      assert.ok(value >= low - 1e-9 && value <= high + 1e-9, `overshoot at ${i + t}: ${value}`);
    }
  }
});

test("flat runs stay flat and short inputs don't throw", () => {
  const flat = [5, 5, 5, 5];
  const slopes = monotoneSlopes(flat);
  assert.equal(monotoneAt(flat, slopes, 1.5), 5);
  assert.equal(monotoneAt([7], monotoneSlopes([7]), 0), 7);
  assert.equal(monotoneAt([], monotoneSlopes([]), 0), 0);
});
