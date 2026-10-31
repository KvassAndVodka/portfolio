"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

import { ASCII_FIELD_STRENGTH, cloudClock, createCloud, type Cloud } from "./cloud";
import { cloudColors, readTheme } from "./StoryJourney";

/**
 * The drifting ASCII cloud behind the projects: the same cloud the story
 * ends on, so the work reads as living up there. Draws only while on screen.
 */
export default function CloudField({
  children,
  className = "",
  id,
}: Readonly<{ children: React.ReactNode; className?: string; id?: string }>) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloud = useRef<Cloud | null>(null);
  const { resolvedTheme } = useTheme();

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      cloud.current = createCloud(canvas, window.matchMedia("(max-width: 767px)").matches ? 0.75 : 1);
      if (!cloud.current) return;
      cloud.current.setColors(cloudColors(readTheme()));

      let frame = 0;
      const draw = () => {
        cloud.current?.render(0, cloudClock(), 1, ASCII_FIELD_STRENGTH);
        frame = requestAnimationFrame(draw);
      };
      const start = () => {
        if (!frame) frame = requestAnimationFrame(draw);
      };
      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
      };

      // Reduced motion gets one still frame instead of drift.
      if (prefersReducedMotion()) {
        cloud.current.render(0, 0, 1, ASCII_FIELD_STRENGTH);
      } else {
        // Right after the story, this section overlaps the story's last screen, where the story's own
        // cloud is already drawing. This cloud only takes over once that story has scrolled away, so the
        // two never run at once. Anywhere else, it runs whenever the section is on screen.
        const root = rootRef.current!;
        const afterStory = () => !!root.previousElementSibling?.matches('.story:not([data-mode="static"])');
        let onScreen = false;
        let pastStory = false;
        const update = () => {
          const active = onScreen && (pastStory || !afterStory());
          root.toggleAttribute("data-cloud-active", active);
          if (active) start();
          else stop();
        };
        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            onScreen = self.isActive;
            update();
          },
        });
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          onToggle: (self) => {
            pastStory = self.isActive;
            update();
          },
        });
      }

      const handlePointer = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const bounds = canvas.getBoundingClientRect();
        cloud.current?.setPointer(event.clientX - bounds.left, event.clientY - bounds.top);
      };
      // The section grows as project cards load, so track its size, not the window's.
      const resize = new ResizeObserver(() => {
        cloud.current?.resize();
        if (prefersReducedMotion()) cloud.current?.render(0, 0, 1, ASCII_FIELD_STRENGTH);
      });
      resize.observe(canvas);
      window.addEventListener("pointermove", handlePointer, { passive: true });

      return () => {
        stop();
        resize.disconnect();
        window.removeEventListener("pointermove", handlePointer);
        cloud.current?.destroy();
        cloud.current = null;
      };
    },
    { scope: rootRef },
  );

  // next-themes swaps the html class after this effect, so read the tokens a frame later.
  useEffect(() => {
    const frame = requestAnimationFrame(() => cloud.current?.setColors(cloudColors(readTheme())));
    return () => cancelAnimationFrame(frame);
  }, [resolvedTheme]);

  return (
    <section className={`cloud-field ${className}`} id={id} ref={rootRef}>
      <canvas className="cloud-field-canvas" ref={canvasRef} aria-hidden="true" />
      {children}
    </section>
  );
}
