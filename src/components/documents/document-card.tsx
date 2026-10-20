import Link from "next/link";
import { FileText } from "lucide-react";
import { DocumentActions } from "@/components/documents/document-actions";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { formatFileSize, formatUploadDate } from "@/features/documents";
import type { Document } from "@/types/document";

export function DocumentCard({ document }: { document: Document }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4">
      <Link href={`/documents/${document.id}`} className="flex flex-1 flex-col gap-4">
        <div className="flex h-28 items-center justify-center rounded-lg bg-background">
          <span className="flex size-12 items-center justify-center rounded-xl bg-selected text-primary">
            <FileText className="size-5" aria-hidden />
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {document.filename}
          </h3>
          <p className="mt-1 text-[13px] text-secondary">
            {formatFileSize(document.sizeBytes)}
          </p>
          <p className="text-[13px] text-muted">
            Uploaded {formatUploadDate(document.uploadedAt)}
          </p>
        </div>
        <DocumentStatusBadge status={document.status} />
      </Link>
      {document.status === "failed" && document.error ? (
        <p className="mt-3 text-[13px] text-destructive">{document.error}</p>
      ) : null}
      <div className="mt-4 flex items-center justify-between">
        <DocumentActions document={document} />
      </div>
    </article>
  );
}
