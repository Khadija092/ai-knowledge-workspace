import type { Citation } from "@/types/citation";
import type { ResponseStyle } from "@/types/chat";
import type { Document } from "@/types/document";

export function createAnswer(
  query: string,
  documents: Document[],
  style: ResponseStyle,
): { content: string; citations: Citation[] } {
  const citations: Citation[] = documents.slice(0, 3).map((document, index) => {
    const passage = document.passages?.[0];
    return {   
      label: String(index + 1),
      documentId: document.id,
      documentName: document.filename,
      page: passage?.page,
      excerpt:
        passage?.text ??
        `A relevant passage from ${document.filename} related to this question.`,
    };
  });

  if (style === "concise") {
    return {
      citations,
      content: [
        "Here is a concise answer from the selected documents.",
        "",
        ...citations.map(
          (citation) => `- ${citation.excerpt} [${citation.label}]`,
        ),
      ].join("\n"),
    };
  }

  const names = documents.map((document) => document.filename).join(", ");

  return {
    citations,
    content: [
      `I reviewed ${names} for “${query.trim()}”.`,
      "",
      ...citations.map((citation) => {
        const page = citation.page ? ` on page ${citation.page}` : "";
        return `${citation.documentName}${page}: ${citation.excerpt} [${citation.label}]`;
      }),
      "",
      "Open a citation to read the excerpt and jump to that page.",
    ].join("\n"),
  };
}
