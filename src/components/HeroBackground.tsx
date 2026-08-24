"use client";

import { useEffect, useRef } from "react";

/*
 * THESIS: Show a system being refined under pressure, not a generic developer grid or terminal.
 * OWN-WORLD: Quiet neutral traces, one vivid orange-red signal, hard checkpoints, and no glow or particles.
 * STORY: Ideas can be disturbed; deliberate process brings them back into a dependable shape.
 * FIRST VIEWPORT: Traces gather behind the portrait while the copy remains calm and immediately legible.
 * FORM: A directly shaped precision trace for this local hero redesign; no concept seed was required.
 */

interface Disturbance {
  x: number;
  y: number;
  age: number;
}

const TRACE_COUNT = 13;
const TRACE_STEP = 12;
const OPENING_DELAY_MS = 60;
const OPENING_DURATION_MS = 960;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edgeStart: number, edgeEnd: number, value: number) => {
  const progress = clamp((value - edgeStart) / (edgeEnd - edgeStart), 0, 1);
  return progress * progress * (3 - 2 * progress);
};

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 1;
    let height = 1;
    let frameId = 0;
    let lastTime = 0;
    let isVisible = true;
    let openingStartedAt = 0;
    let accent = "255, 90, 36";
    let trace = "114, 110, 103";
    let traceAlpha = 0.14;
    let disturbances: Disturbance[] = [];

    const pointer = {
      x: -10_000,
      y: -10_000,
      active: false,
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const updatePalette = () => {
      const styles = getComputedStyle(document.documentElement);
      accent = styles.getPropertyValue("--canvas-accent-rgb").trim() || accent;
      trace = styles.getPropertyValue("--canvas-trace-rgb").trim() || trace;
      traceAlpha =
        Number.parseFloat(styles.getPropertyValue("--canvas-trace-alpha")) || traceAlpha;
    };

    const getTraceY = (
      traceIndex: number,
      x: number,
      elapsed: number,
      allowInteraction: boolean,
    ) => {
      const progress = x / Math.max(width, 1);
      const indexPosition = traceIndex / (TRACE_COUNT - 1) - 0.5;
      const fieldCenter = height * 0.54;
      const fieldSpread = Math.min(height * 0.62, 520);
      const settling = 1 - smoothstep(0.5, 0.92, progress) * 0.72;
      const phase = traceIndex * 0.68;
      const primaryWave =
        Math.sin(progress * Math.PI * 2.35 + phase + elapsed * 0.00022) *
        (20 + Math.abs(indexPosition) * 32) *
        settling;
      const secondaryWave =
        Math.sin(progress * Math.PI * 5.2 - phase * 0.45 - elapsed * 0.00011) *
        8 *
        settling;
      const convergence =
        Math.exp(-Math.pow((progress - 0.72) / 0.12, 2)) *
        indexPosition *
        fieldSpread *
        -0.24;

      let y =
        fieldCenter +
        indexPosition * fieldSpread +
        primaryWave +
        secondaryWave +
        convergence;

      if (!allowInteraction) return y;

      const sources: Array<{ x: number; y: number; strength: number }> = [];

      if (pointer.active) {
        sources.push({ x: pointer.x, y: pointer.y, strength: 30 });
      }

      for (const disturbance of disturbances) {
        const decay = 1 - clamp(disturbance.age / 1.6, 0, 1);
        sources.push({
          x: disturbance.x,
          y: disturbance.y,
          strength: 54 * decay,
        });
      }

      for (const source of sources) {
        const distanceX = x - source.x;
        const distanceY = y - source.y;
        const distance = Math.hypot(distanceX, distanceY);
        const radius = Math.min(width * 0.15, 170);

        if (distance < radius) {
          const falloff = Math.pow(1 - distance / radius, 2);
          const direction = distanceY === 0 ? (traceIndex % 2 ? 1 : -1) : Math.sign(distanceY);
          y += direction * source.strength * falloff;
        }
      }

      return y;
    };

    const draw = (elapsed: number, animate: boolean) => {
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      const allowInteraction = animate && !reducedMotion.matches;
      if (!openingStartedAt) openingStartedAt = elapsed;
      const openingElapsed = elapsed - openingStartedAt - OPENING_DELAY_MS;
      const openingProgress = clamp(openingElapsed / OPENING_DURATION_MS, 0, 1);
      const openingIntensity = 1 - smoothstep(0.56, 1, openingProgress);
      const signalIndex = Math.floor(TRACE_COUNT * 0.62);

      disturbances = disturbances
        .map((disturbance) => ({
          ...disturbance,
          age: disturbance.age + Math.min((elapsed - lastTime) / 1000, 0.05),
        }))
        .filter((disturbance) => disturbance.age < 1.6);

      for (let traceIndex = 0; traceIndex < TRACE_COUNT; traceIndex += 1) {
        const distanceFromSignal = Math.abs(traceIndex - signalIndex);
        const revealStart = 0.04 + distanceFromSignal * 0.018;
        const revealProgress = smoothstep(revealStart, revealStart + 0.68, openingProgress);
        const revealOpacity = smoothstep(revealStart, revealStart + 0.2, openingProgress);

        if (revealProgress <= 0) continue;

        const startX = -TRACE_STEP;
        const revealX = startX + (width + TRACE_STEP * 2) * revealProgress;
        context.beginPath();
        context.moveTo(startX, getTraceY(traceIndex, startX, elapsed, allowInteraction));

        for (let x = 0; x < revealX; x += TRACE_STEP) {
          const y = getTraceY(traceIndex, x, elapsed, allowInteraction);
          context.lineTo(x, y);
        }
        context.lineTo(revealX, getTraceY(traceIndex, revealX, elapsed, allowInteraction));

        const isSignal = traceIndex === signalIndex;
        context.strokeStyle = isSignal
          ? `rgba(${accent}, ${traceAlpha * (2.8 + openingIntensity * 1.1) * revealOpacity})`
          : `rgba(${trace}, ${traceAlpha * (0.7 + (traceIndex % 3) * 0.18 + openingIntensity * 0.28) * revealOpacity})`;
        context.lineWidth = isSignal ? 1.7 : 1;
        context.stroke();
      }

      const steadyElapsed = Math.max(0, openingElapsed - OPENING_DURATION_MS);
      const signalProgress =
        openingProgress < 1
          ? smoothstep(0.12, 0.92, openingProgress) * 0.82
          : animate
            ? (0.82 + steadyElapsed * 0.00007) % 1
            : 0.74;
      const signalX = signalProgress * width;
      const signalY = getTraceY(signalIndex, signalX, elapsed, false);
      const signalOpacity = smoothstep(0.12, 0.28, openingProgress);

      context.beginPath();
      context.arc(signalX, signalY, 3.2 + openingIntensity * 1.4, 0, Math.PI * 2);
      context.fillStyle = `rgba(${accent}, ${signalOpacity})`;
      context.fill();

      return openingProgress;
    };

    const renderFrame = (timestamp: number) => {
      if (!isVisible || reducedMotion.matches) {
        frameId = 0;
        return;
      }

      if (!lastTime) lastTime = timestamp;
      draw(timestamp, true);
      lastTime = timestamp;
      frameId = requestAnimationFrame(renderFrame);
    };

    const renderStatic = () => {
      lastTime = 0;
      openingStartedAt = -(OPENING_DELAY_MS + OPENING_DURATION_MS);
      disturbances = [];
      draw(0, false);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      disturbances = [
        ...disturbances.slice(-2),
        {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          age: 0,
        },
      ];
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;

      if (!isVisible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        return;
      }

      if (reducedMotion.matches) renderStatic();
      else if (!frameId) frameId = requestAnimationFrame(renderFrame);
    };

    const handleMotionPreference = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      pointer.active = false;

      if (reducedMotion.matches) renderStatic();
      else if (isVisible) {
        openingStartedAt = 0;
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion.matches) renderStatic();
    });
    const themeObserver = new MutationObserver(() => {
      updatePalette();
      if (reducedMotion.matches) renderStatic();
    });

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("visibilitychange", handleVisibility);
    resizeObserver.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    reducedMotion.addEventListener("change", handleMotionPreference);

    updatePalette();
    resize();
    handleMotionPreference();

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="hero-field" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-field-canvas" />
      <div className="hero-field-vignette" />
    </div>
  );
}
