"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapLibreMap, Marker, TerrainSpecification } from "maplibre-gl";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { FaArrowDown, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

import { ASCII_FIELD_STRENGTH, cloudClock, createCloud, type Cloud } from "./cloud";
import { buildMapStyle, type MapTheme } from "./mapStyle";
import { createTraffic } from "./traffic";

export type StoryPlace = Readonly<{
  id: string;
  /** Pin label: the company or office name. */
  name: string;
  /** Shorter label for the map pin when `name` is too long to sit on the map. */
  pinLabel?: string;
  /** One or two words for the journey rail. */
  short: string;
  area: string;
  coordinates: [number, number];
  period: string;
  role: string;
  organization: string;
  detail: string;
  url?: string;
  current?: boolean;
}>;

type Camera = { lng: number; lat: number; zoom: number; pitch: number; bearing: number };

// Overlooking Misamis Oriental from the south: CDO, the bay, and Tagoloan in one view.
// The overlook's zoom and tilt; its centre comes from the pins (see overlookFor).
const OVERLOOK_VIEW = { zoom: 11.6, pitch: 58, bearing: 0 };
const CLOSE_UP = { zoom: 17, pitch: 60 };

export function readTheme(): MapTheme {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  return {
    background: styles.getPropertyValue("--background").trim(),
    foreground: styles.getPropertyValue("--foreground").trim(),
    accent: styles.getPropertyValue("--accent").trim(),
    dark: root.classList.contains("dark"),
  };
}

function toRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function mixRgb(a: [number, number, number], b: [number, number, number], amount: number) {
  return a.map((channel, index) => channel + (b[index] - channel) * amount) as [number, number, number];
}

export function cloudColors(theme: MapTheme) {
  const page = toRgb(theme.background);
  const ink = toRgb(theme.foreground);
  // Dots and shading sit closer to the ink than the rest of the page's grays: the cloud has to read
  // against the background on its own, especially behind the centered cloud title.
  const dot = mixRgb(page, ink, theme.dark ? 0.52 : 0.5);
  return theme.dark
    ? { dot, light: mixRgb(page, ink, 0.28), shade: mixRgb(page, ink, 0.1) }
    : { dot, light: [1, 1, 1] as [number, number, number], shade: mixRgb(page, ink, 0.2) };
}


function carColors(theme: MapTheme) {
  // Three body colours plus the cabin glass, all from the site palette.
  // Light mode avoids white bodies: they vanish against the white roads.
  return theme.dark
    ? [theme.accent, "#f8f8f2", "#9a988f", "#202024"]
    : [theme.accent, "#3d3c38", "#8a877f", "#161616"];
}

/** Degrees and minutes, the way a printed map's margin gives its position: "N 08°29′". */
function dms(value: number, positive: string, negative: string, digits: number) {
  const totalMinutes = Math.round(Math.abs(value) * 60);
  const degrees = String(Math.floor(totalMinutes / 60)).padStart(digits, "0");
  return `${value >= 0 ? positive : negative} ${degrees}°${String(totalMinutes % 60).padStart(2, "0")}′`;
}

/** Facts for the overview's map title, all derived from the places so they stay true. */
function mapFacts(places: readonly StoryPlace[]) {
  const pins = pinsFor(places);
  const lng = pins.reduce((sum, pin) => sum + pin.coordinates[0], 0) / pins.length;
  const lat = pins.reduce((sum, pin) => sum + pin.coordinates[1], 0) / pins.length;
  const years = places.map((place) => Number(place.period.match(/\d{4}/)?.[0])).filter(Boolean);
  return {
    position: `${dms(lat, "N", "S", 2)}  ${dms(lng, "E", "W", 3)}`,
    sites: String(pins.length).padStart(2, "0"),
    chapters: String(places.length).padStart(2, "0"),
    since: String(Math.min(...years)),
  };
}

function formatCoordinates([lng, lat]: readonly [number, number]) {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
}

/** Detail copy may embed one [label](href) inline link; the text around it stays plain. */
function detailWithLink(detail: string) {
  const match = detail.match(/\[(.+?)\]\((.+?)\)/);
  if (!match || match.index === undefined) return detail;
  return [
    detail.slice(0, match.index),
    <a key="place-detail-link" className="story-place-detail-link" href={match[2]} rel="noreferrer" target="_blank">
      {match[1]}
    </a>,
    detail.slice(match.index + match[0].length),
  ];
}

/**
 * Level of detail for the tilted camera, which is where most tiles get loaded: at most four zoom
 * levels on screen, and at most twice the tiles of a flat view. Distant ground uses coarser tiles.
 */
