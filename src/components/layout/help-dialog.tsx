"use client";

import { Dialog } from "@/components/ui/dialog";

export function HelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      title="Help and support"
      description="How to use Knowledge AI."
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 text-sm leading-6 text-secondary">
        <p>Upload a PDF and wait until its status is Ready.</p>
        <p>Open the AI assistant, check the documents you want to use, and ask a question.</p>
        <p>Click a citation to read the excerpt, then open that page in the document viewer.</p>
      </div>
    </Dialog>
  );
}
