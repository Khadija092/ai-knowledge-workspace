"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { SourcePanel } from "@/components/chat/source-panel";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import type { Citation } from "@/types/citation";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

const examples = [
  "Summarize my latest report.",
  "Compare the key findings across documents.",
  "Find the recommendations in my research paper.",
];

export function ChatScreen({
  id,
  initialPrompt = "",
  initialDocumentIds = [],
}: {
  id: string;
  initialPrompt?: string;
  initialDocumentIds?: string[];
}) {
  const router = useRouter();
  const {
    documents,
    conversations,
    preferences,
    sendMessage,
    regenerateMessage,
    renameConversation,
    deleteConversation,
    notify,
  } = useWorkspace();
  const conversation = conversations.find((item) => item.id === id);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    conversation?.documentIds ?? initialDocumentIds,
  );
  const [source, setSource] = useState<Citation | null>(null);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(conversation?.title ?? "");
  const [draft, setDraft] = useState(id === "new" ? initialPrompt : "");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = conversation?.messages.length ?? 0;
  const latestStatus = conversation?.messages.at(-1)?.status;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount, latestStatus]);

  const selectedDocuments = documents.filter(
    (document) => selectedIds.includes(document.id) && document.status === "ready",
  );
  const streaming = conversation?.messages.some((message) => message.status === "streaming");
  const selectionRequired = preferences.prioritizeSelectedDocuments;
  const documentsForAnswer = selectionRequired
    ? selectedDocuments
    : selectedDocuments.length > 0
      ? selectedDocuments
      : documents.filter((document) => document.status === "ready");

  const helper = useMemo(() => {
    if (documentsForAnswer.length === 0) {
      return "No document is attached. Dify will answer this message on its own.";
    }
    if (!selectionRequired && selectedDocuments.length === 0) {
      return `No document is checked, so this question will use ${documentsForAnswer.length} ready documents.`;
    }
    return `${selectedDocuments.length} document${selectedDocuments.length === 1 ? "" : "s"} selected.`;
  }, [documentsForAnswer.length, selectedDocuments.length, selectionRequired]);

  function toggleDocument(documentId: string) {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((item) => item !== documentId)
        : [...current, documentId],
    );
  }

  async function submit() {
    const query = draft.trim();
    if (!query || streaming) {
      return;
    }
    setDraft("");
    try {
      const conversationId = await sendMessage({
        conversationId: conversation?.id,
        query,
        documentIds: documentsForAnswer.map((document) => document.id),
        style: preferences.responseStyle,
      });
      if (id === "new") {
        router.replace(`/chat/${conversationId}`);
      }
    } catch (error) {
      setDraft(query);
      notify(
        error instanceof Error ? error.message : "Couldn't send that message.",
        "error",
      );
    }
  }

  async function copyMessage(message: ChatMessageType) {
    try {
      await navigator.clipboard.writeText(message.content);
      notify("Answer copied.");
    } catch {
      notify("Couldn't copy that answer.", "error");
    }
  }

  const missing = id !== "new" && !conversation;

  return (
    <div className="flex h-full min-h-0 flex-1">
      <DocumentPicker
        className="hidden lg:flex"
        documents={documents}
        selectedIds={selectedIds}
        onToggle={toggleDocument}
        onUpload={() => setUploadOpen(true)}
      />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">
              {conversation?.title ?? "New conversation"}
            </h1>
            <p className="truncate text-[13px] text-secondary">{helper}</p>
          </div>
          {conversation ? (
            <Menu
              label="Conversation actions"
              items={[
                { label: "Rename", onSelect: () => setRenameOpen(true) },
                {
                  label: "Delete",
                  destructive: true,
                  onSelect: () => setDeleteOpen(true),
                },
              ]}
            />
          ) : (
            <Button size="sm" variant="secondary" className="lg:hidden" onClick={() => setDocumentsOpen(true)}>
              Documents
            </Button>
          )}
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {missing ? (
            <div className="mx-auto max-w-lg text-center">
              <h2 className="text-xl font-semibold">This conversation is unavailable</h2>
              <p className="mt-2 text-sm text-secondary">
                It may have been deleted.
              </p>
              <Button className="mt-5" onClick={() => router.push("/chat/new")}>
                Start a conversation
              </Button>
            </div>
          ) : null}
          {!missing && (conversation?.messages.length ?? 0) === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center pt-10 text-center md:pt-20">
              <h2 className="text-[28px] leading-9 font-semibold">
                What would you like to learn from your documents?
              </h2>
              <p className="mt-3 max-w-lg text-sm text-secondary">
                Ask questions, summarize reports, or find specific information across your files.
              </p>
              <div className="mt-8 grid w-full gap-3">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm shadow-sm hover:border-primary hover:bg-selected"
                    onClick={() => setDraft(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {!missing && conversation ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              {conversation.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onCitation={setSource}
                  onCopy={copyMessage}
                  onRegenerate={(item) => regenerateMessage(conversation.id, item.id)}
                  onViewSources={(item) => setSource(item.citations?.[0] ?? null)}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          ) : null}
        </div>
        {!missing ? (
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={submit}
            onAddDocuments={() => setDocumentsOpen(true)}
            disabled={draft.trim().length === 0 || Boolean(streaming)}
            helper={helper}
          />
        ) : null}
      </section>
      {source ? (
        <div className="fixed inset-0 z-40 bg-card lg:static lg:inset-auto lg:z-auto">
          <SourcePanel citation={source} onClose={() => setSource(null)} />
        </div>
      ) : null}
      <Dialog
        open={documentsOpen}
        title="Documents"
        description="Choose the ready documents this conversation should use."
        onClose={() => setDocumentsOpen(false)}
      >
        <DocumentList
          documents={documents}
          selectedIds={selectedIds}
          onToggle={toggleDocument}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setUploadOpen(true)}>
            Add documents
          </Button>
          <Button onClick={() => setDocumentsOpen(false)}>Done</Button>
        </div>
      </Dialog>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <Dialog
        open={renameOpen}
        title="Rename conversation"
        description="This name appears in chat history."
        onClose={() => setRenameOpen(false)}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!conversation || title.trim().length === 0) {
              return;
            }
            renameConversation(conversation.id, title.trim());
            setRenameOpen(false);
          }}
        >
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={title.trim().length === 0}>
              Save
            </Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete this conversation?"
        description="The messages in this session will be removed."
        confirmLabel="Delete"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (conversation) {
            deleteConversation(conversation.id);
          }
          setDeleteOpen(false);
          router.push("/history");
        }}
      />
    </div>
  );
}

