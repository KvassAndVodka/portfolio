import type { Map as MapLibreMap } from "maplibre-gl";

// Ambient traffic for the close-ups: cars drive a road graph built from the loaded vector tiles,
// turn at junctions, ease into turns, and grow in / shrink out when they spawn or leave. They are
// drawn with deck.gl as GPU instances, outside MapLibre's data pipeline, so moving them never
// invalidates MapLibre's terrain cache the way updating a GeoJSON source every frame did.

const ROAD_CLASSES = ["motorway", "trunk", "primary", "secondary", "tertiary", "minor"];
// ponytail: true-scale cars are ~4 px at the close-up zoom; 3.5x keeps them readable as models.
const MODEL_SCALE = 3.5;
const GRAPH_RADIUS = 1500; // metres of road kept around the camera
const SPAWN_NEAR = 120; // new cars appear at least this far from the camera...
const SPAWN_FAR = 650; // ...and no further than this
const DESPAWN = 900; // cars only leave once they are this far from the camera
const GROW_SECONDS = 0.45; // spawn and despawn animation length
const LANE = 3.5; // metres right of the centre line (the Philippines drives on the right)
const SNAP = 2.5; // vertices closer than this are the same junction (tile edges don't line up exactly)

type Node = { x: number; y: number; edges: number[] };
type Edge = { a: number; b: number; length: number };
type Car = {
  edge: number;
  from: number;
  to: number;
  at: number; // metres along the current edge
  next: number; // edge to take at the end of this one
  speed: number;
  cruise: number;
  heading: number;
  grow: number; // 0..1 spawn animation; negative values delay the start
  leaving: boolean;
  kind: 0 | 1; // car or jeepney
  tone: number;
  sway: number;
};
type RenderedCar = { position: [number, number, number]; yaw: number; scale: [number, number, number]; color: number[] };

