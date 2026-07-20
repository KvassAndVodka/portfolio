"use client";

import { useEffect, useRef } from "react";

interface Pulse {
  x: number;
  y: number;
  age: number;
  life: number;
  strength: number;
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = 42;
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let dampeningMap: number[] = [];
    let accent = "201, 67, 18";
    let grid = "98, 98, 94";
    let baseAlpha = 0.1;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / gridSize);
      rows = Math.ceil(height / gridSize);
      dampeningMap = new Array((cols + 1) * rows + (rows + 1) * cols).fill(0);
    };

    const updatePalette = () => {
      const styles = getComputedStyle(document.documentElement);
      accent = styles.getPropertyValue("--canvas-accent-rgb").trim() || accent;
      grid = styles.getPropertyValue("--canvas-grid-rgb").trim() || grid;
      baseAlpha = Number.parseFloat(styles.getPropertyValue("--canvas-grid-alpha")) || 0.1;
    };

    let pulses: Pulse[] = [];
    let frameId = 0;
    let isVisible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const spawnPulse = (targetX?: number, targetY?: number, strength = 1) => {
      const x = targetX ?? Math.floor(Math.random() * cols);
      const y = targetY ?? Math.floor(Math.random() * rows);
      pulses = [...pulses.slice(-4), { x, y, age: 0, life: 4.8, strength }];
    };

    let lastTime = 0;
    const mouse = { x: -1000, y: -1000 };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const rect = canvas.getBoundingClientRect();
      spawnPulse(
        Math.round((event.clientX - rect.left) / gridSize),
        Math.round((event.clientY - rect.top) / gridSize),
        1.35,
      );
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (!isVisible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        return;
      }

      lastTime = performance.now();
      if (reducedMotion.matches) {
        drawGrid(0, false);
      } else if (!frameId) {
        frameId = requestAnimationFrame(draw);
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("visibilitychange", handleVisibility);

    const drawLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      intensity: number,
    ) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (intensity > 0.05) {
        const alpha = Math.min(0.72, baseAlpha + intensity * 0.55);
        const lineWidth = 1 + intensity * 0.55;
        ctx.strokeStyle =
          intensity > 1.08
            ? `rgba(255, 247, 241, ${Math.min(alpha, 0.82)})`
            : `rgba(${accent}, ${alpha})`;
        ctx.lineWidth = intensity > 1.08 ? lineWidth * 1.25 : lineWidth;
      } else {
        ctx.strokeStyle = `rgba(${grid}, ${baseAlpha})`;
        ctx.lineWidth = 1;
      }

      ctx.stroke();
    };

    const drawGrid = (deltaTime: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);

      if (animate) {
        pulses.forEach((pulse) => (pulse.age += deltaTime));
        pulses = pulses.filter((pulse) => pulse.age < pulse.life);
        if (Math.random() < 0.24 * deltaTime) spawnPulse();
      }

      const getIntensity = (cx: number, cy: number) => {
        let intensity = 0;
        let activeSources = 0;
        const mouseDistance = Math.hypot(cx - mouse.x / gridSize, cy - mouse.y / gridSize);

        if (animate && mouseDistance < 4.2) {
          const mouseIntensity = (1 - mouseDistance / 4.2) * 0.92;
          intensity += mouseIntensity;
          if (mouseIntensity > 0.1) activeSources += 1;
        }

        for (const pulse of pulses) {
          const distance = Math.hypot(cx - pulse.x, cy - pulse.y);
          const radius = pulse.age * 10.5;
          const difference = Math.abs(distance - radius);

          if (difference < 1.8) {
            const decay = Math.max(0, 1 - pulse.age / pulse.life);
            const pulseIntensity = (1 - difference / 1.8) * decay * pulse.strength;
            intensity += pulseIntensity;
            if (pulseIntensity > 0.1) activeSources += 1;
          }
        }

        return { activeSources, intensity };
      };

      for (let i = 0; i <= cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const { activeSources, intensity } = getIntensity(i, j + 0.5);
          const mapIndex = i * rows + j;
          dampeningMap[mapIndex] =
            activeSources > 1 && intensity > 0.5
              ? Math.min(dampeningMap[mapIndex] + 4.8 * deltaTime, 1)
              : Math.max(dampeningMap[mapIndex] - 0.42 * deltaTime, 0);
          drawLine(
            i * gridSize,
            j * gridSize,
            i * gridSize,
            (j + 1) * gridSize,
            Math.max(0, intensity - dampeningMap[mapIndex]),
          );
        }
      }

      const horizontalOffset = (cols + 1) * rows;
      for (let j = 0; j <= rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const { activeSources, intensity } = getIntensity(i + 0.5, j);
          const mapIndex = horizontalOffset + j * cols + i;
          dampeningMap[mapIndex] =
            activeSources > 1 && intensity > 0.5
              ? Math.min(dampeningMap[mapIndex] + 4.8 * deltaTime, 1)
              : Math.max(dampeningMap[mapIndex] - 0.42 * deltaTime, 0);
          drawLine(
            i * gridSize,
            j * gridSize,
            (i + 1) * gridSize,
            j * gridSize,
            Math.max(0, intensity - dampeningMap[mapIndex]),
          );
        }
      }
    };

    const draw = (timestamp: number) => {
      if (!isVisible || reducedMotion.matches) {
        frameId = 0;
        return;
      }

      if (!lastTime) lastTime = timestamp;
      const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      drawGrid(deltaTime, true);
      frameId = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion.matches) drawGrid(0, false);
    });
    const themeObserver = new MutationObserver(() => {
      updatePalette();
      if (reducedMotion.matches) drawGrid(0, false);
    });
    const handleMotionPreference = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      pulses = [];
      lastTime = performance.now();

      if (reducedMotion.matches) {
        drawGrid(0, false);
      } else if (isVisible) {
        frameId = requestAnimationFrame(draw);
      }
    };

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
