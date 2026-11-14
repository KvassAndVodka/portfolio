"use client";

import { useLayoutEffect, useRef, useState } from "react";

const pad = (value: number) => String(value).padStart(2, "0");

type AdminTabsProps<T extends string> = Readonly<{
  label: string;
  options: readonly { value: T; text: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}>;

/**
 * A row of mono tabs with one orange rule that slides to the chosen tab. The rule moves with a transform
 * (translate and scale on a 1px line), so the slide stays on the compositor; it is placed without motion
 * on first paint so it doesn't fly in when the page opens.
 */
export default function AdminTabs<T extends string>({ label, options, value, onChange }: AdminTabsProps<T>) {
  const groupRef = useRef<HTMLFieldSetElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const place = () => {
      const group = groupRef.current;
      const tab = group?.querySelector<HTMLElement>('[aria-pressed="true"]');
      const rule = ruleRef.current;
      if (!group || !tab || !rule) return;
      // Fractional positions: whole-pixel offsets can end past the last tab and make the row scroll.
      const left = tab.getBoundingClientRect().left - group.getBoundingClientRect().left + group.scrollLeft;
      rule.style.transform = `translateX(${left}px) scaleX(${tab.getBoundingClientRect().width})`;
    };
    place();
    // Turn the transition on only after the first placement.
    const frame = requestAnimationFrame(() => setReady(true));
    const observer = new ResizeObserver(place);
    if (groupRef.current) observer.observe(groupRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [value, options]);

  return (
    <fieldset ref={groupRef} className="admin-tabs -mb-px flex gap-6 overflow-x-auto">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.text}{option.count !== undefined && <> <span className="text-[var(--accent)]">{pad(option.count)}</span></>}
        </button>
      ))}
      <span ref={ruleRef} aria-hidden="true" className="admin-tabs-rule" data-ready={ready || undefined} />
    </fieldset>
  );
}
