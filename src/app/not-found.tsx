import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="Error 404 · Off the map"
      title="This page isn't on the map."
      lead="The link may be old, or the page has moved. The work and the writing are still where they were."
    >
      <div className="status-page-actions">
        <Link className="button-primary" href="/">
          Back to home
          <FaArrowRight aria-hidden="true" />
        </Link>
        <Link className="button-secondary" href="/projects">Projects</Link>
        <Link className="button-secondary" href="/notes">Notes</Link>
      </div>
    </StatusPage>
  );
}
