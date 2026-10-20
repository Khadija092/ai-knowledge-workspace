import type { ChatRequest, ChatResponse } from "@/types/chat";

/**
 * Browser client. It calls this app's chat route and never talks to Dify.
 */
export async function postChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Chat request failed.");
  }

  return (await response.json()) as ChatResponse;
}
