"use client";

import { useTheme } from "next-themes";
import { FaDesktop, FaMoon, FaSun } from "react-icons/fa6";

const options = [{ value: "light", label: "Light", icon: FaSun }, { value: "dark", label: "Dark", icon: FaMoon }, { value: "system", label: "System", icon: FaDesktop }];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  return <fieldset><legend className="text-sm font-medium">Interface theme</legend><div className="mt-3 grid grid-cols-3 gap-2" suppressHydrationWarning>{options.map((option) => { const Icon = option.icon; const selected = theme === option.value; return <button key={option.value} type="button" onClick={() => setTheme(option.value)} aria-pressed={selected} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border text-sm font-medium ${selected ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "border-[var(--admin-border)] admin-muted hover:bg-[var(--admin-surface-subtle)]"}`}><Icon aria-hidden="true" />{option.label}</button>; })}</div></fieldset>;
}
