"use client";
// PROTOTYPE: floating variant/page switcher. Never rendered in production (route 404s there).

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageLabels, pages, type PageKey } from "./sample-data";

const variants = [
  { key: "D", name: "Postcard desk" },
];

export default function PrototypeSwitcher({ variant, page }: Readonly<{ variant: string; page: PageKey }>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const index = Math.max(0, variants.findIndex((v) => v.key === variant));

  const go = (next: Record<string, string>) => {
    const query = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => query.set(k, v));
    router.replace(`${pathname}?${query}`, { scroll: false });
  };
  const cycle = (step: number) => go({ variant: variants[(index + step + variants.length) % variants.length].key });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowLeft") cycle(-1);
      if (event.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#111] p-1 text-xs text-white shadow-2xl ring-1 ring-white/20 max-md:bottom-20">
      <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-white/15" onClick={() => cycle(-1)} aria-label="Previous variant">←</button>
      <span className="px-2 font-semibold tabular-nums">{variants[index].key} · {variants[index].name}</span>
      <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-white/15" onClick={() => cycle(1)} aria-label="Next variant">→</button>
      <label className="ml-1"><span className="sr-only">Page</span>
        <select className="h-8 rounded-full bg-white/10 px-2 text-white" value={page} onChange={(e) => go({ page: e.currentTarget.value })}>
          {pages.map((p) => <option key={p} value={p} className="text-black">{pageLabels[p]}</option>)}
        </select>
      </label>
    </div>
  );
}
