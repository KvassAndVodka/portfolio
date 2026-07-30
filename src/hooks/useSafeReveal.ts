"use client";

import {
  useInView,
  useReducedMotion,
  type UseInViewOptions,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type SafeRevealOptions = Readonly<{
  amount?: number;
  margin?: UseInViewOptions["margin"];
}>;

export default function useSafeReveal<T extends HTMLElement>({
  amount = 0.12,
  margin = "0px 0px -14% 0px",
}: SafeRevealOptions = {}) {
  const ref = useRef<T>(null);
  const isInView = useInView(ref, { amount, margin, once: true });
  const reduceMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (reduceMotion || isInView) return;

    const revealIfReached = () => {
      const element = ref.current;
      if (!element) return;

      const bounds = element.getBoundingClientRect();
      if (bounds.top <= window.innerHeight * 0.82) {
        setIsRevealed(true);
      }
    };

    const initialCheck = window.requestAnimationFrame(revealIfReached);
    window.addEventListener("scroll", revealIfReached, { passive: true });
    window.addEventListener("resize", revealIfReached);
    const fallback = window.setTimeout(revealIfReached, 1_200);

    return () => {
      window.cancelAnimationFrame(initialCheck);
      window.clearTimeout(fallback);
      window.removeEventListener("scroll", revealIfReached);
      window.removeEventListener("resize", revealIfReached);
    };
  }, [isInView, reduceMotion]);

  return {
    ref,
    isRevealed: isRevealed || isInView || Boolean(reduceMotion),
    reduceMotion,
  };
}
