import { workspaceNow } from "@/features/conversations/clock";
import type { ChatRequest, Conversation } from "@/types/chat";

export function isChatRequest(value: unknown): value is ChatRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.query !== "string" || candidate.query.trim().length === 0) {
    return false;
  }

  if (
    candidate.conversationId !== undefined &&
    typeof candidate.conversationId !== "string"
  ) {
    return false;
  }

  if (candidate.user !== undefined && typeof candidate.user !== "string") {
    return false;
  }

  return true;
}

export function conversationPreview(conversation: Conversation) {
  const message = [...conversation.messages]
    .reverse()
    .find((item) => item.status === "complete" && item.content.trim().length > 0);

  if (!message) {
    return "No messages yet";
  }

  const compact = message.content.replace(/\s+/g, " ").trim();
  return compact.length > 88 ? `${compact.slice(0, 88)}...` : compact;
}

export function formatConversationTime(value: string) {
  const date = new Date(value);
  const now = workspaceNow;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  const days = Math.round((startOfToday.getTime() - date.getTime()) / 86400000);
  if (days < 7) {
    return `${days} days ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
