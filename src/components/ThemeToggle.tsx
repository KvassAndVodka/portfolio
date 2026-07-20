"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

const emptySubscribe = () => () => undefined;

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-[0.75rem] border site-rule px-3 text-xs font-semibold text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]"
      aria-label={mounted ? `Switch to ${nextTheme} mode` : "Change color theme"}
      title={mounted ? `Switch to ${nextTheme} mode` : "Change color theme"}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
    >
      {mounted ? (isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />) : null}
    </button>
  );
}
