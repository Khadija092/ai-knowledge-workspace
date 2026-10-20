"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onAddDocuments,
  disabled,
  helper,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAddDocuments: () => void;
  disabled: boolean;
  helper: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const field = ref.current;
    if (!field) {
      return;
    }
    field.style.height = "0px";
    field.style.height = `${Math.min(field.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <form
      className="border-t border-border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled) {
          onSubmit();
        }
      }}
    >
      <p className="mb-2 text-[13px] text-secondary">{helper}</p>
      <div className="rounded-xl border border-border bg-card p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <label className="sr-only" htmlFor="chat-composer">
          Ask a question about your documents
        </label>
        <textarea
          id="chat-composer"
          ref={ref}
          rows={1}
          value={value}
          placeholder="Ask a question about your documents..."
          className="max-h-40 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (!disabled) {
                onSubmit();
              }
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <Button type="button" size="sm" variant="ghost" onClick={onAddDocuments}>
            <Plus className="size-4" aria-hidden />
            Add documents
          </Button>
          <Button type="submit" size="icon" disabled={disabled} aria-label="Send message">
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
