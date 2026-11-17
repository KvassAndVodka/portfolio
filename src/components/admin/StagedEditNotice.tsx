import Link from "next/link";

/** Shown on a staged edit: what it replaces, and that publishing it updates the live post in place. */
export default function StagedEditNotice({ live }: Readonly<{ live: { title: string; slug: string; type: string } | null }>) {
  if (!live) return null;
  const base = live.type === "PROJECT" ? "projects" : "notes";
  return (
    <p role="note" className="admin-panel mx-auto mt-6 w-[min(100%-2rem,56rem)] px-5 py-4 text-sm leading-[1.6]">
      <span className="admin-label text-[var(--postcard-rust)]">Staged edit</span>
      <span className="mt-1 block">
        A draft of changes to <Link href={`/admin/${base}/${live.slug}`} className="font-semibold underline underline-offset-4">{live.title}</Link>, which stays live as it is.
        Saving this as <strong>Published</strong> copies it onto the live post at <code>/{base}/{live.slug}</code> and moves this draft to the trash.
      </span>
    </p>
  );
}
