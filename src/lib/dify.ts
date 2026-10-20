import "server-only";

import type { ChatRequest, ChatResponse } from "@/types/chat";

type DifyChatResponse = {
  answer?: string;
  conversation_id?: string;
};

function getDifyConfig() {
  const baseUrl = process.env.DIFY_API_BASE_URL;
  const apiKey = process.env.DIFY_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Dify is not configured.");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
  };
}

/**
 * Server-side Dify client. Import this only from Route Handlers.
 * The API key is read from the server environment and is never returned.
 */
export async function forwardChatToDify(
  input: ChatRequest,
): Promise<ChatResponse> {
  const { baseUrl, apiKey } = getDifyConfig();

  const response = await fetch(`${baseUrl}/chat-messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {},
      query: input.query,
      response_mode: "blocking",
      conversation_id: input.conversationId ?? "",
      user: input.user ?? "workspace-user",
    }),
  });

  if (!response.ok) {
    throw new Error("Dify request failed.");
  }

  const data = (await response.json()) as DifyChatResponse;

  return {
    answer: data.answer ?? "",
    conversationId: data.conversation_id ?? input.conversationId ?? "",
  };
}
