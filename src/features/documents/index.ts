import type { Document, DocumentStatus } from "@/types/document";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatStorage(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function filterDocuments(
  documents: Document[],
  query: string,
  status: "all" | DocumentStatus,
) {
  const normalized = query.trim().toLowerCase();

  return documents.filter((document) => {
    const matchesQuery =
      normalized.length === 0 ||
      document.filename.toLowerCase().includes(normalized) ||
      document.title.toLowerCase().includes(normalized);
    const matchesStatus = status === "all" || document.status === status;
    return matchesQuery && matchesStatus;
  });
}

export function sortByUploadDate(documents: Document[]) {
  return [...documents].sort((left, right) =>
    right.uploadedAt.localeCompare(left.uploadedAt),
  );
}