function limitDetail(map: MapLibreMap) {
  map.setSourceTileLodParams(4, 2);
  // Terrain is the costliest source when tilted, so it gets tighter limits still.
  if (map.getSource("terrain")) map.setSourceTileLodParams(3, 1.5, "terrain");
}


/** Opening camera: centred on the middle of all the pins, so every workplace is in view. */
function overlookFor(places: readonly StoryPlace[]): Camera {
  // Unique locations, so USTP (two chapters, one pin) doesn't pull the centre toward itself.
  const pins = pinsFor(places);
  const lng = pins.reduce((sum, pin) => sum + pin.coordinates[0], 0) / pins.length;
  const lat = pins.reduce((sum, pin) => sum + pin.coordinates[1], 0) / pins.length;
  // A phone is too narrow to fit all three at the desktop zoom, so pull back a step.
  const zoom = OVERLOOK_VIEW.zoom - (window.innerWidth < 768 ? 1.6 : 0);
  return { lng, lat, ...OVERLOOK_VIEW, zoom };
}

type Pin = { name: string; coordinates: [number, number]; places: number[] };

function pinsFor(places: readonly StoryPlace[]): Pin[] {
  const pins = new Map<string, Pin>();
  places.forEach((place, index) => {
    const key = place.coordinates.join(",");
    const pin = pins.get(key) ?? { name: place.pinLabel ?? place.name, coordinates: place.coordinates, places: [] };
    pin.places.push(index);
    pins.set(key, pin);
  });
  return [...pins.values()];
}

function pinIndexOf(places: readonly StoryPlace[], placeIndex: number) {
  return pinsFor(places).findIndex((pin) => pin.places.includes(placeIndex));
}

/**
 * Phones and low-end machines get the lighter story: flat 2D map, no terrain
 * or buildings, fewer cars, a coarser cloud. Same scroll, same acts.
 */
function isLiteDevice() {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    (navigatorWithMemory.deviceMemory ?? 8) <= 4
  );
}

