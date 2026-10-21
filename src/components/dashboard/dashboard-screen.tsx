"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  HardDrive,
  MessageCircle,
  Plus,
} from "lucide-react";
import { DocumentCard } from "@/components/documents/document-card";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { formatStorage, sortByUploadDate } from "@/features/documents";
import {
  conversationPreview,
  formatConversationTime,
} from "@/features/conversations";
import { useWorkspace } from "@/features/workspace/workspace-provider";

export function DashboardScreen() {
  const router = useRouter();
  const { documents, conversations, loading } = useWorkspace();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const ready = documents.filter((document) => document.status === "ready");
  const recentDocuments = sortByUploadDate(documents).slice(0, 3);
  const recentConversations = [...conversations]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 3);
  const storage = documents.reduce((total, document) => total + document.sizeBytes, 0);

  function ask(event: React.FormEvent) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || ready.length === 0) {
      return;
    }
    const params = new URLSearchParams({
      prompt,
      documents: ready.map((document) => document.id).join(","),
    });
    router.push(`/chat/new?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
        description="Welcome to your knowledge workspace."
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Upload documents
          </Button>
        }
      />
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-card shadow-card" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard icon={<FileText className="size-4" />} label="Total documents" value={String(documents.length)} />
            <StatCard icon={<MessageCircle className="size-4" />} label="Total conversations" value={String(conversations.length)} />
            <StatCard icon={<HardDrive className="size-4" />} label="Storage used" value={formatStorage(storage)} />
          </section>
          <section className="flex flex-col gap-4">
            <SectionHeading href="/documents" label="Recent documents" />
            {recentDocuments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-sm text-secondary shadow-card">
                No documents yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {recentDocuments.map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
            )}
          </section>
          <section className="flex flex-col gap-4">
            <SectionHeading href="/history" label="Recent conversations" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {recentConversations.length === 0 ? (
                <p className="px-5 py-8 text-sm text-secondary">No conversations yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recentConversations.map((conversation) => (
                    <li key={conversation.id}>
                      <Link
                        href={`/chat/${conversation.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-background"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{conversation.title}</span>
                          <span className="block truncate text-[13px] text-secondary">
                            {conversationPreview(conversation)}
                          </span>
                        </span>
                        <span className="shrink-0 text-[13px] text-muted">
                          {formatConversationTime(conversation.updatedAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-card to-selected p-5 shadow-card md:p-6">
            {ready.length === 0 ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Upload a document to start asking questions</h2>
                  <p className="mt-1 text-sm text-secondary">
                    Ready documents can be used in the AI assistant.
                  </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>Upload documents</Button>
              </div>
            ) : (
              <form onSubmit={ask} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Ask questions about your documents</h2>
                  <p className="mt-1 text-sm text-secondary">
                    Upload a document and let AI help you explore it.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="sr-only" htmlFor="quick-ask">
                    Ask your first question
                  </label>
                  <input
                    id="quick-ask"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask your first question..."
                    className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="submit" disabled={question.trim().length === 0}>
                    Send
                  </Button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-secondary">
        <span className="flex size-8 items-center justify-center rounded-xl bg-selected text-primary">
          {icon}
        </span>
        <h2 className="text-[13px] font-medium">{label}</h2>
      </div>
      <p className="mt-4 text-[28px] leading-9 font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function SectionHeading({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{label}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        View all
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