// Body and cabin in one mesh, unit-sized (x forward, y left, z up); per-car scale gives real metres.
// The cabin's vertex colour darkens the car's colour, so one draw call paints both.
function vehicleMesh(cabinFrom: number, cabinTo: number) {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tint: number) => {
    const faces: [number[], number[][]][] = [
      [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
      [[-1, 0, 0], [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]]],
      [[0, 1, 0], [[x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]]],
      [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
      [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    ];
    for (const [normal, [a, b, c, d]] of faces) {
      for (const vertex of [a, b, c, a, c, d]) {
        positions.push(...vertex);
        normals.push(...normal);
        colors.push(tint, tint, tint);
      }
    }
  };
  box(-0.5, 0.5, -0.5, 0.5, 0.22, 0.62, 1); // body, lifted off the road
  box(cabinFrom, cabinTo, -0.46, 0.46, 0.62, 1, 0.3); // cabin, a darker shade of the body
  return {
    positions: { value: new Float32Array(positions), size: 3 },
    normals: { value: new Float32Array(normals), size: 3 },
    colors: { value: new Float32Array(colors), size: 3 },
  };
}

// Length, width and height in metres before MODEL_SCALE, for cars and jeepneys.
const SIZES: [number, number, number][] = [
  [4.4, 1.8, 1.5],
  [6.8, 2.0, 2.3],
];

const angleBetween = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const toRgb = (hex: string) => {
  const value = parseInt(hex.replace("#", ""), 16);
  return [value >> 16, (value >> 8) & 255, value & 255];
};

export async function createTraffic(map: MapLibreMap, count: number, palette: readonly string[]) {
  // deck.gl only loads when the first close-up needs cars.
  const [{ MapboxOverlay }, { SimpleMeshLayer }] = await Promise.all([import("@deck.gl/mapbox"), import("@deck.gl/mesh-layers")]);
  // Interleaved: drawn inside MapLibre's own WebGL context, so cars sort correctly against buildings.
  const overlay = new MapboxOverlay({ interleaved: true, layers: [] });
  map.addControl(overlay);
  const meshes = [vehicleMesh(-0.42, 0.12), vehicleMesh(-0.45, 0.4)];
  const colors = palette.slice(0, 3).map(toRgb);

  // ---- Road graph, in metres around a reference point (x east, y north) -------------------------
  let ref = map.getCenter();
  let metersPerLng = 111_320 * Math.cos((ref.lat * Math.PI) / 180);
  const metersPerLat = 110_574;
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  const toLocal = (lng: number, lat: number): [number, number] => [(lng - ref.lng) * metersPerLng, (lat - ref.lat) * metersPerLat];
  const toLngLat = (x: number, y: number): [number, number] => [ref.lng + x / metersPerLng, ref.lat + y / metersPerLat];

  const buildGraph = () => {
    ref = map.getCenter();
    metersPerLng = 111_320 * Math.cos((ref.lat * Math.PI) / 180);
    nodes = [];
    edges = [];
    const grid = new Map<string, number[]>();
    const seen = new Set<string>();
    const nodeAt = (x: number, y: number) => {
      const cx = Math.floor(x / SNAP);
      const cy = Math.floor(y / SNAP);
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (const id of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
            if (Math.hypot(nodes[id].x - x, nodes[id].y - y) < SNAP) return id;
          }
        }
      }
      nodes.push({ x, y, edges: [] });
      const id = nodes.length - 1;
      grid.set(`${cx},${cy}`, [...(grid.get(`${cx},${cy}`) ?? []), id]);
      return id;
    };
    const lines = map
      .querySourceFeatures("openmaptiles", {
        sourceLayer: "transportation",
        filter: ["in", ["get", "class"], ["literal", ROAD_CLASSES]],
      })
      .flatMap((feature) => {
        const geometry = feature.geometry;
        if (geometry.type === "LineString") return [geometry.coordinates];
        if (geometry.type === "MultiLineString") return geometry.coordinates;
        return [];
      });
    for (const line of lines) {
      let previous = -1;
      for (const [lng, lat] of line) {
        const [x, y] = toLocal(lng, lat);
        if (Math.hypot(x, y) > GRAPH_RADIUS) {
          previous = -1;
          continue;
        }
        const id = nodeAt(x, y);
        const key = previous < id ? `${previous}-${id}` : `${id}-${previous}`;
        // Tiles overlap at their edges, so the same stretch of road arrives more than once.
        if (previous >= 0 && previous !== id && !seen.has(key)) {
          seen.add(key);
          edges.push({ a: previous, b: id, length: Math.hypot(nodes[id].x - nodes[previous].x, nodes[id].y - nodes[previous].y) });
          nodes[previous].edges.push(edges.length - 1);
          nodes[id].edges.push(edges.length - 1);
        }
        previous = id;
      }
    }
  };

  const other = (edge: number, node: number) => (edges[edge].a === node ? edges[edge].b : edges[edge].a);
  const direction = (from: number, to: number) => Math.atan2(nodes[to].y - nodes[from].y, nodes[to].x - nodes[from].x);

  /** At a junction, mostly carry on roughly straight, sometimes turn; U-turn only at a dead end. */
  const chooseNext = (edge: number, node: number) => {
    const options = nodes[node].edges.filter((candidate) => candidate !== edge);
    if (options.length === 0) return edge;
    if (options.length === 1) return options[0];
    const heading = direction(other(edge, node), node);
    const weights = options.map((candidate) => {
      const turn = Math.abs(angleBetween(heading, direction(node, other(candidate, node))));
      return 0.15 + Math.max(0, Math.cos(turn)) ** 2 * 3;
    });
    let pick = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
    for (let i = 0; i < options.length; i += 1) {
      pick -= weights[i];
      if (pick <= 0) return options[i];
    }
    return options[options.length - 1];
  };

  // ---- Cars ---------------------------------------------------------------------------------------
  let cars: Car[] = [];
  let spawnCooldown = 0;
  const camera = () => toLocal(map.getCenter().lng, map.getCenter().lat);

  const positionOf = (car: Car): [number, number] => {
    const from = nodes[car.from];
    const to = nodes[car.to];
    const t = car.at / (edges[car.edge].length || 1);
    return [from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t];
  };

  const spawn = (near: number, far: number, delay = 0) => {
    if (edges.length === 0) return;
    const [cx, cy] = camera();
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const edge = Math.floor(Math.random() * edges.length);
      const { a, b, length } = edges[edge];
      const distance = Math.hypot((nodes[a].x + nodes[b].x) / 2 - cx, (nodes[a].y + nodes[b].y) / 2 - cy);
      if (distance < near || distance > far || length < 1) continue;
      const [from, to] = Math.random() < 0.5 ? [a, b] : [b, a];
      const cruise = 16 + Math.random() * 12; // 16-28 m/s: lively, and a little faster than life
      cars.push({
        edge, from, to,
        at: Math.random() * length,
        next: chooseNext(edge, to),
        speed: cruise,
        cruise,
        heading: direction(from, to),
        grow: -delay,
        leaving: false,
        kind: Math.random() < 0.3 ? 1 : 0,
        tone: Math.floor(Math.random() * colors.length),
        sway: Math.random() * Math.PI * 2,
      });
      return;
    }
  };

  const move = (car: Car, step: number) => {
    const edge = edges[car.edge];
    // Ease off ahead of a sharp turn and pick the pace back up after it.
    const turn = Math.abs(angleBetween(direction(car.from, car.to), direction(car.to, other(car.next, car.to))));
    const remaining = edge.length - car.at;
    const target = remaining < 30 && turn > 0.5 ? car.cruise * (1 - Math.min(turn / Math.PI, 1) * 0.6) : car.cruise;
    car.speed += (target - car.speed) * Math.min(1, step * 2.5);
    car.at += car.speed * step;
    while (car.at >= edges[car.edge].length) {
      car.at -= edges[car.edge].length;
      const reached = car.to;
      car.edge = car.next;
      car.from = reached;
      car.to = other(car.edge, reached);
      car.next = chooseNext(car.edge, car.to);
    }
    // Steer into the new direction over a moment instead of snapping to it.
    const desired = direction(car.from, car.to);
    car.heading += angleBetween(car.heading, desired) * Math.min(1, step * 8);
    car.sway += step * 1.7;
  };

  let empty = true;
  const render = (visible: boolean) => {
    if (!visible) {
      if (!empty) overlay.setProps({ layers: [] });
      empty = true;
      return;
    }
    empty = false;
    const byKind: RenderedCar[][] = [[], []];
    for (const car of cars) {
      if (car.grow <= 0) continue;
      const [x, y] = positionOf(car);
      // Keep to the right-hand lane, with a slight drift so the traffic never looks rail-bound.
      const lane = LANE + Math.sin(car.sway) * 0.4;
      const [lng, lat] = toLngLat(x + Math.sin(car.heading) * lane, y - Math.cos(car.heading) * lane);
      const g = Math.min(car.grow, 1);
      const eased = 1 - (1 - g) ** 3;
      const [length, width, height] = SIZES[car.kind];
      byKind[car.kind].push({
        position: [lng, lat, 0],
        yaw: (car.heading * 180) / Math.PI,
        scale: [length * MODEL_SCALE * eased, width * MODEL_SCALE * eased, height * MODEL_SCALE * eased],
        color: colors[car.tone],
      });
    }
    overlay.setProps({
      layers: byKind.map(
        (data, kind) =>
          new SimpleMeshLayer<RenderedCar>({
            id: `story-traffic-${kind}`,
            data,
            mesh: meshes[kind],
            getPosition: (car) => car.position,
            getOrientation: (car) => [0, car.yaw, 0],
            getScale: (car) => car.scale,
            getColor: (car) => car.color as [number, number, number],
          }),
      ),
    });
  };

  return {
    /** Re-read the roads around the camera (after new tiles load) and move the cars onto them. */
    refresh() {
      const survivors = cars
        .filter((car) => !car.leaving && car.grow > 0)
        .map((car) => ({ car, lngLat: toLngLat(...positionOf(car)) }));
      buildGraph();
      // Keep cars that still sit on a road; anything else shrinks away rather than jumping.
      cars = survivors.flatMap(({ car, lngLat }) => {
        const [x, y] = toLocal(...lngLat);
        let best = -1;
        let bestDistance = 12;
        edges.forEach((edge, index) => {
          const ax = nodes[edge.a].x;
          const ay = nodes[edge.a].y;
          const t = Math.max(0, Math.min(1, ((x - ax) * (nodes[edge.b].x - ax) + (y - ay) * (nodes[edge.b].y - ay)) / (edge.length ** 2 || 1)));
          const distance = Math.hypot(ax + (nodes[edge.b].x - ax) * t - x, ay + (nodes[edge.b].y - ay) * t - y);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = index;
          }
        });
        if (best < 0) return [];
        const edge = edges[best];
        const forward = Math.cos(angleBetween(car.heading, direction(edge.a, edge.b))) >= 0;
        const [from, to] = forward ? [edge.a, edge.b] : [edge.b, edge.a];
        const at = Math.min(Math.hypot(x - nodes[from].x, y - nodes[from].y), edge.length);
        return [{ ...car, edge: best, from, to, at, next: chooseNext(best, to) }];
      });
    },
    /** Advance and draw one frame; `active` is false outside close-ups, where cars are hidden. */
    tick(step: number, active: boolean) {
      if (!active) {
        cars = [];
        render(false);
        return;
      }
      if (edges.length === 0) buildGraph();
      // Arriving at a close-up: fill the streets at once, each car growing in on a slight stagger.
      if (cars.length === 0) for (let i = 0; i < count; i += 1) spawn(0, SPAWN_FAR, Math.random() * 0.6);
      const [cx, cy] = camera();
      for (const car of cars) {
        if (car.grow < 1) car.grow += step / GROW_SECONDS;
        if (car.leaving) car.grow -= (2 * step) / GROW_SECONDS;
        else if (car.grow > 0) {
          move(car, step);
          const [x, y] = positionOf(car);
          // Only cars that have driven well out of view leave, so none vanish on screen.
          if (Math.hypot(x - cx, y - cy) > DESPAWN) car.leaving = true;
        }
      }
      cars = cars.filter((car) => !(car.leaving && car.grow <= 0));
      // Top the streets back up gradually, so new cars trickle in rather than appearing in a burst.
      spawnCooldown -= step;
      if (cars.length < count && spawnCooldown <= 0) {
        spawn(SPAWN_NEAR, SPAWN_FAR);
        spawnCooldown = 0.15;
      }
      render(true);
    },
    destroy() {
      map.removeControl(overlay);
      overlay.finalize();
    },
  };
}
