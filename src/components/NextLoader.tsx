"use client";

import NextTopLoader from 'nextjs-toploader';

import useReducedMotion from '@/hooks/useReducedMotion';

export default function NextLoader() {
  const reducedMotion = useReducedMotion();

  return (
    <NextTopLoader
      color="var(--accent)"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={!reducedMotion}
      showSpinner={false}
      easing={reducedMotion ? "linear" : "ease"}
      speed={reducedMotion ? 0 : 200}
      shadow={false}
      zIndex={1600}
      showAtBottom={false}
    />
  );
}
