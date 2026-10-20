"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onClose}>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={pending}>
          {pending ? "Working..." : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
