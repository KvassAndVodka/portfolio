"use client";

import { useState, useTransition } from "react";
import { FaArrowRotateRight, FaCheck } from "react-icons/fa6";

import { revalidateAll } from "@/lib/actions";

/** Refreshes the public site's cache and says so: "Refreshing…" while it runs, then the time it finished. */
export default function RefreshButton() {
  const [pending, startTransition] = useTransition();
  const [doneAt, setDoneAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = () =>
    startTransition(async () => {
      setFailed(false);
      try {
        await revalidateAll();
        setDoneAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      } catch {
        setFailed(true);
      }
    });

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button type="button" className="admin-button-secondary" onClick={refresh} disabled={pending} aria-busy={pending}>
        <FaArrowRotateRight aria-hidden="true" className={pending ? "animate-spin [animation-duration:700ms]" : undefined} />
        {pending ? "Refreshing…" : "Refresh cached content"}
      </button>
      <p className="admin-label" aria-live="polite">
        {failed ? (
          <span className="text-[var(--admin-danger)]">Couldn&apos;t refresh. Try again.</span>
        ) : (
          doneAt && !pending && (
            <span key={doneAt} className="refresh-done inline-flex items-center gap-1.5 text-[var(--admin-success)]">
              <FaCheck aria-hidden="true" /> Refreshed at {doneAt}
            </span>
          )
        )}
      </p>
    </div>
  );
}