function DocumentPicker({
  documents,
  selectedIds,
  onToggle,
  onUpload,
  className,
}: {
  documents: ReturnType<typeof useWorkspace>["documents"];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onUpload: () => void;
  className?: string;
}) {
  const selectedCount = documents.filter(
    (document) => selectedIds.includes(document.id) && document.status === "ready",
  ).length;

  return (
    <aside className={`w-[260px] shrink-0 flex-col border-r border-border bg-card ${className ?? ""}`}>
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">Documents</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <DocumentList documents={documents} selectedIds={selectedIds} onToggle={onToggle} />
      </div>
      <div className="border-t border-border p-4">
        <p className="text-[13px] text-secondary">{selectedCount} selected</p>
        <Button className="mt-3 w-full" variant="secondary" size="sm" onClick={onUpload}>
          Add documents
        </Button>
      </div>
    </aside>
  );
}

function DocumentList({
  documents,
  selectedIds,
  onToggle,
}: {
  documents: ReturnType<typeof useWorkspace>["documents"];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (documents.length === 0) {
    return <p className="px-2 py-3 text-sm text-secondary">Your library is empty.</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {documents.map((document) => {
        const disabled = document.status !== "ready";
        return (
          <li key={document.id}>
            <label className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-background">
              <input
                type="checkbox"
                className="mt-1 accent-primary"
                checked={selectedIds.includes(document.id)}
                disabled={disabled}
                onChange={() => onToggle(document.id)}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{document.filename}</span>
                <DocumentStatusBadge status={document.status} />
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
