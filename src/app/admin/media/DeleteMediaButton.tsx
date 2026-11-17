"use client";

import { FaTrash } from "react-icons/fa";

import { toast } from "@/components/admin/Toaster";

/** Deletes one image or clip, after a confirmation, through the page's server action, then confirms it with a toast. */
export default function DeleteMediaButton({ id, filename, action }: Readonly<{ id: string; filename: string; action: (formData: FormData) => Promise<void> }>) {
  return (
    <form
      // Deleting is permanent and the icon sits next to Copy, so one stray click must not remove a file.
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${filename}? This cannot be undone.`)) event.preventDefault();
      }}
      action={async (formData) => {
        await action(formData);
        toast(`${filename} is gone`, { label: "Deleted" });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-icon-button hover:!text-[var(--admin-danger)]" aria-label={`Delete ${filename}`}>
        <FaTrash size={14} aria-hidden="true" />
      </button>
    </form>
  );
}
