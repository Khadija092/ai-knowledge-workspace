"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Menu } from "@/components/ui/menu";
import { formatFileSize, formatUploadDate } from "@/features/documents";
import { useWorkspace } from "@/features/workspace/workspace-provider";

export function DocumentViewer({
  id,
  initialPage = 1,
}: {
  id: string;
  initialPage?: number;
}) {
  const router = useRouter();
  const { documents, deleteDocument } = useWorkspace();
  const document = documents.find((item) => item.id === id);
  const pageCount = document?.pageCount ?? 1;
  const [page, setPage] = useState(() =>
    Math.min(Math.max(initialPage, 1), pageCount),
  );
  const [scale, setScale] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const currentPage = Math.min(page, pageCount);

  const passage = useMemo(
    () => document?.passages?.find((item) => item.page === currentPage),
    [document, currentPage],
  );

  if (!document) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold">This document is unavailable</h1>
        <p className="max-w-md text-sm text-secondary">
          It may have been deleted from your library.
        </p>
        <Link href="/documents" className={buttonClassName("secondary")}>
          Back to documents
        </Link>
      </div>
    );
  }

  const canAsk = document.status === "ready";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Documents
          </Link>
          <h1 className="truncate text-base font-semibold">{document.filename}</h1>
        </div>
        <div className="flex items-center gap-2">
          {canAsk ? (
            <Button
              size="sm"
              onClick={() => router.push(`/chat/new?document=${document.id}`)}
            >
              Ask AI
            </Button>
          ) : null}
          <Menu
            label="Document actions"
            items={[
              {
                label: "Delete",
                destructive: true,
                onSelect: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas">
          <div className="flex items-center justify-center gap-2 border-b border-border bg-card px-4 py-2">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Zoom out"
              onClick={() => setScale((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-14 text-center text-xs font-medium text-secondary">
              {Math.round(scale * 100)}%
            </span>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Zoom in"
              onClick={() => setScale((current) => Math.min(1.6, Number((current + 0.1).toFixed(2))))}
            >
              <Plus className="size-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setScale(1)}>
              Fit width
            </Button>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-6 md:p-10">
            <article
              className="w-full max-w-3xl origin-top rounded-sm bg-white px-8 py-10 text-foreground shadow-sm"
              style={{ transform: `scale(${scale})` }}
            >
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                {document.filename}
              </p>
              <h2 className="mt-6 text-2xl font-semibold">Page {currentPage}</h2>
              {passage ? (
                <div className="mt-6 max-w-xl">
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">
                    Extracted passage
                  </p>
                  <p className="mt-3 text-base leading-7">
                    <mark className="bg-selected text-foreground">{passage.text}</mark>
                  </p>
                </div>
              ) : (
                <p className="mt-6 max-w-xl text-sm leading-6 text-secondary">
                  {document.status === "processing"
                    ? "This file is still being prepared. Page text will be available when processing finishes."
                    : document.status === "failed"
                      ? document.error
                      : "No extracted passage is available for this page. Use the page controls to move through the document."}
                </p>
              )}
            </article>
          </div>
          <div className="flex items-center justify-center gap-3 border-t border-border bg-card px-4 py-3">
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Button>
            <span className="text-sm text-secondary">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </section>
        <aside className="w-full shrink-0 border-t border-border bg-card p-6 lg:w-80 lg:border-t-0 lg:border-l">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            Document info
          </h2>
          <p className="mt-4 text-base font-semibold">{document.filename}</p>
          <dl className="mt-6 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-secondary">File size</dt>
              <dd className="mt-1 font-medium">{formatFileSize(document.sizeBytes)}</dd>
            </div>
            <div>
              <dt className="text-secondary">Uploaded</dt>
              <dd className="mt-1 font-medium">{formatUploadDate(document.uploadedAt)}</dd>
            </div>
            <div>
              <dt className="text-secondary">Status</dt>
              <dd className="mt-1">
                <DocumentStatusBadge status={document.status} />
              </dd>
            </div>
            {document.pageCount ? (
              <div>
                <dt className="text-secondary">Pages</dt>
                <dd className="mt-1 font-medium">{document.pageCount}</dd>
              </div>
            ) : null}
          </dl>
          {canAsk ? (
            <Button
              className="mt-6 w-full"
              onClick={() => router.push(`/chat/new?document=${document.id}`)}
            >
              Ask AI
            </Button>
          ) : (
            <p className="mt-6 text-[13px] text-secondary">
              Questions are available after this document is ready.
            </p>
          )}
        </aside>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${document.filename}?`}
        description="This removes the document from your library."
        confirmLabel="Delete"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteDocument(document.id);
          setDeleteOpen(false);
          router.push("/documents");
        }}
      />
    </div>
  );
}
