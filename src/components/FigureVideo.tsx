"use client";

import { useEffect, useRef } from "react";

import useReducedMotion from "@/hooks/useReducedMotion";

/** A silent looping clip that plays only while on screen. Under reduced motion it waits for the reader's controls. */
export default function FigureVideo({ src, label }: Readonly<{ src: string; label: string }>) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Set imperatively so the server render and hydration agree.
    video.controls = reduced;
    if (reduced) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced]);

  return <video ref={ref} src={src} aria-label={label} muted loop playsInline preload="metadata" />;
}
