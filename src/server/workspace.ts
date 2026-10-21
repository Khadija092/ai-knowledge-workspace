import "server-only";

import { randomUUID } from "node:crypto";
import { MAX_UPLOAD_BYTES } from "@/features/documents";
import { answerQuestion } from "@/server/answer";
import { extractPassages } from "@/server/pdf";
import {
  getConversation,
  getDocument,
  getPreferences,
  isRecordId,
  listConversations,
  listDocuments,
  readPdf,
  removeAllDocuments,
  removeConversation,
  removeDocumentRecord,
  saveConversation,
  saveDocument,
  savePdf,
  savePreferences,
  type StoredConversation,
} from "@/server/store";
import type { Conversation, Preferences, ResponseStyle } from "@/types/chat";
import type { Document } from "@/types/document";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function requireId(id: string) {
  if (!isRecordId(id)) {
    throw new ApiError("That record was not found.", 404);
  }
}

export function toConversation(conversation: StoredConversation): Conversation {
  return {
    id: conversation.id,
    title: conversation.title,
    updatedAt: conversation.updatedAt,
    documentIds: conversation.documentIds,
    messages: conversation.messages,
  };
}

export async function loadWorkspace() {
  const [documents, conversations, preferences] = await Promise.all([
    listDocuments(),
    listConversations(),
    getPreferences(),
  ]);

  return {
    documents,
    conversations: conversations.map(toConversation),
    preferences,
  };
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function uploadDocuments(files: File[]) {
  if (files.length === 0) {
    throw new ApiError("Choose a PDF to upload.");
  }

  const documents: Document[] = [];

  for (const file of files) {
    if (!isPdf(file)) {
      throw new ApiError("Only PDF files can be uploaded.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new ApiError("This file is larger than 4 MB, the maximum supported for uploads.");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const id = randomUUID();
    const title = file.name.replace(/\.pdf$/i, "") || "Untitled";
    const uploadedAt = new Date().toISOString();

    await savePdf(id, bytes);

    try {
      const extracted = await extractPassages(bytes);
      const document: Document = {
        id,
        title,
        filename: file.name,
        type: "PDF",
        sizeBytes: file.size,
        uploadedAt,
        status: extracted.passages.length > 0 ? "ready" : "failed",
        pageCount: extracted.pageCount,
        error:
          extracted.passages.length > 0
            ? undefined
            : "No text could be extracted from this PDF.",
        passages: extracted.passages,
      };
      await saveDocument(document);
      documents.push(document);
    } catch (error) {
      const document: Document = {
        id,
        title,
        filename: file.name,
        type: "PDF",
        sizeBytes: file.size,
        uploadedAt,
        status: "failed",
        error: error instanceof Error ? error.message : "Couldn't read this PDF.",
      };
      await saveDocument(document);
      documents.push(document);
    }
  }

  return documents;
}

export async function renameDocument(id: string, title: string) {
  requireId(id);
  const document = await getDocument(id);
  if (!document) {
    throw new ApiError("That document was not found.", 404);
  }
  const nextTitle = title.trim().replace(/\.pdf$/i, "");
  if (!nextTitle) {
    throw new ApiError("Enter a document name.");
  }
  const updated: Document = {
    ...document,
    title: nextTitle,
    filename: `${nextTitle}.pdf`,
  };
  await saveDocument(updated);
  return updated;
}

export async function deleteDocument(id: string) {
  requireId(id);
  const document = await getDocument(id);
  if (!document) {
    throw new ApiError("That document was not found.", 404);
  }
  await removeDocumentRecord(id);
}

export async function retryDocument(id: string) {
  requireId(id);
  const document = await getDocument(id);
  if (!document) {
    throw new ApiError("That document was not found.", 404);
  }
  const bytes = await readPdf(id);
  if (!bytes) {
    throw new ApiError("The PDF file is missing.", 404);
  }

  try {
    const extracted = await extractPassages(bytes);
    const updated: Document = {
      ...document,
      status: extracted.passages.length > 0 ? "ready" : "failed",
      pageCount: extracted.pageCount,
      passages: extracted.passages,
      error:
        extracted.passages.length > 0
          ? undefined
          : "No text could be extracted from this PDF.",
    };
    await saveDocument(updated);
    return updated;
  } catch (error) {
    const updated: Document = {
      ...document,
      status: "failed",
      error: error instanceof Error ? error.message : "Couldn't read this PDF.",
    };
    await saveDocument(updated);
    return updated;
  }
}

export async function openDocumentFile(id: string) {
  requireId(id);
  const document = await getDocument(id);
  if (!document) {
    throw new ApiError("That document was not found.", 404);
  }
  const bytes = await readPdf(id);
  if (!bytes) {
    throw new ApiError("The PDF file is missing.", 404);
  }
  return { document, bytes };
}

export async function deleteAllDocuments() {
  await removeAllDocuments();
}

function isStyle(value: unknown): value is ResponseStyle {
  return value === "concise" || value === "detailed";
}

export async function createConversation(input: {
  title?: string;
  documentIds?: string[];
}) {
  const documentIds = Array.isArray(input.documentIds)
    ? input.documentIds.filter(isRecordId)
    : [];
  const title = input.title?.trim().slice(0, 80) || "New conversation";
  const conversation: StoredConversation = {
    id: randomUUID(),
    title,
    updatedAt: new Date().toISOString(),
    documentIds,
    messages: [],
  };
  await saveConversation(conversation);
  return toConversation(conversation);
}

export async function renameConversation(id: string, title: string) {
  requireId(id);
  const conversation = await getConversation(id);
  if (!conversation) {
    throw new ApiError("That conversation was not found.", 404);
  }
  const nextTitle = title.trim();
  if (!nextTitle) {
    throw new ApiError("Enter a conversation name.");
  }
  const updated = { ...conversation, title: nextTitle.slice(0, 80) };
  await saveConversation(updated);
  return toConversation(updated);
}

export async function deleteConversation(id: string) {
  requireId(id);
  await removeConversation(id);
}

async function readyDocuments(ids: string[]) {
  const documents = await Promise.all(ids.filter(isRecordId).map((id) => getDocument(id)));
  return documents.filter(
    (document): document is Document => document !== null && document.status === "ready",
  );
}

export async function sendConversationMessage(
  id: string,
  input: { query: string; documentIds: string[]; style: ResponseStyle },
) {
  requireId(id);
  const conversation = await getConversation(id);
  if (!conversation) {
    throw new ApiError("That conversation was not found.", 404);
  }

  const query = input.query.trim();
  if (!query) {
    throw new ApiError("A non-empty query string is required.");
  }

  const documentIds = input.documentIds.filter(isRecordId);
  const documents = await readyDocuments(documentIds);
  const answer = await answerQuestion({
    query,
    documents,
    style: input.style,
    difyConversationId: conversation.difyConversationId,
  });
  const now = new Date().toISOString();
  const updated: StoredConversation = {
    ...conversation,
    title: conversation.messages.length === 0 ? query.slice(0, 48) : conversation.title,
    updatedAt: now,
    documentIds,
    difyConversationId: answer.difyConversationId ?? conversation.difyConversationId,
    messages: [
      ...conversation.messages,
      {
        id: randomUUID(),
        role: "user",
        content: query,
        status: "complete",
      },
      {
        id: randomUUID(),
        role: "assistant",
        content: answer.content,
        citations: answer.citations,
        status: answer.status,
      },
    ],
  };
  await saveConversation(updated);
  return toConversation(updated);
}

export async function regenerateConversationMessage(
  id: string,
  input: { messageId: string; style: ResponseStyle },
) {
  requireId(id);
  const conversation = await getConversation(id);
  if (!conversation) {
    throw new ApiError("That conversation was not found.", 404);
  }

  const messageIndex = conversation.messages.findIndex(
    (message) => message.id === input.messageId,
  );
  const previousUser = conversation.messages
    .slice(0, messageIndex)
    .reverse()
    .find((message) => message.role === "user");

  if (messageIndex < 0 || !previousUser) {
    throw new ApiError("Couldn't regenerate this answer.", 404);
  }

  const documents = await readyDocuments(conversation.documentIds);
  const answer = await answerQuestion({
    query: previousUser.content,
    documents,
    style: input.style,
    difyConversationId: conversation.difyConversationId,
  });
  const updated: StoredConversation = {
    ...conversation,
    updatedAt: new Date().toISOString(),
    difyConversationId: answer.difyConversationId ?? conversation.difyConversationId,
    messages: conversation.messages.map((message) =>
      message.id === input.messageId
        ? {
            ...message,
            content: answer.content,
            citations: answer.citations,
            status: answer.status,
          }
        : message,
    ),
  };
  await saveConversation(updated);
  return toConversation(updated);
}

export function parseStyle(value: unknown): ResponseStyle {
  if (!isStyle(value)) {
    throw new ApiError("Choose a concise or detailed response.");
  }
  return value;
}

export async function updatePreferences(input: Preferences) {
  const preferences: Preferences = {
    responseStyle: parseStyle(input.responseStyle),
    prioritizeSelectedDocuments: Boolean(input.prioritizeSelectedDocuments),
    startNewConversationsAutomatically: Boolean(input.startNewConversationsAutomatically),
  };
  await savePreferences(preferences);
  return preferences;
}
