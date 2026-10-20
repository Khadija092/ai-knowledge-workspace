import Link from "next/link";
import { FileText } from "lucide-react";
import { DocumentActions } from "@/components/documents/document-actions";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { formatFileSize, formatUploadDate } from "@/features/documents";
import type { Document } from "@/types/document";

export function DocumentTable({ documents }: { documents: Document[] }) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card md:hidden">
        <ul className="divide-y divide-border">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-col gap-3 p-4">
              <Link href={`/documents/${document.id}`} className="min-w-0">
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-selected text-primary">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{document.filename}</span>
                    <span className="text-[13px] text-secondary">
                      {formatFileSize(document.sizeBytes)} · {formatUploadDate(document.uploadedAt)}
                    </span>
                  </span>
                </span>
              </Link>
              <div className="flex items-center justify-between gap-3">
                <DocumentStatusBadge status={document.status} />
                <DocumentActions document={document} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs font-medium tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Uploaded</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/documents/${document.id}`}
                    className="flex items-center gap-3 font-medium hover:text-primary"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-selected text-primary">
                      <FileText className="size-4" aria-hidden />
                    </span>
                    <span className="truncate">{document.filename}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{document.type}</td>
                <td className="px-4 py-3 text-secondary">
                  {formatFileSize(document.sizeBytes)}
                </td>
                <td className="px-4 py-3 text-secondary">
                  {formatUploadDate(document.uploadedAt)}
                </td>
                <td className="px-4 py-3">
                  <DocumentStatusBadge status={document.status} />
                </td>
                <td className="px-4 py-3">
                  <DocumentActions document={document} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
