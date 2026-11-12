// PROTOTYPE: admin redesign in the portfolio identity (DESIGN.md), switchable via ?page=<page>.
// Sample data only. Delete this folder once a direction is picked.

import { notFound } from "next/navigation";
import PrototypeSwitcher from "./PrototypeSwitcher";
import { pages, type PageKey } from "./sample-data";
import VariantD from "./VariantD";

export default async function AdminPrototype({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | undefined>> }>) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  const variant = "D";
  const page = (pages as readonly string[]).includes(params.page ?? "") ? (params.page as PageKey) : "dashboard";

  return (
    // Covers the current admin shell so each variant can own its whole layout.
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto">
      <VariantD page={page} />
      <PrototypeSwitcher variant={variant} page={page} />
    </div>
  );
}
