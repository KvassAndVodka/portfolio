import type { StyleSpecification } from "maplibre-gl";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

export type MapTheme = Readonly<{
  background: string;
  foreground: string;
  accent: string;
  dark: boolean;
}>;

type Rgba = [number, number, number, number];

function parseColor(value: string): Rgba | null {
  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
    return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16)).concat(1) as Rgba;
  }

  const fn = value.match(/^(rgb|hsl)a?\(([^)]+)\)$/i);
  if (!fn) return null;
  const parts = fn[2].split(",").map((part) => parseFloat(part));
  const alpha = parts[3] ?? 1;
  if (fn[1].toLowerCase() === "rgb") return [parts[0], parts[1], parts[2], alpha];

  const [h, s, l] = [parts[0] / 360, parts[1] / 100, parts[2] / 100];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    const k = (t + 1) % 1;
    if (k < 1 / 6) return p + (q - p) * 6 * k;
    if (k < 1 / 2) return q;
    if (k < 2 / 3) return p + (q - p) * (2 / 3 - k) * 6;
    return p;
  };
  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255, alpha];
}

/**
 * Maps every colour in the stock style onto the site's two neutrals by lightness,
 * so the basemap reads as the portfolio's palette in both themes.
 */
function recolor(value: unknown, theme: MapTheme): unknown {
  if (Array.isArray(value)) return value.map((item) => recolor(item, theme));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, recolor(item, theme)]));
  }
  if (typeof value !== "string") return value;

  const color = parseColor(value);
  const bg = parseColor(theme.background);
  const fg = parseColor(theme.foreground);
  if (!color || !bg || !fg) return value;

  const lightness = (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
  // Light theme keeps the stock contrast; dark theme inverts it and flattens it a little.
  const towardBackground = theme.dark ? 1 - (1 - lightness) * 0.75 : lightness;
  const mix = (index: number) => Math.round(fg[index] + (bg[index] - fg[index]) * towardBackground);
  return `rgba(${mix(0)}, ${mix(1)}, ${mix(2)}, ${color[3]})`;
}

let stockStyle: Promise<StyleSpecification> | null = null;

export async function buildMapStyle(theme: MapTheme, lite: boolean): Promise<StyleSpecification> {
  stockStyle ??= fetch(STYLE_URL).then((response) => response.json());
  const base = structuredClone(await stockStyle);

  const layers = base.layers
    // Shields and the low-zoom shaded relief don't fit the stylised look.
    // No text or icons anywhere: the map is a quiet backdrop, and the pins carry the only labels.
    .filter((layer) => layer.type !== "symbol" && layer.id !== "ne2_shaded")
    .map((layer) =>
      "paint" in layer && layer.paint
        ? { ...layer, paint: recolor(layer.paint, theme) as typeof layer.paint }
        : layer,
    ) as StyleSpecification["layers"];

  const style: StyleSpecification = { ...base, layers };
  // Nothing draws text or icons, so skip the sprite and font downloads entirely.
  delete style.sprite;
  delete style.glyphs;

  if (!lite) {
    // ponytail: the public terrarium tiles carry occasional bad pixels that render as needle spikes
    // (one sat on Camiguin). Coarser tiles average most of them out; self-hosted cleaned DEM if any remain.
    style.sources.terrain = { type: "raster-dem", tiles: [TERRAIN_TILES], encoding: "terrarium", tileSize: 256, maxzoom: 11 };
    style.sources.hillshade = { type: "raster-dem", tiles: [TERRAIN_TILES], encoding: "terrarium", tileSize: 256, maxzoom: 14 };
    style.terrain = { source: "terrain", exaggeration: 1.2 };
    style.sky = {
      "sky-color": theme.background,
      "horizon-color": theme.background,
      "fog-color": theme.background,
      // Haze that thickens with distance, so far terrain softens into the page colour.
      "sky-horizon-blend": 0.7,
      "horizon-fog-blend": 0.55,
      "fog-ground-blend": 0.45,
      "atmosphere-blend": 0,
    };

    layers.push(
      {
        id: "story-hillshade",
        type: "hillshade",
        source: "hillshade",
        paint: {
          "hillshade-shadow-color": theme.foreground,
          "hillshade-highlight-color": theme.background,
          "hillshade-accent-color": theme.foreground,
          "hillshade-exaggeration": theme.dark ? 0.35 : 0.25,
        },
      },
      {
        id: "story-buildings",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        // From 15: close-ups sit at 17, and below 15 the extrusions cost more than they show.
        minzoom: 15,
        paint: {
          "fill-extrusion-color": recolor(theme.dark ? "hsl(0,0%,80%)" : "hsl(0,0%,90%)", theme) as string,
          // ponytail: footprints without height data get 7 m (about two storeys).
          "fill-extrusion-height": ["coalesce", ["get", "render_height"], 7],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.92,
        },
      },
    );
    // The flat footprint layer would z-fight with the extrusions.
    style.layers = layers.filter((layer) => layer.id !== "building");
  }

  return style;
}
