"use client";

import { useMemo, useState } from "react";
import { FileText, LayoutGrid, List, Plus, Upload } from "lucide-react";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentTable } from "@/components/documents/document-table";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { filterDocuments } from "@/features/documents";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import type { DocumentStatus } from "@/types/document";

export function DocumentsLibrary({ initialQuery = "" }: { initialQuery?: string }) {
  const { documents, loading, libraryError, reloadLibrary } = useWorkspace();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<"all" | DocumentStatus>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploadOpen, setUploadOpen] = useState(false);

  const visible = useMemo(
    () => filterDocuments(documents, query, status),
    [documents, query, status],
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Documents"
        description="Manage and explore your uploaded files."
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Upload documents
          </Button>
        }
      />
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      {loading ? <DocumentsSkeleton /> : null}
      {!loading && libraryError ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="Documents couldn't be loaded"
          description={libraryError}
          action={<Button onClick={reloadLibrary}>Try again</Button>}
        />
      ) : null}
      {!loading && !libraryError && documents.length === 0 ? (
        <EmptyState
          icon={<Upload className="size-5" />}
          title="Your knowledge library is empty"
          description="Upload your first document to start asking questions and discovering insights."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              Upload your first document
            </Button>
          }
        />
      ) : null}
      {!loading && !libraryError && documents.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="lg:max-w-sm lg:flex-1">
              <SearchInput
                label="Search documents"
                placeholder="Search documents..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              aria-label="Filter by type"
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
              defaultValue="pdf"
            >
              <option value="all">All types</option>
              <option value="pdf">PDF</option>
            </select>
            <select
              aria-label="Filter by status"
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | DocumentStatus)
              }
            >
              <option value="all">All statuses</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {query || status !== "all"
                ? `${visible.length} documents`
                : `All documents (${documents.length})`}
            </p>
            <div className="flex rounded-lg border border-border bg-card p-1">
              <button
                type="button"
                aria-pressed={view === "grid"}
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  view === "grid" ? "bg-selected text-primary" : "text-secondary"
                }`}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="size-4" aria-hidden />
                Grid
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  view === "list" ? "bg-selected text-primary" : "text-secondary"
                }`}
                onClick={() => setView("list")}
              >
                <List className="size-4" aria-hidden />
                List
              </button>
            </div>
          </div>
          {visible.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-5" />}
              title="No documents match"
              description="Try a different filename or status filter."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <DocumentTable documents={visible} />
          )}
        </>
      ) : null}
    </div>
  );
}

function DocumentsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-2xl border border-border bg-card shadow-card"
        />
      ))}
    </div>
  );
}
