"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { SearchInput } from "@/components/ui/search-input";
import { workspaceNow } from "@/features/conversations/clock";
import {
  conversationPreview,
  formatConversationTime,
} from "@/features/conversations";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import type { Conversation } from "@/types/chat";

export function HistoryScreen() {
  const router = useRouter();
  const { conversations, documents, renameConversation, deleteConversation, loading } =
    useWorkspace();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [title, setTitle] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = conversations.filter((conversation) => {
      if (!normalized) {
        return true;
      }
      return (
        conversation.title.toLowerCase().includes(normalized) ||
        conversationPreview(conversation).toLowerCase().includes(normalized)
      );
    });
    return filtered.sort((left, right) =>
      sort === "recent"
        ? right.updatedAt.localeCompare(left.updatedAt)
        : left.updatedAt.localeCompare(right.updatedAt),
    );
  }, [conversations, query, sort]);

  const groups = sort === "recent" ? groupConversations(visible) : [{ label: "All conversations", items: visible }];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Chat History" description="Continue where you left off." />
      {loading ? (
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-5" />}
          title="No conversations yet"
          description="Start a conversation with your documents to see your research history here."
          action={
            <Link href="/chat/new" className={buttonClassName()}>
              Start a conversation
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="sm:max-w-sm sm:flex-1">
              <SearchInput
                label="Search conversations"
                placeholder="Search conversations..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              aria-label="Sort conversations"
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
              value={sort}
              onChange={(event) => setSort(event.target.value as "recent" | "oldest")}
            >
              <option value="recent">Sort: Recent</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>
          {visible.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="size-5" />}
              title="No conversations match"
              description="Try a different title or message."
              action={
                <Button variant="secondary" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) =>
                group.items.length === 0 ? null : (
                  <section key={group.label} className="flex flex-col gap-3">
                    <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
                      {group.label}
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {group.items.map((conversation) => {
                        const names = documents
                          .filter((document) => conversation.documentIds.includes(document.id))
                          .map((document) => document.filename);
                        return (
                          <li
                            key={conversation.id}
                            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4"
                          >
                            <Link href={`/chat/${conversation.id}`} className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-4">
                                <span className="truncate font-medium">{conversation.title}</span>
                                <span className="shrink-0 text-[13px] text-muted">
                                  {formatConversationTime(conversation.updatedAt)}
                                </span>
                              </span>
                              <span className="mt-1 block truncate text-[13px] text-secondary">
                                {conversationPreview(conversation)}
                              </span>
                              {names.length > 0 ? (
                                <span className="mt-2 block truncate text-xs text-muted">
                                  {names.join(", ")}
                                </span>
                              ) : null}
                            </Link>
                            <Menu
                              label={`Actions for ${conversation.title}`}
                              items={[
                                {
                                  label: "Rename",
                                  onSelect: () => {
                                    setTitle(conversation.title);
                                    setRenameTarget(conversation);
                                  },
                                },
                                {
                                  label: "Delete",
                                  destructive: true,
                                  onSelect: () => setDeleteTarget(conversation),
                                },
                              ]}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ),
              )}
            </div>
          )}
        </>
      )}
      <Dialog
        open={Boolean(renameTarget)}
        title="Rename conversation"
        description="This name appears in chat history."
        onClose={() => setRenameTarget(null)}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!renameTarget || title.trim().length === 0) {
              return;
            }
            renameConversation(renameTarget.id, title.trim());
            setRenameTarget(null);
          }}
        >
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this conversation?"
        description="The messages in this session will be removed."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteConversation(deleteTarget.id);
            router.refresh();
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

function groupConversations(conversations: Conversation[]) {
  const now = workspaceNow;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups = [
    { label: "Today", items: [] as Conversation[] },
    { label: "Yesterday", items: [] as Conversation[] },
    { label: "Previous 7 days", items: [] as Conversation[] },
    { label: "Earlier", items: [] as Conversation[] },
  ];

  conversations.forEach((conversation) => {
    const date = new Date(conversation.updatedAt);
    if (date >= startOfToday) {
      groups[0].items.push(conversation);
    } else if (date >= startOfYesterday) {
      groups[1].items.push(conversation);
    } else if (date >= startOfWeek) {
      groups[2].items.push(conversation);
    } else {
      groups[3].items.push(conversation);
    }
  });

  return groups;
}
