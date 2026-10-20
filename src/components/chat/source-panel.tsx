"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import type { Citation } from "@/types/citation";

export function SourcePanel({
  citation,
  onClose,
}: {
  citation: Citation;
  onClose: () => void;
}) {
  const href = citation.page
    ? `/documents/${citation.documentId}?page=${citation.page}`
    : `/documents/${citation.documentId}`;

  return (
    <aside className="flex h-full w-full flex-col border-border bg-card lg:w-[340px] lg:border-l">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            Source details
          </p>
          <h2 className="mt-2 text-base font-semibold">
            {citation.documentName ?? "Document"}
          </h2>
          <p className="mt-1 text-[13px] text-secondary">
            {citation.page ? `Page ${citation.page}` : "Page number unavailable"}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg text-secondary hover:bg-background"
          onClick={onClose}
          aria-label="Close source details"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5">
        <blockquote className="rounded-xl border border-border bg-background px-4 py-4 text-sm leading-6">
          {citation.excerpt ?? "This citation does not include an excerpt."}
        </blockquote>
        <Link href={href} className={buttonClassName("primary", "md", "w-full")}>
          Open in PDF viewer
        </Link>
      </div>
    </aside>
  );
}
