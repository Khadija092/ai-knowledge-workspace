"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import type { Document } from "@/types/document";

export function DocumentActions({ document }: { document: Document }) {
  const router = useRouter();
  const { renameDocument, deleteDocument, retryDocument } = useWorkspace();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(document.title);

  const detailsHref = `/documents/${document.id}`;

  return (
    <div className="flex items-center gap-2">
      {document.status === "failed" ? (
        <Button size="sm" variant="secondary" onClick={() => retryDocument(document.id)}>
          Retry
        </Button>
      ) : (
        <Link
          href={detailsHref}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-background"
        >
          {document.status === "ready" ? "Open" : "Details"}
        </Link>
      )}
      <Menu
        label={`Actions for ${document.filename}`}
        items={[
          { label: "Rename", onSelect: () => setRenameOpen(true) },
          {
            label: "View details",
            onSelect: () => router.push(detailsHref),
          },
          ...(document.status === "failed"
            ? [{ label: "Retry", onSelect: () => retryDocument(document.id) }]
            : []),
          {
            label: "Delete",
            destructive: true,
            onSelect: () => setDeleteOpen(true),
          },
        ]}
      />
      <Dialog
        open={renameOpen}
        title="Rename document"
        description="This updates the name shown in your library."
        onClose={() => setRenameOpen(false)}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const next = title.trim();
            if (!next) {
              return;
            }
            renameDocument(document.id, next);
            setRenameOpen(false);
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            Filename
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={title.trim().length === 0}>
              Save
            </Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${document.filename}?`}
        description="This removes the document from your library."
        confirmLabel="Delete"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteDocument(document.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
