"use client";

import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const emptySubscribe = () => () => undefined;

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const iconRef = useRef<HTMLSpanElement>(null);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  useGSAP(
    () => {
      if (!mounted || prefersReducedMotion()) return;
      gsap.fromTo(
        iconRef.current,
        { autoAlpha: 0, rotate: -45, scale: 0.9 },
        { autoAlpha: 1, rotate: 0, scale: 1, duration: 0.2 },
      );
    },
    { dependencies: [isDark, mounted] },
  );

  return (
    <button
      type="button"
      className="theme-toggle flex min-h-11 min-w-11 items-center justify-center rounded-[0.75rem] border site-rule px-3 text-xs font-semibold text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]"
      aria-label={mounted ? `Switch to ${nextTheme} mode` : "Change color theme"}
      title={mounted ? `Switch to ${nextTheme} mode` : "Change color theme"}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
    >
      {mounted && (
        <span className="inline-flex" ref={iconRef}>
          {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
        </span>
      )}
    </button>
  );
}
