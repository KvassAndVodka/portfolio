"use client";

import { FaTrash } from "react-icons/fa";

import { toast } from "@/components/admin/Toaster";

/** Deletes one image through the page's server action, then confirms it with a toast. */
export default function DeleteMediaButton({ id, filename, action }: Readonly<{ id: string; filename: string; action: (formData: FormData) => Promise<void> }>) {
  return (
    <form
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
