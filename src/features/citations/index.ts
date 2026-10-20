import type { Citation } from "@/types/citation";

export function formatCitation(citation: Citation): string {
  const page = citation.page ? `, p. ${citation.page}` : "";
  return `${citation.label}${page}`;
}
