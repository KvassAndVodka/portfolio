"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaChevronUp, FaRegCalendar } from "react-icons/fa6";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const pad = (value: number) => String(value).padStart(2, "0");

/** "YYYY-MM-DDTHH:mm" in local time, the same shape a datetime-local input submits. */
function toValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  return match ? new Date(+match[1], +match[2] - 1, +match[3], +match[4], +match[5]) : null;
}

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

type DateTimeFieldProps = Readonly<{
  id: string;
  name: string;
  defaultValue?: string;
  className: string;
  invalid?: boolean;
  required?: boolean;
}>;

/**
 * A date and time field in the site's style, replacing the browser's datetime-local popup (which a page
 * cannot restyle). Submits the same "YYYY-MM-DDTHH:mm" value through a hidden input.
 */
export default function DateTimeField({ id, name, defaultValue = "", className, invalid, required }: DateTimeFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = fromValue(value);
  const [month, setMonth] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Escape or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  // The form clears a field's error on its "input" event; a value set from code fires none, so send one.
  useEffect(() => {
    if (value !== defaultValue) inputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [value, defaultValue]);

  const choose = (next: Date) => setValue(toValue(next));
  const pickDay = (day: Date) => {
    const time = selected ?? new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    choose(new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes()));
  };
  const setTime = (hours: number, minutes: number) => {
    const day = selected ?? new Date();
    choose(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes));
  };

  // Six weeks from the Monday on or before the 1st, so every month fits the same grid.
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - ((month.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const today = new Date();
  const hours = selected?.getHours() ?? 9;
  const minutes = selected?.getMinutes() ?? 0;
  const label = selected
    ? `${selected.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${pad(selected.getHours())}:${pad(selected.getMinutes())}`
    : "Pick a date and time";

  return (
    <div ref={rootRef} className="relative">
      {/* A real input (not type="hidden") so the form's required check and error message still work. Visually
          hidden; if the form focuses it to show an error, focus moves on to the visible button. */}
      <input
        ref={inputRef}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={value}
        required={required}
        onChange={() => undefined}
        onFocus={() => buttonRef.current?.focus()}
      />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={invalid ? `${name}-error` : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`${className} flex items-center justify-between gap-3 text-left ${selected ? "" : "text-[var(--muted)]"}`}
      >
        {label}
        <FaRegCalendar aria-hidden="true" className="shrink-0 text-[var(--muted)]" />
      </button>

      {open && (
        <dialog open aria-label="Choose the publish date and time" className="date-popover">
          <div className="flex items-center justify-between">
            <button type="button" className="date-step" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <FaArrowLeft aria-hidden="true" />
            </button>
            <p className="date-month" aria-live="polite">
              {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
            <button type="button" className="date-step" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <FaArrowRight aria-hidden="true" />
            </button>
          </div>

          <div className="date-grid mt-3">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="date-weekday" aria-hidden="true">{weekday}</span>
            ))}
            {days.map((day) => {
              const isSelected = selected ? sameDay(day, selected) : false;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className="date-day"
                  data-outside={day.getMonth() !== month.getMonth() || undefined}
                  data-today={sameDay(day, today) || undefined}
                  aria-pressed={isSelected}
                  aria-label={day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  onClick={() => pickDay(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-time">
            <span className="date-weekday">Time</span>
<TimeStep label="Hour" value={hours} max={23} step={1} page={6} onChange={(next) => setTime(next, minutes)} />
            <span aria-hidden="true" className="date-colon">:</span>
            <TimeStep label="Minute" value={minutes} max={59} step={5} page={15} onChange={(next) => setTime(hours, next)} />
            <button type="button" className="admin-button-primary ml-auto !min-h-10" onClick={() => setOpen(false)}>Done</button>
          </div>
        </dialog>
      )}
    </div>
  );
}

type TimeStepProps = Readonly<{ label: string; value: number; max: number; step: number; page: number; onChange: (value: number) => void }>;

/**
 * One time segment: a number input between up and down buttons, in place of a <select> whose list the browser
 * draws and a page cannot style. Type a value, or step: arrows step, Page Up and Page Down jump, values wrap (23 → 00).
 * Minutes step to the next multiple of 5, so an odd saved minute like :07 still steps cleanly.
 */
function TimeStep({ label, value, max, step, page, onChange }: TimeStepProps) {
  const size = max + 1;
  const move = (by: number) => {
    const snapped = by > 0 ? Math.floor(value / step) * step + by : Math.ceil(value / step) * step + by;
    onChange(((snapped % size) + size) % size);
  };
  return (
    <span className="date-step-field">
      <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => move(step)}><FaChevronUp /></button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={0}
        max={max}
        step={step}
        value={pad(value)}
        onChange={(event) => {
          const typed = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(typed)) onChange(Math.min(max, Math.max(0, typed)));
        }}
        onKeyDown={(event) => {
          // Arrows and Page Up/Down step with wrap-around (23 → 00), which the native number input doesn't do.
          const by = { ArrowUp: step, ArrowDown: -step, PageUp: page, PageDown: -page }[event.key];
          if (by === undefined) return;
          event.preventDefault();
          move(by);
        }}
      />
      <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => move(-step)}><FaChevronDown /></button>
    </span>
  );
}
