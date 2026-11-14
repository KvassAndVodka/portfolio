"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { FaArrowRotateLeft, FaTrashCan, FaXmark } from "react-icons/fa6";

import { toast } from "@/components/admin/Toaster";
import { deletePost, permanentDeletePost, restorePost } from "@/lib/actions";

/** A trash-can button that asks once before running `onConfirm`. */
function ConfirmStep({ trigger, confirm, pending, onConfirm }: Readonly<{ trigger: string; confirm: string; pending: string; onConfirm: () => Promise<void> }>) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <fieldset className="flex items-center gap-1">
        <legend className="sr-only">{`Confirm: ${confirm.toLowerCase()}`}</legend>
        <form action={onConfirm}>
          <ConfirmButton label={confirm} pending={pending} />
        </form>
        <button type="button" className="admin-icon-button" onClick={() => setIsConfirming(false)} aria-label="Cancel">
          <FaXmark aria-hidden="true" />
        </button>
      </fieldset>
    );
  }

  return (
    <button type="button" className="admin-icon-button hover:!text-[var(--admin-danger)]" onClick={() => setIsConfirming(true)} aria-label={trigger}>
      <FaTrashCan aria-hidden="true" />
    </button>
  );
}

/**
 * Takes focus when it appears (the button that opened it is gone, so focus would otherwise drop to the page),
 * and stays disabled while the action runs so it can't be sent twice.
 */
function ConfirmButton({ label, pending }: Readonly<{ label: string; pending: string }>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { pending: isPending } = useFormStatus();
  useEffect(() => ref.current?.focus(), []);
  return (
    <button ref={ref} type="submit" disabled={isPending} aria-busy={isPending} className="admin-button-secondary !border-[var(--admin-danger)] !text-[var(--admin-danger)] disabled:opacity-60">
      {isPending ? pending : label}
    </button>
  );
}

/** Moves a note or project to the trash, after one confirmation; the toast can undo it. */
export function MoveToTrashButton({ id }: Readonly<{ id: string }>) {
  return (
    <ConfirmStep
      trigger="Move item to trash"
      confirm="Move to trash"
      pending="Moving…"
      onConfirm={async () => {
        await deletePost(id);
        toast("Moved to the trash", { label: "Trash", action: { label: "Undo", onClick: () => restorePost(id) } });
      }}
    />
  );
}

/** In the trash: restore, or delete forever after one confirmation. */
export function TrashedItemActions({ id }: Readonly<{ id: string }>) {
  return (
    <div className="flex items-center gap-1">
      <form
        action={async () => {
          await restorePost(id);
          toast("Back where it was", { label: "Restored" });
        }}
      >
        <button type="submit" className="admin-icon-button" aria-label="Restore item">
          <FaArrowRotateLeft aria-hidden="true" />
        </button>
      </form>
      <ConfirmStep
        trigger="Delete item forever"
        confirm="Delete forever"
        pending="Deleting…"
        onConfirm={async () => {
          await permanentDeletePost(id);
          toast("Deleted for good", { label: "Deleted" });
        }}
      />
    </div>
  );
}
