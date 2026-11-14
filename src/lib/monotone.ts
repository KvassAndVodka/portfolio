/**
 * Monotone cubic interpolation (Fritsch–Carlson) through evenly spaced values: a smooth curve that passes
 * through every value and never overshoots between two of them, so a chart shows no bumps or dips the data
 * doesn't have. Returns the slope at each point, in value units per step.
 */
export function monotoneSlopes(values: readonly number[]) {
  const n = values.length;
  if (n < 2) return values.map(() => 0);
  const d = values.slice(1).map((value, i) => value - values[i]);
  // The ends take their one neighbouring slope; inside, the average of both sides, or flat at a peak or valley.
  const slopeAt = (i: number) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    return d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  };
  const m = values.map((_, i) => slopeAt(i));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return m;
}

/** The curve's value at position `f` (0 to values.length - 1, fractional between points). */
export function monotoneAt(values: readonly number[], slopes: readonly number[], f: number) {
  const last = values.length - 1;
  if (last < 1) return values[0] ?? 0;
  const i = Math.min(last - 1, Math.max(0, Math.floor(f)));
  const t = Math.min(1, Math.max(0, f - i));
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * values[i] + (t3 - 2 * t2 + t) * slopes[i] + (-2 * t3 + 3 * t2) * values[i + 1] + (t3 - t2) * slopes[i + 1];
}
