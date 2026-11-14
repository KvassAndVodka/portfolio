"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { switchTheme } from "@/lib/themeTransition";

const options = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

const emptySubscribe = () => () => undefined;

/** A thumbnail of the site in one palette: the paper, the header strip, a title with the orange full stop. */
function Miniature({ tone }: Readonly<{ tone: "light" | "dark" }>) {
  return (
    <span className={`theme-mini theme-mini-${tone}`} aria-hidden="true">
      <span className="theme-mini-strip">
        <span className="theme-mini-mark" />
        <span className="theme-mini-tab" />
      </span>
      <span className="theme-mini-title" />
      <span className="theme-mini-line" />
      <span className="theme-mini-line theme-mini-line-short" />
    </span>
  );
}

/**
 * The theme as three live miniatures of the site, so you see the choice before you make it. "System" is split
 * diagonally between the two. The selection only renders after mount: the server can't know the saved theme.
 */
export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <fieldset>
      <legend className="admin-label site-muted">Theme</legend>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {options.map((option) => {
          const selected = mounted && theme === option.value;
          return (
            <button key={option.value} type="button" className="theme-option" aria-pressed={selected} onClick={(event) => switchTheme(setTheme, option.value, event.currentTarget)}>
              <span className="theme-option-frame">
                {option.value === "system" ? (
                  <span className="theme-mini-split">
                    <Miniature tone="light" />
                    <Miniature tone="dark" />
                  </span>
                ) : (
                  <Miniature tone={option.value} />
                )}
              </span>
              <span className="theme-option-label">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
