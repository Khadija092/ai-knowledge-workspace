"use client";

import type { Citation } from "@/types/citation";

export function CitationLink({
  citation,
  onOpen,
}: {
  citation: Citation;
  onOpen: (citation: Citation) => void;
}) {
  return (
    <button
      type="button"
      className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-selected px-1 text-xs font-medium text-primary hover:bg-primary hover:text-white"
      onClick={() => onOpen(citation)}
    >
      {citation.label}
    </button>
  );
}

export function MessageBody({
  content,
  citations = [],
  onOpen,
}: {
  content: string;
  citations?: Citation[];
  onOpen: (citation: Citation) => void;
}) {
  const parts = content.split(/(\[\d+\])/g);

  return (
    <div className="text-sm leading-6 whitespace-pre-wrap text-foreground">
      {parts.map((part, index) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (!match) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        const citation = citations.find((item) => item.label === match[1]);
        if (!citation) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        return <CitationLink key={`${part}-${index}`} citation={citation} onOpen={onOpen} />;
      })}
    </div>
  );
}
