import type { ChatRequest } from "@/types/chat";

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
