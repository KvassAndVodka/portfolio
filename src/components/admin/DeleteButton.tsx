"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FaArrowRotateLeft, FaTrashCan, FaXmark } from "react-icons/fa6";
import { toast } from "@/components/admin/Toaster";
import { deletePost, permanentDeletePost, restorePost } from "@/lib/actions";

type DeleteButtonProps = Readonly<{
  id: string;
  isTrash?: boolean;
}>;

export default function DeleteButton({ id, isTrash = false }: DeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  // Each action confirms itself; moving to the trash can be undone from the toast.
  const destructiveAction = async () => {
    if (isTrash) {
      await permanentDeletePost(id);
      toast("Deleted for good", { label: "Deleted" });
    } else {
      await deletePost(id);
      toast("Moved to the trash", { label: "Trash", action: { label: "Undo", onClick: () => restorePost(id) } });
    }
  };
  const restore = async () => {
    await restorePost(id);
    toast("Back where it was", { label: "Restored" });
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1" role="group" aria-label={isTrash ? "Confirm permanent deletion" : "Confirm move to trash"}>
        <form action={destructiveAction}>
          <ConfirmButton label={isTrash ? "Delete forever" : "Move to trash"} pending={isTrash ? "Deleting…" : "Moving…"} />
        </form>
        <button type="button" className="admin-icon-button" onClick={() => setIsConfirming(false)} aria-label="Cancel deletion"><FaXmark aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isTrash && (
        <form action={restore}>
          <button type="submit" className="admin-icon-button" aria-label="Restore item"><FaArrowRotateLeft aria-hidden="true" /></button>
        </form>
      )}
      <button type="button" className="admin-icon-button hover:!text-[var(--admin-danger)]" onClick={() => setIsConfirming(true)} aria-label={isTrash ? "Delete item forever" : "Move item to trash"}>
        <FaTrashCan aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Takes focus when it appears (the trash button that opened it is gone, so focus would otherwise drop to
 * the page), and stays disabled while the action runs so it can't be sent twice.
 */
function ConfirmButton({ label, pending }: Readonly<{ label: string; pending: string }>) {
  const { pending: isPending } = useFormStatus();
  return (
    <button type="submit" autoFocus disabled={isPending} aria-busy={isPending} className="admin-button-secondary !border-[var(--admin-danger)] !text-[var(--admin-danger)] disabled:opacity-60">
      {isPending ? pending : label}
    </button>
  );
}
