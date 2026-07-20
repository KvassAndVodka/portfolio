"use client";

import { useState } from "react";
import { FaArrowRotateLeft, FaTrashCan, FaXmark } from "react-icons/fa6";
import { deletePost, permanentDeletePost, restorePost } from "@/lib/actions";

export default function DeleteButton({ id, isTrash = false }: { id: string; isTrash?: boolean }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const destructiveAction = isTrash ? permanentDeletePost : deletePost;

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1" role="group" aria-label={isTrash ? "Confirm permanent deletion" : "Confirm move to trash"}>
        <form action={destructiveAction.bind(null, id)}>
          <button type="submit" className="min-h-11 rounded-lg bg-[var(--admin-danger-soft)] px-3 text-xs font-semibold text-[var(--admin-danger)]">
            {isTrash ? "Delete forever" : "Move to trash"}
          </button>
        </form>
        <button type="button" className="admin-icon-button" onClick={() => setIsConfirming(false)} aria-label="Cancel deletion"><FaXmark aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isTrash && (
        <form action={restorePost.bind(null, id)}>
          <button type="submit" className="admin-icon-button" aria-label="Restore item"><FaArrowRotateLeft aria-hidden="true" /></button>
        </form>
      )}
      <button type="button" className="admin-icon-button hover:!bg-[var(--admin-danger-soft)] hover:!text-[var(--admin-danger)]" onClick={() => setIsConfirming(true)} aria-label={isTrash ? "Delete item forever" : "Move item to trash"}>
        <FaTrashCan aria-hidden="true" />
      </button>
    </div>
  );
}
