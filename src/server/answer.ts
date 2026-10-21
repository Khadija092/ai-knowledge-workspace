import "server-only";

import { forwardChatToDify } from "@/lib/dify";
import type { Citation } from "@/types/citation";
import type { ResponseStyle } from "@/types/chat";
import type { Document } from "@/types/document";

type Answer = {
  content: string;
  citations: Citation[];
  status: "complete" | "error";
  difyConversationId?: string;
};

function clip(text: string, max: number) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max - 1).trim()}...`;
}

function selectPassages(query: string, documents: Document[], limit: number) {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);

  const candidates = documents.flatMap((document) =>
    (document.passages ?? []).map((passage) => {
      const text = passage.text.toLowerCase();
      const score = words.reduce(
        (total, word) => total + (text.includes(word) ? 1 : 0),
        0,
      );
      return { document, passage, score };
    }),
  );

  const matched = candidates
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);

  return (matched.length > 0 ? matched : candidates).slice(0, limit);
}

export async function answerQuestion(input: {
  query: string;
  documents: Document[];
  style: ResponseStyle;
  difyConversationId?: string;
}): Promise<Answer> {
  const ready = input.documents.filter((document) => document.status === "ready");
  if (ready.length === 0) {
    return {
      status: "error",
      content: "Select a ready document before asking a question.",
      citations: [],
    };
  }

  const chosen = selectPassages(
    input.query,
    ready,
    input.style === "concise" ? 1 : 3,
  );
  if (chosen.length === 0) {
    return {
      status: "error",
      content: "These documents don't have extracted text yet.",
      citations: [],
    };
  }

  const citations: Citation[] = chosen.map((item, index) => ({
    documentId: item.document.id,
    documentName: item.document.filename,
    label: String(index + 1),
    page: item.passage.page,
    excerpt: clip(item.passage.text, 280),
  }));

  const context = chosen
    .map(
      (item, index) =>
        `[${index + 1}] ${item.document.filename}, page ${item.passage.page}\n${clip(item.passage.text, input.style === "concise" ? 320 : 700)}`,
    )
    .join("\n\n");

  if (process.env.DIFY_API_KEY) {
    try {
      const result = await forwardChatToDify({
        query: `Answer the question using only these excerpts from the user's documents. Cite them as [1], [2], and so on. If the excerpts do not contain the answer, say that.\n\n${context}\n\nQuestion: ${input.query}`,
        conversationId: input.difyConversationId,
        user: "workspace-user",
      });
      if (!result.answer.trim()) {
        throw new Error("Dify request failed.");
      }
      return {
        status: "complete",
        content: result.answer.trim(),
        citations,
        difyConversationId: result.conversationId || input.difyConversationId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dify request failed.";
      if (message !== "Dify is not configured.") {
        return {
          status: "error",
          content: message,
          citations: [],
        };
      }
    }
  }

  const lead =
    input.style === "concise"
      ? "This passage from your documents matches the question."
      : "These passages from your documents match the question.";

  return {
    status: "complete",
    content: `${lead}\n\n${context}`,
    citations,
  };
}
