// Topographic contour lines for decorative maps, traced with marching squares over a made-up terrain.
// Runs once on the server; the result is plain SVG path data.

export type Hill = Readonly<{ x: number; y: number; height: number; spread: number; stretch?: number }>;

export type ContourLevel = Readonly<{ elevation: number; index: boolean; d: string; label?: { x: number; y: number } }>;

/** Terrain height at (x, y): a few Gaussian hills plus a gentle ripple so no two lines run parallel. */
export function heightAt(hills: readonly Hill[], x: number, y: number) {
  let height = 8 * Math.sin(x / 97) * Math.cos(y / 61) + 5 * Math.sin((x + y) / 43);
  for (const hill of hills) {
    const dx = (x - hill.x) / (hill.stretch ?? 1);
    const dy = y - hill.y;
    height += hill.height * Math.exp(-(dx * dx + dy * dy) / (2 * hill.spread * hill.spread));
  }
  return height;
}

/**
 * Isolines every `step` metres over a width x height box, sampled every `cell` units. Each level is one
 * path of unjoined segments (marching squares), which draws the same as joined lines at this scale.
 * Index levels (every fifth) are flagged for a heavier stroke and get a label anchor.
 */
export function contourLevels(
  hills: readonly Hill[],
  { width, height, cell = 12, step = 20 }: { width: number; height: number; cell?: number; step?: number },
): ContourLevel[] {
  const columns = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const field: number[] = [];
  let top = -Infinity;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const value = heightAt(hills, column * cell, row * cell);
      field.push(value);
      top = Math.max(top, value);
    }
  }
  const at = (column: number, row: number) => field[row * columns + column];
  const round = (value: number) => Math.round(value * 10) / 10;

  const levels: ContourLevel[] = [];
  for (let elevation = step; elevation < top; elevation += step) {
    const parts: string[] = [];
    let label: { x: number; y: number } | undefined;
    for (let row = 0; row < rows - 1; row++) {
      for (let column = 0; column < columns - 1; column++) {
        const corners = [at(column, row), at(column + 1, row), at(column + 1, row + 1), at(column, row + 1)];
        // Where the level crosses each edge of the cell: top, right, bottom, left.
        const cross = (a: number, b: number) => (elevation - corners[a]) / (corners[b] - corners[a]);
        const x0 = column * cell;
        const y0 = row * cell;
        const edges = [
          [x0 + cross(0, 1) * cell, y0],
          [x0 + cell, y0 + cross(1, 2) * cell],
          [x0 + (1 - cross(2, 3)) * cell, y0 + cell],
          [x0, y0 + (1 - cross(3, 0)) * cell],
        ];
        const crossed = [0, 1, 2, 3].filter((edge) => {
          const a = corners[edge];
          const b = corners[(edge + 1) % 4];
          return (a < elevation) !== (b < elevation);
        });
        // Two crossings: one segment. Four (a saddle): pair them in order, which is fine for decoration.
        for (let pair = 0; pair + 1 < crossed.length; pair += 2) {
          const [ax, ay] = edges[crossed[pair]];
          const [bx, by] = edges[crossed[pair + 1]];
          parts.push(`M${round(ax)} ${round(ay)}L${round(bx)} ${round(by)}`);
          label ??= { x: round((ax + bx) / 2), y: round((ay + by) / 2) };
        }
      }
    }
    const index = Math.round(elevation / step) % 5 === 0;
    if (parts.length) levels.push({ elevation, index, d: parts.join(""), label: index ? label : undefined });
  }
  return levels;
}
