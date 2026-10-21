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

async function answerWithoutDocuments(
  query: string,
  difyConversationId?: string,
): Promise<Answer> {
  if (!process.env.DIFY_API_KEY) {
    return {
      status: "error",
      content: "Attach a ready document, or connect Dify, before asking a question.",
      citations: [],
    };
  }

  try {
    const result = await forwardChatToDify({
      query,
      conversationId: difyConversationId,
      user: "workspace-user",
    });
    const content = result.answer.trim();
    if (!content) {
      throw new Error("Dify request failed.");
    }
    return {
      status: "complete",
      content,
      citations: [],
      difyConversationId: result.conversationId || difyConversationId,
    };
  } catch (error) {
    return {
      status: "error",
      content: error instanceof Error ? error.message : "Dify request failed.",
      citations: [],
    };
  }
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
    return answerWithoutDocuments(input.query, input.difyConversationId);
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
        query: [
          "You are the assistant for a document workspace. Excerpts from the user's PDFs are included for reference.",
          "If the question is about those documents, answer from the excerpts and cite only the ones you use, as [1], [2], and so on.",
          "If the question is general, a greeting, or the user asks for an answer outside the PDF, answer from your own knowledge.",
          "In that case do not cite the excerpts and do not say that the excerpts do not contain the answer.",
          "",
          context,
          "",
          `Question: ${input.query}`,
        ].join("\n"),
        conversationId: input.difyConversationId,
        user: "workspace-user",
      });
      const content = result.answer.trim();
      if (!content) {
        throw new Error("Dify request failed.");
      }
      const usedLabels = new Set(
        [...content.matchAll(/\[(\d+)\]/g)].map((match) => match[1]),
      );
      return {
        status: "complete",
        content,
        citations: citations.filter((citation) => usedLabels.has(citation.label)),
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
