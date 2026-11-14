"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FaXmark } from "react-icons/fa6";

type ToastAction = { label: string; onClick: () => void | Promise<void> };
type Toast = { id: number; label: string; message: string; tone: "success" | "error"; action?: ToastAction; leaving?: boolean };

const DURATION = 4000;
const EXIT = 200;
const MAX = 3;

// A tiny store: toast() can be called from anywhere (event handlers, form actions) without context or hooks.
let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const serverSnapshot: Toast[] = [];

function dismiss(id: number) {
  // Mark it leaving so it can animate out (faster than it came in), then drop it.
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, EXIT);
}

/**
 * Shows a short confirmation in the admin: a mono `label` on the stub ("Saved", "Trash"), one line of message,
 * and optionally one button, such as Undo.
 */
export function toast(message: string, options: { label?: string; tone?: "success" | "error"; action?: ToastAction } = {}) {
  const tone = options.tone ?? "success";
  const item: Toast = { id: nextId++, label: options.label ?? (tone === "error" ? "Error" : "Done"), message, tone, action: options.action };
  toasts = [...toasts, item];
  // Only the newest few stay; the oldest leave.
  const visible = toasts.filter((t) => !t.leaving);
  if (visible.length > MAX) visible.slice(0, visible.length - MAX).forEach((t) => dismiss(t.id));
  emit();
}

function ToastItem({ item, depth }: Readonly<{ item: Toast; depth: number }>) {
  const [busy, setBusy] = useState(false);
  const left = useRef(DURATION);
  const paused = useRef(false);

  // Counts down only while visible and not hovered: a toast never expires in a background tab or under the pointer.
  useEffect(() => {
    if (item.leaving) return;
    let last = performance.now();
    const tick = window.setInterval(() => {
      const now = performance.now();
      // Hovering anywhere on the stack (it fans out) pauses every toast in it.
      const held = paused.current || document.querySelector(".toaster:hover") !== null;
      if (!held && document.visibilityState === "visible") left.current -= now - last;
      last = now;
      if (left.current <= 0) dismiss(item.id);
    }, 100);
    return () => window.clearInterval(tick);
  }, [item.id, item.leaving]);

  return (
    <li
      className="toast"
      style={{ "--depth": depth } as React.CSSProperties}
      data-behind={depth > 0 || undefined}
      data-tone={item.tone}
      data-leaving={item.leaving || undefined}
      role={item.tone === "error" ? "alert" : undefined}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <span className="toast-stub">{item.label}</span>
      <p title={item.message}>{item.message}</p>
      {item.action && (
        <button
          type="button"
          className="toast-action"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await item.action?.onClick();
            } finally {
              dismiss(item.id);
            }
          }}
        >
          {item.action.label}
        </button>
      )}
      <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => dismiss(item.id)}>
        <FaXmark aria-hidden="true" />
      </button>
    </li>
  );
}

/** Mounted once in the admin shell, so toasts survive moving between admin pages. */
export default function Toaster() {
  const items = useSyncExternalStore(subscribe, () => toasts, () => serverSnapshot);
  // Depth counts back from the newest toast that isn't leaving: 0 in front, then 1, 2 tucked behind it.
  const staying = items.filter((item) => !item.leaving);
  return (
    <ol className="toaster" aria-live="polite" aria-label="Notifications">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} depth={item.leaving ? 0 : staying.length - 1 - staying.indexOf(item)} />
      ))}
    </ol>
  );
}
