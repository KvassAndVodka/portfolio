"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

const emptySubscribe = () => () => undefined;

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <m.button
      type="button"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-[0.75rem] border site-rule px-3 text-xs font-semibold text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]"
      aria-label={mounted ? `Switch to ${nextTheme} mode` : "Change color theme"}
      title={mounted ? `Switch to ${nextTheme} mode` : "Change color theme"}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
      whileHover={reduceMotion ? undefined : { rotate: 4, scale: 1.04 }}
      whileTap={reduceMotion ? undefined : { rotate: -8, scale: 0.9 }}
    >
      <AnimatePresence initial={false} mode="wait">
        {mounted && (
          <m.span
            key={isDark ? "sun" : "moon"}
            initial={reduceMotion ? false : { opacity: 0, rotate: -90, scale: 0.65 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotate: 90, scale: 0.65 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </m.span>
        )}
      </AnimatePresence>
    </m.button>
  );
}
