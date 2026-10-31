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
          // The card: years at this place over its name, plus a "Now" chip if any role here is current.
          const here = pin.places.map((index) => places[index]);
          const from = here[0].period.split(" - ")[0];
          const to = here[here.length - 1].period.split(" - ").at(-1)!;
          const current = here.some((place) => place.current);
          if (current) button.dataset.current = "";
          button.innerHTML = `
            <span class="story-pin-label">
              <span class="story-pin-meta"><span class="story-pin-years"></span></span>
              <span class="story-pin-name"></span>
            </span>
            <span class="story-pin-marker"><span class="story-pin-ground"></span><span class="story-pin-dot"></span></span>`;
          button.querySelector(".story-pin-years")!.textContent = from === to ? from : `${from} – ${to}`;
          if (current) button.querySelector(".story-pin-meta")!.insertAdjacentHTML("beforeend", `<em>Now</em>`);
          button.querySelector(".story-pin-name")!.textContent = pin.name;
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
          // Smoothing behind the scrollbar: enough to soften wheel jitter, short enough that the
          // story reacts to a scroll right away and a landed stop settles almost straight away.
          scrub: 0.5,
        },
      });
      // Draw whenever the stage shows. Past the end the projects section covers it with its own cloud
      // (see CloudField), so stop there; the extra pixel lets that cloud take over before this one stops.
      const visibility = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top bottom",
        end: "bottom bottom-=1",
        onToggle: (self) => (self.isActive ? start() : stop()),
      });

      // Role titles rise in letter by letter; the mask keeps each line clipped while they do.
      SplitText.create(".story-place-role", { type: "lines,chars", mask: "lines", charsClass: "story-char" });

      // The plate's entrance runs on its own clock: the hop into the overview snaps in a third of a
      // second, and tied to the scroll the title would flash past. Exits stay on the scroll below.
      const plateIn = gsap
        .timeline({ paused: true })
        .fromTo(".story-plate-head, .story-plate-data", { "--rule": 0 }, { "--rule": 1, duration: 0.9, ease: "power3.out" }, 0)
        .fromTo(".story-plate-line > span", { yPercent: 105 }, { yPercent: 0, stagger: 0.15, duration: 0.9, ease: "power4.out" }, 0.1)
        .fromTo(".story-plate-head span, .story-plate-data > div", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" }, 0.45);

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
        // Scrolling down past here plays the entrance; scrolling back up resets it for next time.
        .call(() => (timeline.scrollTrigger!.direction > 0 ? plateIn.restart() : plateIn.pause(0)), [], 0.62)
        .to(".story-plate-line > span", { yPercent: -105, stagger: 0.04, duration: 0.25, ease: "power2.in" }, 1.38)
        .to(".story-plate", { autoAlpha: 0, duration: 0.2, ease: "none" }, 1.45)
        .fromTo(".story-places, .story-places-wash", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 1.5)
        .fromTo(".story-places-heading", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.5)
        .fromTo(".story-rail", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.2);

      // Act 2: fly down to each workplace and hover there until the next scroll.
      const visitStart = 1.2;
      const visit = 2;
      // The chapter text starts rising once the cloud has cleared.
      const textDelay = 1;
      const arrivalOf = (index: number) => visitStart + index * visit + textDelay + 0.65;
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
        // Into each place (the first from the overview): pass through a cloud instead of flying. Flying drew
        // every tile along the way, and crossing zoom 12.5-14.5 re-draped the terrain step by step, which
        // stuttered. Behind the cloud the camera jumps, so the map only draws where it leaves and lands.
        timeline
          // Not quite 0: the map keeps rendering under the cloud, so the new place loads before it clears.
          // Eases out, so the cloud shows up the moment the scroll starts instead of building slowly.
          .to(view, { cloud: 0.75, mapAlpha: 0.02, duration: 0.7, ease: "power1.out" }, at)
          .set(view, { ...close, zoom: closeUpZoom - 0.8, place: index }, at + 0.75)
          .to(view, { cloud: 0, mapAlpha: 1, duration: 0.8, ease: "power1.out" }, at + 0.8)
          .to(view, { zoom: closeUpZoom, duration: 0.9, ease: "power2.out" }, at + 0.8);
        const shown = at + textDelay;
        timeline
          .fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, shown)
          .fromTo(`${card} .story-place-role .story-char`, { yPercent: 110 }, { yPercent: 0, stagger: 0.008, duration: 0.4, ease: "power3.out" }, shown)
          .fromTo(
            `${card} .story-place-index, ${card} .story-place-organization, ${card} .story-place-detail, ${card} .story-place-meta`,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.35, ease: "power2.out" },
            shown + 0.1,
          )
          .to(pin, { scale: 1.2, duration: 0.3 }, shown)
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
        .to([".story-places", ".story-places-wash", ".story-pin-inner", ".story-rail"], { autoAlpha: 0, duration: 0.4 }, sky)
        // The climb stays over the last place and above zoom 14.5: pulling back to the overview loaded the
        // whole region at a near-horizontal tilt and brought the terrain back, which stuttered.
        .to(view, { zoom: Math.max(closeUpZoom - 1.5, 14.6), pitch: flat ? 0 : 80, hover: 0.3, duration: 1.6 }, sky)
        // Clouds start gathering as soon as the camera begins to tilt up, and the map dims with them,
        // so the page darkens gradually instead of dropping out at the end. The gathering gets the
        // spotlight: it plays longest, and the title waits until the sky has filled.
        // Stops short of a solid sheet so the billows keep their shape for the hand-off.
        .to(view, { cloud: 0.8, duration: 3.2, ease: "power1.inOut" }, sky + 0.2)
        // Gone well before the cloud fills: once hidden, the map stops drawing altogether.
        .to(view, { mapAlpha: 0, duration: 1.8, ease: "sine.inOut" }, sky + 0.3)
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
      const MAX_QUEUED = 3;
      // Hero → overview covers no camera flight, only quick fades, so that hop snaps instead of gliding.
      const INTRO_HOP = 0.35;
      const GLIDE = 1.5;
      // Hops between places pass through a cloud, which needs time to gather and clear.
      const PLACE_GLIDE = 2.4;
      // Scrolling up to the cloud is the showpiece, so it flies slower than any other hop.
      const CLOUD_GLIDE = 3;
      // A beat at each stop when gestures are chained, so the journey doesn't blur past.
      const CHAIN_PAUSE = 0.4;
      // Hurry: each extra scroll made while a glide is running (or a hard flick) speeds the journey up,
      // so someone racing through skips ahead instead of sitting through every animation. Speed 1 is the
      // reading pace; it resets once the page comes to rest.
      const MAX_URGENCY = 3;
      let urgency = 0;
      const speed = () => 1 + urgency * 1.5;
      let gliding = false;
      let glideDirection: 1 | -1 = 1;
      let queued = 0;
      let glideTween: gsap.core.Tween | null = null;
      // Applies the pace to the glide underway and to the scrub, whose 0.8 s smoothing would otherwise
      // keep the animation trailing behind a fast glide. (The scrub tween keeps its time scale between updates.)
      const hurry = (level: number) => {
        urgency = Math.min(Math.max(level, 0), MAX_URGENCY);
        glideTween?.timeScale(speed());
        trigger.getTween()?.timeScale(speed());
      };

      // The page uses CSS smooth scrolling for anchor links. During a glide it would smooth every
      // frame GSAP sets on top of GSAP's own easing, so the page lags behind and lands late.
      const root = document.documentElement;
      const goTo = (top: number, duration: number, onArrive?: () => void, ease = "power2.inOut") => {
        gliding = true;
        root.style.scrollBehavior = "auto";
        trigger.getTween()?.timeScale(speed());
        glideTween = gsap.to(window, {
          scrollTo: { y: top, autoKill: false },
          duration,
          ease,
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
        // Nowhere further to go (a chained gesture ran past the first or last state): release the page.
        // Gliding to where we already are would hold the scroll still for the whole glide.
        if (top === null || Math.abs(top - window.scrollY) < 2) {
          queued = 0;
          hurry(0);
          gliding = false;
          return;
        }
        // A fresh gesture glides at reading pace — unless it is the hop in or out of the hero, which
        // snaps, or the climb into the cloud, which takes its time. Explicit durations always win.
        const introHop = (direction > 0 && now < 0.9) || (direction < 0 && times[next] < 0.15);
        // The last hop (next === -1) is the climb through the clouds into the projects.
        const cloudHop = direction > 0 && (next === -1 || times[next] > sky);
        // Overview to first place counts too: it passes through the cloud as well.
        const firstPlace = timeline.labels.overview - 0.02;
        const lastPlace = arrivalOf(places.length - 1) + 0.02;
        const placeHop = next !== -1 && Math.min(now, times[next]) >= firstPlace && Math.max(now, times[next]) <= lastPlace;
        const pace = duration ?? (introHop ? INTRO_HOP : cloudHop ? CLOUD_GLIDE : placeHop ? PLACE_GLIDE : GLIDE) / speed();
        goTo(top, pace, () => {
          // Chained gestures play out one after another at full pace, with a short beat at each
          // stop so every frame registers. Input during the beat still counts toward the chain.
          // In a hurry, the beat shrinks to almost nothing.
          if (queued > 0 && inStory()) {
            queued -= 1;
            gliding = true;
            gsap.delayedCall(urgency ? 0.08 : CHAIN_PAUSE, () => glide(glideDirection));
          } else {
            queued = 0;
            // Stay hurried for a moment: another separate input soon after landing is still urgent.
            gsap.delayedCall(URGENT_WINDOW / 1000, () => {
              if (!gliding && performance.now() - lastInput >= URGENT_WINDOW) hurry(0);
            });
          }
        // Hops between places start at full speed, so the scroll answers at once; they still land softly.
        }, placeHop ? "power2.out" : undefined);
      };

      // Separate inputs (a new swipe, a new flick of the wheel) this close together mean hurry.
      const URGENT_WINDOW = 1200;
      let lastInput = -Infinity;
      const request = (direction: 1 | -1) => {
        const now = performance.now();
        const quick = now - lastInput < URGENT_WINDOW;
        lastInput = now;
        if (!gliding) {
          queued = 0;
          if (quick && direction === glideDirection) hurry(urgency + 1);
          glide(direction);
        } else if (direction === glideDirection) {
          queued = Math.min(queued + 1, MAX_QUEUED);
          // More input while already moving: hurry, including the glide that is underway.
          hurry(urgency + 1);
        } else {
          // Changed your mind: drop the queue and head back right away.
          queued = 0;
          hurry(0);
          glide(direction, 0.9);
        }
      };

      // One input, one step: a whole swipe or a whole spin of the wheel moves one state, however long it
      // runs. Browsers don't report fingers lifting, so a new input is read from the stream itself:
      // - a pause (the previous input ended), or
      // - the stream speeding up again: momentum after a lift only ever fades, so a rise is a new swipe.
      // Separate inputs close together then hurry the journey (see request).
      let lastWheel = 0;
      let lastMagnitude = 0;
      let gestureStart = 0;
      // Smoothed speed of the stream, so a single wobbly momentum event doesn't read as a new swipe.
      let pace = 0;
      // Scrolling back up from the projects, momentum carries the page into the story between two stops.
      // The rest of that gesture would be blocked without counting, freezing the page; it moves on instead.
      let wasFree = true;
      // Trackpads send a steady stream of small pixel deltas with a long momentum tail; mouse wheels send
      // whole notches of 50 px or more.
      let trackpad = false;
      // A trackpad swipe only counts once it has travelled this far, so a brush of the fingers does nothing.
      const TRACKPAD_STEP = 40;
      let gestureDistance = 0;
      let armed = false;
      const handleWheel = (event: WheelEvent) => {
        if (event.ctrlKey) return;
        const now = performance.now();
        // Some mouse wheels report lines, not pixels.
        const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
        const magnitude = Math.abs(delta);
        // Fingers and momentum leave short gaps mid-gesture, so a trackpad needs a longer pause.
        const paused = now - lastWheel > (trackpad ? 220 : 150);
        if (handsOff(delta)) {
          // Momentum left over from an input the story handled (say, after the climb into the projects
          // lands) is absorbed, or it would carry the page on past the stop. A pause frees it.
          if (!wasFree && !paused) {
            event.preventDefault();
            lastWheel = now;
            pace = pace * 0.7 + magnitude * 0.3;
            return;
          }
          wasFree = true;
          return;
        }
        event.preventDefault();
        const entered = wasFree;
        wasFree = false;
        const rising = now - gestureStart > 250 && magnitude > pace * 2 + 10 && magnitude > lastMagnitude;
        lastWheel = now;
        lastMagnitude = magnitude;
        pace = paused ? magnitude : pace * 0.7 + magnitude * 0.3;
        const direction = delta > 0 ? 1 : -1;
        if (entered || paused || rising) {
          gestureStart = now;
          gestureDistance = 0;
          trackpad = event.deltaMode === 0 && (magnitude < 40 || event.deltaX !== 0);
          armed = true;
        }
        // Each input makes its one step: a wheel notch at once, a trackpad swipe once it has travelled.
        gestureDistance += magnitude;
        if (armed && (!trackpad || gestureDistance >= TRACKPAD_STEP)) {
          armed = false;
          request(direction);
        }
      };

      let touchStartY = 0;
      let touchStartTime = 0;
      const handleTouchStart = (event: TouchEvent) => {
        touchStartY = event.touches[0].clientY;
        touchStartTime = performance.now();
      };
      const handleTouchMove = (event: TouchEvent) => {
        // The first move of a swipe barely moves, so its direction reads as 0. Blocking it would cancel
        // the whole swipe (browsers decide on the first move), so at the end of the story only a swipe
        // that is clearly heading back up is taken over.
        const distance = touchStartY - event.touches[0].clientY;
        const atEnd = window.scrollY >= trigger.end - 2;
        // Once the browser has started scrolling, the event can't be cancelled (and warns if we try).
        if (event.cancelable && inStory() && !(atEnd && distance >= 0)) event.preventDefault();
      };
      // Each swipe is one gesture.
      const handleTouchEnd = (event: TouchEvent) => {
        const distance = touchStartY - event.changedTouches[0].clientY;
        if (handsOff(distance) || Math.abs(distance) < 30) return;
        // A fast flick (over 1.5 px per ms) is in a hurry from the start.
        if (Math.abs(distance) / Math.max(performance.now() - touchStartTime, 1) > 1.5) hurry(Math.max(urgency, 1));
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
        hurry(0);
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
        {/* The chapter text's wash sits under the cloud, so cloud passes drift over it; the text stays on top. */}
        <div className="story-wash" aria-hidden="true">
          <div className="story-frame site-shell">
            <div className="story-places-wash" />
          </div>
        </div>
        <canvas className="story-cloud" ref={cloudRef} aria-hidden="true" />

        <div className="story-overlay">
          <div className="story-frame site-shell">
            <div className="story-intro">
              <div className="story-intro-copy">
                <p className="hero-kicker">
                  Software Engineer · <strong>Cagayan de Oro, Philippines</strong>
                </p>
                <h1 className="display-title">Javier Raut</h1>
                <p className="body-large story-summary">
                  I learn computing from the ground up, from software down to infrastructure. Currently
                  working on Geographic Information Systems, and teaching Fundamentals of Database Systems
                  on the side.
                </p>
                {/* For visitors who want specifics: the current roles, straight from the journey's places. */}
                <dl className="story-now">
                  {places
                    .filter((place) => place.current)
                    .map((place) => (
                      <div key={place.id}>
                        <dt>{place.role}</dt>
                        <dd>{place.organization}</dd>
                      </div>
                    ))}
                </dl>
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
                <span className="story-plate-line"><span>The work</span></span>
                <span className="story-plate-line"><span>so far</span></span>
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
