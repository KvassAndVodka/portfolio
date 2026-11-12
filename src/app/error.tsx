"use client";

import Link from "next/link";
import { FaRotateRight } from "react-icons/fa6";

import StatusPage from "@/components/StatusPage";

export default function ErrorPage({ error, retry }: Readonly<{ error: unknown; retry: () => void }>) {
  // Server errors reach the client with only a digest, which matches the server log entry.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <StatusPage
      eyebrow="Error 500 · Route interrupted"
      title="Something broke on the way here."
      lead="This page hit an error while loading. Try it again, or head back to the start."
    >
      <div className="status-page-actions">
        <button className="button-primary" type="button" onClick={retry}>
          <FaRotateRight aria-hidden="true" />
          Try again
        </button>
        <Link className="button-secondary" href="/">Back to home</Link>
      </div>
      {digest && <p className="status-page-ref">Reference {digest}</p>}
    </StatusPage>
  );
}
