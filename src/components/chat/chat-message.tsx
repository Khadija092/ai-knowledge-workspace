"use client";

import { Copy, RefreshCw, ScrollText } from "lucide-react";
import { MessageBody } from "@/components/chat/citation-link";
import { Button } from "@/components/ui/button";
import type { Citation } from "@/types/citation";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

export function ChatMessage({
  message,
  onCitation,
  onCopy,
  onRegenerate,
  onViewSources,
}: {
  message: ChatMessageType;
  onCitation: (citation: Citation) => void;
  onCopy: (message: ChatMessageType) => void;
  onRegenerate: (message: ChatMessageType) => void;
  onViewSources: (message: ChatMessageType) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-selected px-4 py-3 text-sm leading-6 text-foreground md:max-w-xl">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">AI Assistant</p>
      {message.status === "streaming" ? (
        <p className="mt-3 text-sm text-secondary">Preparing an answer...</p>
      ) : null}
      {message.status === "error" ? (
        <div className="mt-3">
          <p className="text-sm text-destructive">{message.content}</p>
          <Button className="mt-3" size="sm" variant="secondary" onClick={() => onRegenerate(message)}>
            Retry
          </Button>
        </div>
      ) : null}
      {message.status === "complete" ? (
        <>
          <div className="mt-3">
            <MessageBody
              content={message.content}
              citations={message.citations}
              onOpen={onCitation}
            />
          </div>
          {message.citations && message.citations.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-secondary">
              <span>Sources:</span>
              {message.citations.map((citation) => (
                <button
                  key={citation.label}
                  type="button"
                  className="font-medium text-primary"
                  onClick={() => onCitation(citation)}
                >
                  [{citation.label}]
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => onCopy(message)}>
              <Copy className="size-4" aria-hidden />
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onRegenerate(message)}>
              <RefreshCw className="size-4" aria-hidden />
              Regenerate
            </Button>
            {message.citations && message.citations.length > 0 ? (
              <Button size="sm" variant="ghost" onClick={() => onViewSources(message)}>
                <ScrollText className="size-4" aria-hidden />
                View sources
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </article>
  );
}
