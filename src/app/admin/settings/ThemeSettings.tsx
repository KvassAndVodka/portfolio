"use client";

import { useTheme } from "next-themes";
import { FaDesktop, FaMoon, FaSun } from "react-icons/fa6";

const options = [{ value: "light", label: "Light", icon: FaSun }, { value: "dark", label: "Dark", icon: FaMoon }, { value: "system", label: "System", icon: FaDesktop }];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  return <fieldset><legend className="admin-label site-muted">Theme</legend><div className="mt-3 grid grid-cols-3 gap-2" suppressHydrationWarning>{options.map((option) => { const Icon = option.icon; const selected = theme === option.value; return <button key={option.value} type="button" onClick={() => setTheme(option.value)} aria-pressed={selected} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-[8px] border text-sm ${selected ? "border-[var(--foreground)] font-semibold" : "border-[var(--line)] site-muted hover:border-[var(--foreground)]"}`}><Icon aria-hidden="true" />{option.label}</button>; })}</div></fieldset>;
}
