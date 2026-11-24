"use client";

import { useState, useTransition } from "react";
import { FaBolt, FaCheck } from "react-icons/fa6";

import { submitSitemapToIndexNow } from "@/lib/actions";

export default function IndexNowButton({ configured }: Readonly<{ configured: boolean }>) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const submit = () =>
    startTransition(async () => {
      setStatus(null);
      try {
        const result = await submitSitemapToIndexNow();
        if (result.ok) {
          setStatus({
            ok: true,
            message: `Submitted ${result.submitted} URL${result.submitted === 1 ? "" : "s"} (HTTP ${result.status})`,
          });
        } else {
          setStatus({ ok: false, message: result.reason });
        }
      } catch {
        setStatus({ ok: false, message: "Couldn't reach IndexNow. Try again." });
      }
    });

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        className="admin-button-secondary"
        onClick={submit}
        disabled={pending || !configured}
        aria-busy={pending}
      >
        <FaBolt aria-hidden="true" />
        {pending ? "Submitting…" : "Ping IndexNow"}
      </button>
      <p className="admin-label" aria-live="polite">
        {!configured ? (
          <span className="site-muted">Set INDEXNOW_KEY in .env to enable.</span>
        ) : status ? (
          status.ok ? (
            <span className="refresh-done inline-flex items-center gap-1.5 text-[var(--admin-success)]">
              <FaCheck aria-hidden="true" /> {status.message}
            </span>
          ) : (
            <span className="text-[var(--admin-danger)]">{status.message}</span>
          )
        ) : null}
      </p>
    </div>
  );
}
