"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, Flip, SplitText);

// Matches the --ease-out-expo token used across the site.
gsap.registerEase("outExpo", (progress) => (progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)));
gsap.defaults({ ease: "outExpo", duration: 0.76 });
// Several tweens target elements that only render in some states (errors, empty filters).
gsap.config({ nullTargetWarn: false });

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches;
}

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP };
