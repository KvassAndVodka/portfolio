import type { ReactNode } from "react";

import TornMap from "@/components/TornMap";

/** Layout shared by the 404 and error pages: copy on blank paper beside a torn contour map. */
export default function StatusPage({ eyebrow, title, lead, children }: Readonly<{
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}>) {
  return (
    <section className="status-page">
      <TornMap />
      <div className="site-shell status-page-copy">
        <div className="relative z-10 max-w-[34rem]">
          <p className="eyebrow mb-6">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="body-large mt-7">{lead}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