export default function StoryJourney({ places }: Readonly<{ places: readonly StoryPlace[] }>) {
  const rootRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLCanvasElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const traffic = useRef<Awaited<ReturnType<typeof createTraffic>> | null>(null);
  const cloud = useRef<Cloud | null>(null);
  const markers = useRef<Marker[]>([]);
  // Starts in the story layout ("loading") so the first paint already looks like the final page;
  // only reduced motion or a map failure drops to the plain column.
  const [mode, setMode] = useState<"loading" | "static" | "live">("loading");
  const [mapReady, setMapReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const lite = useRef(false);
  const styledDark = useRef<boolean | null>(null);
  // The style's own terrain settings, so close-ups can flatten it and the overview can restore it.
  const styledTerrain = useRef<TerrainSpecification | null>(null);
  const terrainScale = useRef(-1);
  const jumpToPin = useRef<((placeIndexes: number[]) => void) | null>(null);

  const carCount = () => (lite.current ? 14 : 40);

  // Create the map once; reduced motion keeps the page as a plain, readable column.
  useEffect(() => {
    if (prefersReducedMotion() || !mapRef.current) {
      // Set from an effect: it depends on the visitor's settings, which the server can't know.
      setMode("static");
      return;
    }
    let cancelled = false;
    lite.current = isLiteDevice();

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled || !mapRef.current) return;
      const theme = readTheme();
      styledDark.current = theme.dark;
      const overlook = overlookFor(places);

      try {
        const map = new maplibre.Map({
          container: mapRef.current,
          style: await buildMapStyle(theme, lite.current),
          center: [overlook.lng, overlook.lat],
          zoom: overlook.zoom,
          pitch: lite.current ? 0 : overlook.pitch,
          bearing: lite.current ? 0 : overlook.bearing,
          maxPitch: 85,
          interactive: false,
          // Performance: render at no more than 1.5x pixel density (2x/3x screens otherwise draw
          // 1.8-4x the pixels), and keep a smaller tile cache.
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
          maxTileCacheZoomLevels: 3,
          // Always shown as one plain line (the OSM licence needs it), styled to match the page.
          attributionControl: { compact: false },
          fadeDuration: 0,
        });
        mapInstance.current = map;

        // One pin per location: USTP is both where I studied and where I teach.
        markers.current = pinsFor(places).map((pin, pinIndex) => {
          const element = document.createElement("div");
          element.className = "story-pin";
          // MapLibre positions the outer element; GSAP animates the inner button.
          const button = document.createElement("button");
          button.type = "button";
          button.className = "story-pin-inner";
          button.dataset.pin = String(pinIndex);
          button.setAttribute("aria-label", `Show ${pin.name}`);
          button.innerHTML = `<span class="story-pin-label"></span><span class="story-pin-dot"></span>`;
          button.querySelector(".story-pin-label")!.textContent = pin.name;
          button.addEventListener("click", () => jumpToPin.current?.(pin.places));
          element.append(button);
          return new maplibre.Marker({ element, anchor: "bottom" }).setLngLat(pin.coordinates).addTo(map);
        });

        // Not "load": that waits for every tile and font, which the always-moving camera may never allow.
        map.once("style.load", () => {
          if (cancelled) return;
          limitDetail(map);
          styledTerrain.current = map.getTerrain();
          createTraffic(map, carCount(), carColors(theme)).then((created) => {
            if (cancelled) return created.destroy();
            traffic.current = created;
          });
          setMapReady(true);
        });

        const canvas = cloudRef.current;
        cloud.current = canvas ? createCloud(canvas, lite.current ? 0.75 : 1) : null;
        cloud.current?.setColors(cloudColors(theme));
        setMode("live");
      } catch (error) {
        // No WebGL or no tiles: fall back to the plain column, which already has all the content.
        console.warn("Story map unavailable; showing the static layout.", error);
        setMode("static");
      }
    })();

    return () => {
      cancelled = true;
      cloud.current?.destroy();
      markers.current.forEach((marker) => marker.remove());
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
    // The map is built once; theme changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restyle on theme change without rebuilding the map.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;
    let cancelled = false;
    // next-themes swaps the html class after this effect, so read the tokens a frame later.
    const frame = requestAnimationFrame(async () => {
      const theme = readTheme();
      if (theme.dark === styledDark.current) return;
      styledDark.current = theme.dark;
      cloud.current?.setColors(cloudColors(theme));
      const style = await buildMapStyle(theme, lite.current);
      if (cancelled) return;
      traffic.current?.destroy();
      traffic.current = null;
      map.setStyle(style);
      map.once("style.load", () => {
        if (cancelled) return;
        limitDetail(map);
        // A new style brings full terrain back; let the render loop flatten it again if close.
        styledTerrain.current = map.getTerrain();
        terrainScale.current = -1;
        createTraffic(map, carCount(), carColors(theme)).then((created) => {
          if (cancelled) return created.destroy();
          traffic.current = created;
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [resolvedTheme, mapReady]);

  // One pinned timeline sets the story's target view; one render loop draws it.
  useGSAP(
    () => {
      const map = mapInstance.current;
      if (mode !== "live" || !map) return;

      const flat = lite.current;
      const shot = (camera: Camera): Camera => (flat ? { ...camera, pitch: 0, bearing: 0 } : camera);
      const overlook = overlookFor(places);
      // Like the overlook, the close-up pulls back on a narrow viewport: zoom 17 shows only a
      // street corner on a phone, so phones back off a step and a half to keep the place in context.
      const closeUpZoom = CLOSE_UP.zoom - (window.innerWidth < 768 ? 1.5 : 0);
      const view = { ...shot(overlook), cloud: 0, dots: 0, mapAlpha: 1, hover: 1, place: -1 };
      const pointer = { bearing: 0, pitch: 0 };
      // The map fades in once its first vector tiles are drawn, instead of popping in tile by tile.
      const reveal = { amount: 0 };
      const showMap = () => gsap.to(reveal, { amount: 1, duration: 0.9, ease: "power1.out" });
      // getSource first: isSourceLoaded logs an error for a source the style hasn't registered yet.
      if (map.getSource("openmaptiles") && map.isSourceLoaded("openmaptiles")) showMap();
      else {
        const onData = (event: { sourceId?: string; isSourceLoaded?: boolean }) => {
          if (event.sourceId !== "openmaptiles" || !event.isSourceLoaded) return;
          map.off("sourcedata", onData);
          showMap();
        };
        map.on("sourcedata", onData);
      }

      // Close-ups keep the pin in the open part of the screen (right of the chapter text on desktop,
      // above it on phones). The overview stays centred, so the offset fades in with zoom.
      const framing = () => {
        const amount = Math.min(Math.max((view.zoom - 13) / 3, 0), 1);
        return window.innerWidth < 768
          ? { top: 0, right: 0, bottom: window.innerHeight * 0.45 * amount, left: 0 }
          : // The overview (amount 0) leaves the top of the screen to the map plate, so the pins sit below it.
            { top: window.innerHeight * 0.32 * (1 - amount), right: 0, bottom: 0, left: window.innerWidth * 0.35 * amount };
      };

      // Hover: a slow drift around whatever the camera is looking at, so it never sits still.
      const hoverOffset = (seconds: number) => {
        // A few hundred metres at most: enough to feel alive, never enough to lose the subject.
        const reach = Math.min(0.00035 * Math.pow(2, 16 - view.zoom), 0.003) * view.hover;
        return {
          lng: Math.cos(seconds * 0.12) * reach,
          lat: Math.sin(seconds * 0.12) * reach * 0.6,
          bearing: flat ? 0 : Math.sin(seconds * 0.08) * 8 * view.hover,
        };
      };

      let frame = 0;
      let last = 0;
      let seconds = 0;
      let lastPlace = -2;
      let activeRail = -2;
      let refreshTimers: number[] = [];
      // Terrain is flattened in close-ups (the city is low-lying, so it barely shows) and restored as the
      // camera rises. Measured: with terrain on, every car update forced the terrain to re-drape the whole
      // map; flat close-ups ran ~5x faster with cars moving. The fade over two zoom levels hides the switch.
      const flattenTerrainUpClose = () => {
        const full = styledTerrain.current;
        if (!full) return;
        const scale = Math.min(Math.max((14.5 - view.zoom) / 2, 0), 1);
        // Only touch the terrain when the change is visible; the ends (flat, full) are always applied exactly.
        if (scale === terrainScale.current) return;
        if (Math.abs(scale - terrainScale.current) < 0.04 && scale !== 0 && scale !== 1) return;
        terrainScale.current = scale;
        map.setTerrain(scale === 0 ? null : { ...full, exaggeration: (full.exaggeration ?? 1) * scale });
      };
      const draw = (now: number) => {
        const step = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        seconds += step;

        if (view.mapAlpha > 0.01) {
          flattenTerrainUpClose();
          const hover = hoverOffset(seconds);
          map.jumpTo({
            padding: framing(),
            center: [view.lng + hover.lng, view.lat + hover.lat],
            zoom: view.zoom,
            pitch: Math.min(view.pitch + pointer.pitch, 85),
            bearing: view.bearing + hover.bearing + pointer.bearing,
          });
          // New close-up, new roads loaded: hand the cars to them.
          const place = Math.round(view.place);
          if (place !== activeRail) {
            activeRail = place;
            rootRef.current?.querySelectorAll<HTMLElement>("[data-rail]").forEach((button) => {
              button.toggleAttribute("data-active", Number(button.dataset.rail) === place);
            });
          }
          if (place !== lastPlace && view.zoom > 14.5) {
            lastPlace = place;
            // The hover never lets the map go idle, so wait for tiles by time instead.
            refreshTimers.forEach(clearTimeout);
            refreshTimers = [600, 2000].map((delay) => window.setTimeout(() => traffic.current?.refresh(), delay));
          }
          // Cars only exist in close-ups: elsewhere they'd be under a pixel wide.
          traffic.current?.tick(step, view.cloud < 0.95 && view.zoom > 14.5);
        }
        mapRef.current!.style.opacity = String(view.mapAlpha * reveal.amount);
        cloud.current?.render(view.cloud, cloudClock(), view.dots, ASCII_FIELD_STRENGTH);
        frame = requestAnimationFrame(draw);
      };
      const start = () => {
        if (frame) return;
        last = 0;
        frame = requestAnimationFrame(draw);
      };
      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
      };

      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          id: "story",
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          // Smoothing behind the scrollbar: enough to soften wheel jitter, short enough that a
          // landed stop settles almost straight away.
          scrub: 0.8,
        },
      });
      // Draw whenever any part of the stage is on screen, including while the scrub catches up at the end.
      const visibility = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? start() : stop()),
      });

      // Role titles rise in letter by letter; the mask keeps each line clipped while they do.
      SplitText.create(".story-place-role", { type: "lines,chars", mask: "lines", charsClass: "story-char" });

      // Act 1: the overlook. The intro gives way, and every fade lands by the overview stop
      // (time 1.1), so the snapped state is clean: no hero ghost, no half-faded pins.
      timeline
        .to(".story-intro", { autoAlpha: 0, y: -40, duration: 0.45 }, 0.5)
        .to(".story-scroll-cue", { autoAlpha: 0, duration: 0.3 }, 0.1)
        .fromTo(
          ".story-pin-inner",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.32, ease: "power1.out" },
          0.6,
        )

        // The chapter column owns a soft wash, so it stays hidden until the first stop.
        // The map plate slams in with the overview: rules draw across, the title rises line by line,
        // the data cells stamp in. It clears out as the camera dives to the first stop.
        .fromTo(".story-plate", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, ease: "none" }, 0.62)
        .fromTo(".story-plate-head, .story-plate-data", { "--rule": 0 }, { "--rule": 1, duration: 0.3, ease: "power3.out" }, 0.62)
        .fromTo(".story-plate-line", { yPercent: 105 }, { yPercent: 0, stagger: 0.07, duration: 0.32, ease: "power4.out" }, 0.66)
        .fromTo(".story-plate-head span, .story-plate-data > div", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.2, ease: "power2.out" }, 0.74)
        .to(".story-plate-line", { yPercent: -105, stagger: 0.04, duration: 0.25, ease: "power2.in" }, 1.38)
        .to(".story-plate", { autoAlpha: 0, duration: 0.2, ease: "none" }, 1.45)
        .fromTo(".story-places", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 1.5)
        .fromTo(".story-places-heading", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.5)
        .fromTo(".story-rail", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.2);

      // Act 2: fly down to each workplace and hover there until the next scroll.
      const visitStart = 1.2;
      const visit = 1.6;
      const arrivalOf = (index: number) => visitStart + index * visit + 1.15;
      places.forEach((place, index) => {
        const at = visitStart + index * visit;
        const card = `.story-place[data-place="${index}"]`;
        const pin = `.story-pin-inner[data-pin="${pinIndexOf(places, index)}"]`;
        const close = shot({
          lng: place.coordinates[0],
          lat: place.coordinates[1],
          ...CLOSE_UP,
          zoom: closeUpZoom,
          bearing: -30 + index * 25,
        });
        // Rise a little mid-flight so the hop between places reads as travel.
        timeline
          .to(view, { lng: close.lng, lat: close.lat, bearing: close.bearing, pitch: close.pitch, place: index, duration: 0.9 }, at)
          .to(view, { zoom: index === 0 ? closeUpZoom : 13.2, duration: 0.45, ease: "power1.out" }, at)
          .to(view, { zoom: closeUpZoom, duration: 0.45, ease: "power1.in" }, at + 0.45)
          .fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, at + 0.5)
          .fromTo(`${card} .story-place-role .story-char`, { yPercent: 110 }, { yPercent: 0, stagger: 0.008, duration: 0.4, ease: "power3.out" }, at + 0.5)
          .fromTo(
            `${card} .story-place-index, ${card} .story-place-organization, ${card} .story-place-detail, ${card} .story-place-meta`,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.35, ease: "power2.out" },
            at + 0.6,
          )
          .to(pin, { scale: 1.2, duration: 0.3 }, at + 0.5)
          .to(pin, { scale: 1, duration: 0.3 }, at + visit - 0.3);
        if (index < places.length - 1) timeline.to(card, { autoAlpha: 0, y: -32, duration: 0.3 }, at + visit - 0.3);
      });

      // Act 3: pull up and tilt to the sky; cloud rolls in and takes over.
      const sky = visitStart + places.length * visit;
      // The rail fills from the first stop to the last as the journey plays.
      // Timed to the arrivals, so at each stop the fill ends exactly on that stop's node.
      timeline.fromTo(
        ".story-rail-fill",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", duration: arrivalOf(places.length - 1) - arrivalOf(0) },
        arrivalOf(0),
      );
      timeline
        .to([".story-places", ".story-pin-inner", ".story-rail"], { autoAlpha: 0, duration: 0.4 }, sky)
        .to(view, { ...shot({ ...overlook, zoom: 12.6, pitch: 85, bearing: 0 }), hover: 0.3, duration: 1.6 }, sky)
        // Clouds start gathering as soon as the camera begins to tilt up, and the map dims with them,
        // so the page darkens gradually instead of dropping out at the end. The gathering gets the
        // spotlight: it plays longest, and the title waits until the sky has filled.
        // Stops short of a solid sheet so the billows keep their shape for the hand-off.
        .to(view, { cloud: 0.8, duration: 3.2, ease: "power1.inOut" }, sky + 0.2)
        .to(view, { mapAlpha: 0, duration: 2.6, ease: "sine.inOut" }, sky + 0.6)
        // The billows turn into the ASCII cloud the projects sit on, at the same strength as there.
        .to(view, { dots: 1, duration: 1.4, ease: "power1.inOut" }, sky + 3.4);

      // The states stepped scrolling moves between. Arrivals sit where the camera has landed
      // and the chapter text has finished rising.
      // No stop inside the cloud: the climb carries straight on into the projects, which sit on the same
      // ASCII cloud, so "A few things I've built." is the first thing you land on above the map.
      timeline.addLabel("intro", 0).addLabel("overview", 1.1);
      places.forEach((_, index) => timeline.addLabel(`place-${index}`, arrivalOf(index)));

      // Clicking a pin scrolls to the moment the camera arrives there; the scrub flies the camera.
      // Stepped scrolling: inside the story, a gesture glides to the next state
      // (intro, overview, each workplace; after the last, up through the cloud to the projects). Free scrolling
      // is held off while gliding, but fresh gestures made during a glide chain on to the states after.
      const trigger = timeline.scrollTrigger!;
      const states = () => Object.values(timeline.labels).sort((a, b) => a - b);
      const scrollFor = (time: number) => trigger.start + (trigger.end - trigger.start) * (time / timeline.duration());
      const inStory = () => window.scrollY >= trigger.start - 2 && window.scrollY <= trigger.end + 2;
      // At the end of the timeline the projects are already in view, so going further down is plain page
      // scrolling, not another step.
      const handsOff = (direction: number) => !inStory() || (direction > 0 && window.scrollY >= trigger.end - 2);
      const MAX_QUEUED = 2;
      // Hero → overview covers no camera flight, only quick fades, so that hop snaps instead of gliding.
      const INTRO_HOP = 0.35;
      const GLIDE = 1.5;
      // Scrolling up to the cloud is the showpiece, so it flies slower than any other hop.
      const CLOUD_GLIDE = 3;
      // A beat at each stop when gestures are chained, so the journey doesn't blur past.
      const CHAIN_PAUSE = 0.4;
      let gliding = false;
      let glideDirection: 1 | -1 = 1;
      let queued = 0;

      // The page uses CSS smooth scrolling for anchor links. During a glide it would smooth every
      // frame GSAP sets on top of GSAP's own easing, so the page lags behind and lands late.
      const root = document.documentElement;
      const goTo = (top: number, duration: number, onArrive?: () => void) => {
        gliding = true;
        root.style.scrollBehavior = "auto";
        gsap.to(window, {
          scrollTo: { y: top, autoKill: false },
          duration,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            gliding = false;
            root.style.scrollBehavior = "";
            onArrive?.();
          },
        });
      };

      const glide = (direction: 1 | -1, duration?: number) => {
        glideDirection = direction;
        const times = states();
        // Read the real scroll position: ScrollTrigger's progress only catches up on the next frame,
        // so right after a glide lands it can still read as "just short", and a chain would repeat a state.
        const now = ((window.scrollY - trigger.start) / (trigger.end - trigger.start)) * timeline.duration();
        // From between two states (mid-glide or after a scrollbar drag), the next state is the one ahead.
        const next =
          direction > 0
            ? times.findIndex((time) => time > now + 0.02)
            : times.findLastIndex((time) => time < now - 0.02);
        // After the last place, the next state is the end of the timeline: the climb through the clouds,
        // with the projects section rising over the stage until it fills the screen.
        const top = next !== -1 ? scrollFor(times[next]) : direction > 0 ? trigger.end : null;
        if (top === null) {
          queued = 0;
          return;
        }
        // A fresh gesture glides at reading pace — unless it is the hop in or out of the hero, which
        // snaps, or the climb into the cloud, which takes its time. Explicit durations always win.
        const introHop = (direction > 0 && now < 0.9) || (direction < 0 && times[next] < 0.15);
        // The last hop (next === -1) is the climb through the clouds into the projects.
        const cloudHop = direction > 0 && (next === -1 || times[next] > sky);
        goTo(top, duration ?? (introHop ? INTRO_HOP : cloudHop ? CLOUD_GLIDE : GLIDE), () => {
          // Chained gestures play out one after another at full pace, with a short beat at each
          // stop so every frame registers. Input during the beat still counts toward the chain.
          if (queued > 0 && inStory()) {
            queued -= 1;
            gliding = true;
            gsap.delayedCall(CHAIN_PAUSE, () => glide(glideDirection));
          } else {
            queued = 0;
          }
        });
      };

      const request = (direction: 1 | -1) => {
        if (!gliding) {
          queued = 0;
          glide(direction);
        } else if (direction === glideDirection) {
          queued = Math.min(queued + 1, MAX_QUEUED);
        } else {
          // Changed your mind: drop the queue and head back right away.
          queued = 0;
          glide(direction, 0.9);
        }
      };

      // A new gesture is a pause of more than 150 ms, or a wheel event stronger than the last once the
      // gesture is underway: momentum only ever fades, so a spike means a fresh flick, not the old tail.
      let lastWheel = 0;
      let lastMagnitude = 0;
      let gestureStart = 0;
      const handleWheel = (event: WheelEvent) => {
        if (handsOff(event.deltaY) || event.ctrlKey) return;
        event.preventDefault();
        const now = performance.now();
        const magnitude = Math.abs(event.deltaY);
        const paused = now - lastWheel > 150;
        const spiked = now - gestureStart > 200 && magnitude > lastMagnitude * 1.5 + 4;
        lastWheel = now;
        lastMagnitude = magnitude;
        if (magnitude < 3 || !(paused || spiked)) return;
        gestureStart = now;
        request(event.deltaY > 0 ? 1 : -1);
      };

      let touchStartY = 0;
      const handleTouchStart = (event: TouchEvent) => {
        touchStartY = event.touches[0].clientY;
      };
      const handleTouchMove = (event: TouchEvent) => {
        // The first move of a swipe barely moves, so its direction reads as 0. Blocking it would cancel
        // the whole swipe (browsers decide on the first move), so at the end of the story only a swipe
        // that is clearly heading back up is taken over.
        const distance = touchStartY - event.touches[0].clientY;
        const atEnd = window.scrollY >= trigger.end - 2;
        if (inStory() && !(atEnd && distance >= 0)) event.preventDefault();
      };
      // Each swipe is one gesture.
      const handleTouchEnd = (event: TouchEvent) => {
        const distance = touchStartY - event.changedTouches[0].clientY;
        if (handsOff(distance) || Math.abs(distance) < 30) return;
        request(distance > 0 ? 1 : -1);
      };

      const handleKey = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest("input, textarea, select, [contenteditable]")) return;
        const direction = ["ArrowDown", "PageDown", " "].includes(event.key)
          ? 1
          : ["ArrowUp", "PageUp"].includes(event.key)
            ? -1
            : 0;
        if (!direction || (event.key === " " && event.shiftKey) || handsOff(direction)) return;
        event.preventDefault();
        request(direction);
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("keydown", handleKey);

      // Direct jumps (a pin, a rail stop, the Home link) cut straight to the target state instead of
      // scrolling through every stop in between: the stage dips out, the page and the timeline jump
      // together, and the stage comes back already framed on the target.
      const stage = rootRef.current!.querySelector<HTMLElement>(".story-stage")!;
      const cutTo = (top: number) => {
        gsap.killTweensOf(window);
        queued = 0;
        gliding = true;
        gsap.to(stage, {
          autoAlpha: 0,
          duration: 0.18,
          ease: "power1.in",
          overwrite: true,
          onComplete: () => {
            root.style.scrollBehavior = "auto";
            window.scrollTo({ top, behavior: "instant" });
            ScrollTrigger.update();
            // Finish the scrub at once, so the timeline doesn't replay the stops in between.
            trigger.getTween()?.progress(1);
            root.style.scrollBehavior = "";
            gsap.to(stage, {
              autoAlpha: 1,
              duration: 0.35,
              ease: "power1.out",
              onComplete: () => {
                gliding = false;
              },
            });
          },
        });
      };

      jumpToPin.current = (placeIndexes) => {
        // USTP holds two chapters: a second click moves to the next one.
        const current = Math.round(view.place);
        const position = placeIndexes.indexOf(current);
        const next = placeIndexes[(position + 1) % placeIndexes.length];
        cutTo(scrollFor(arrivalOf(next)));
      };

      // The header's Home link asks the story to cut back to the intro (see Header).
      const handleJump = (event: Event) => {
        event.preventDefault();
        cutTo((event as CustomEvent<{ top: number }>).detail.top);
      };
      window.addEventListener("story:jump", handleJump);

      // Cursor leans the camera a touch and parts the cloud.
      const leanBearing = gsap.quickTo(pointer, "bearing", { duration: 0.8, ease: "power3.out" });
      const leanPitch = gsap.quickTo(pointer, "pitch", { duration: 0.8, ease: "power3.out" });
      const handlePointer = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        if (!flat) {
          leanBearing((event.clientX / window.innerWidth - 0.5) * 6);
          leanPitch((0.5 - event.clientY / window.innerHeight) * 4);
        }
        const bounds = cloudRef.current?.getBoundingClientRect();
        if (bounds) cloud.current?.setPointer(event.clientX - bounds.left, event.clientY - bounds.top);
      };
      const handleResize = () => cloud.current?.resize();
      window.addEventListener("pointermove", handlePointer, { passive: true });
      window.addEventListener("resize", handleResize);
      // Both canvases were created while the stage was hidden, so size them now.
      map.resize();
      cloud.current?.resize();
      ScrollTrigger.refresh();
      if (visibility.isActive) start();

      return () => {
        stop();
        jumpToPin.current = null;
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("keydown", handleKey);
        window.removeEventListener("story:jump", handleJump);
        refreshTimers.forEach(clearTimeout);
        window.removeEventListener("pointermove", handlePointer);
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [mode], scope: rootRef },
  );

  return (
    <section className="story" data-mode={mode} ref={rootRef} aria-label="Introduction and experience">
      <div className="story-stage">
        <div className="story-map" ref={mapRef} aria-hidden="true" />
        <div className="story-haze" aria-hidden="true" />
        <canvas className="story-cloud" ref={cloudRef} aria-hidden="true" />

        <div className="story-overlay">
          <div className="story-frame site-shell">
            <div className="story-intro">
              <div className="story-intro-copy">
                <p className="hero-kicker">
                  Hi, I&apos;m <strong>Javier Raut</strong>, a software developer from Cagayan de Oro.
                </p>
                <h1 className="display-title">
                  Mapping out solutions towards <em>a better future.</em>
                </h1>
                <p className="body-large story-summary">
                  I am building GIS systems and automation pipelines used to
                  make impactful legislative decisions in the House of
                  Representatives. I am also teaching Computer Science students at
                  the University of Science and Technology of Southern
                  Philippines.
                </p>
                <div className="hero-actions">
                  <Link className="button-primary" href="/projects">
                    View projects
                  </Link>
                  <a
                    className="button-secondary"
                    href="https://github.com/KvassAndVodka"
                    aria-label="Javier Raut on GitHub (opens in a new tab)"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FaGithub aria-hidden="true" />
                    GitHub
                    <FaArrowUpRightFromSquare aria-hidden="true" className="button-external-icon" />
                  </a>
                </div>
              </div>
              <div className="story-portrait">
                <Image
                  src="/IMG_20260730_122436.jpg"
                  alt="Portrait of Javier Raut"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 767px) 7rem, 18rem"
                  className="object-cover"
                />
              </div>
            </div>

            <p className="story-scroll-cue" aria-hidden="true">
              <FaArrowDown />
              Scroll to travel
            </p>

            {/* The overview's map title, set like a brutalist plate: huge type, hard rules, a data strip. */}
            <div className="story-plate" aria-hidden="true">
              <p className="story-plate-head">
                <span>Fig. 01 — Experience</span>
                <span>{mapFacts(places).position}</span>
              </p>
              <p className="story-plate-title">
                <span className="story-plate-line">The work</span>
                <span className="story-plate-line">so far</span>
              </p>
              <dl className="story-plate-data">
                <div>
                  <dt>Places</dt>
                  <dd>{mapFacts(places).sites}</dd>
                </div>
                <div>
                  <dt>Roles</dt>
                  <dd>{mapFacts(places).chapters}</dd>
                </div>
                <div>
                  <dt>Since</dt>
                  <dd>{mapFacts(places).since}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>N. Mindanao</dd>
                </div>
              </dl>
            </div>

            <div className="story-places">
              <h2 className="story-places-heading">Where I&apos;ve done the work</h2>
              <ol>
                {places.map((place, index) => (
                  <li
                    className={`story-place${place.current ? " story-place-current" : ""}`}
                    data-place={index}
                    key={place.id}
                  >
                    <p className="story-place-index">
                      <span>{String(index + 1).padStart(2, "0")}</span> / {String(places.length).padStart(2, "0")}
                      {place.current && <em>Now</em>}
                    </p>
                    <h3 className="story-place-role">{place.role}</h3>
                    {place.url ? (
                      <a className="story-place-organization" href={place.url} rel="noreferrer" target="_blank">
                        {place.organization}
                        <FaArrowUpRightFromSquare aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <p className="story-place-organization">{place.organization}</p>
                    )}
                    <p className="story-place-detail">{detailWithLink(place.detail)}</p>
                    <p className="story-place-meta">
                      <time>{place.period}</time>
                      <span>{place.area}</span>
                      <span aria-hidden="true">{formatCoordinates(place.coordinates)}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <nav className="story-rail" aria-label="Jump to a place">
              <span aria-hidden="true" className="story-rail-track">
                <span className="story-rail-fill" />
              </span>
              <ol>
                {places.map((place, index) => (
                  <li key={place.id}>
                    <button type="button" data-rail={index} onClick={() => jumpToPin.current?.([index])}>
                      <span aria-hidden="true" className="story-rail-node" />
                      <span className="story-rail-year">{place.period.split(" ")[0]}</span>
                      <span className="story-rail-label">{place.short}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

          </div>
        </div>
      </div>
    </section>
  );
}
