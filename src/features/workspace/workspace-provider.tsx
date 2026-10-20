"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createAnswer } from "@/features/conversations/answer";
import { mockConversations } from "@/features/conversations/mock";
import { mockDocuments } from "@/features/documents/mock";
import type { Conversation, Preferences, ResponseStyle } from "@/types/chat";
import type { Document } from "@/types/document";

const PREFERENCES_KEY = "knowledge-ai-preferences";

const defaultPreferences: Preferences = {
  responseStyle: "detailed",
  prioritizeSelectedDocuments: true,
  startNewConversationsAutomatically: true,
};

type Toast = {
  id: string;
  message: string;
  tone: "success" | "error";
};

type SendMessageInput = {
  conversationId?: string;
  query: string;
  documentIds: string[];
  documents: Document[];
  style: ResponseStyle;
};

type WorkspaceContextValue = {
  documents: Document[];
  conversations: Conversation[];
  preferences: Preferences;
  loading: boolean;
  preferencesReady: boolean;
  libraryError: string | null;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  notify: (message: string, tone?: Toast["tone"]) => void;
  reloadLibrary: () => void;
  addUploadedFiles: (files: File[]) => void;
  renameDocument: (id: string, title: string) => void;
  deleteDocument: (id: string) => void;
  retryDocument: (id: string) => void;
  sendMessage: (input: SendMessageInput) => string;
  regenerateMessage: (conversationId: string, messageId: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  savePreferences: (next: Preferences) => Promise<void>;
  clearDocuments: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(PREFERENCES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<Preferences>;
          setPreferences({ ...defaultPreferences, ...parsed });
        }
        setPreferencesReady(true);
      } catch {
        setPreferencesReady(true);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function notify(message: string, tone: Toast["tone"] = "success") {
    const id = createId("toast");
    setToasts((current) => [...current, { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
    timers.current.push(timer);
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function scheduleReady(documentId: string) {
    const timer = window.setTimeout(() => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId
            ? {
                ...document,
                status: "ready",
                error: undefined,
                pageCount: document.pageCount ?? 1,
                passages: document.passages ?? [
                  {
                    page: 1,
                    text: `This demo passage was prepared from ${document.filename} after processing finished.`,
                  },
                ],
              }
            : document,
        ),
      );
    }, 1600);
    timers.current.push(timer);
  }

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      documents,
      conversations,
      preferences,
      loading,
      preferencesReady,
      libraryError,
      toasts,
      dismissToast,
      notify,
      reloadLibrary() {
        setLibraryError(null);
        setLoading(true);
        const timer = window.setTimeout(() => {
          setDocuments(mockDocuments);
          setConversations(mockConversations);
          setLoading(false);
          notify("Workspace restored.");
        }, 400);
        timers.current.push(timer);
      },
      addUploadedFiles(files) {
        const created = files.map((file) => {
          const title = file.name.replace(/\.pdf$/i, "");
          return {
            id: createId("doc"),
            title,
            filename: file.name,
            type: "PDF" as const,
            sizeBytes: file.size,
            uploadedAt: new Date().toISOString(),
            status: "processing" as const,
          };
        });
        setDocuments((current) => [...created, ...current]);
        created.forEach((document) => scheduleReady(document.id));
        notify(
          "Your document was uploaded successfully. We're preparing it for AI-powered search.",
        );
      },
      renameDocument(id, title) {
        const filename = title.toLowerCase().endsWith(".pdf") ? title : `${title}.pdf`;
        setDocuments((current) =>
          current.map((document) =>
            document.id === id
              ? {
                  ...document,
                  title: title.replace(/\.pdf$/i, ""),
                  filename,
                }
              : document,
          ),
        );
        notify("Document renamed.");
      },
      deleteDocument(id) {
        setDocuments((current) => current.filter((document) => document.id !== id));
        notify("Document deleted.");
      },
      retryDocument(id) {
        setDocuments((current) =>
          current.map((document) =>
            document.id === id
              ? { ...document, status: "processing", error: undefined }
              : document,
          ),
        );
        scheduleReady(id);
        notify("Processing started again.");
      },
      sendMessage(input) {
        const conversationId = input.conversationId ?? createId("conv");
        const userMessage = {
          id: createId("msg"),
          role: "user" as const,
          status: "complete" as const,
          content: input.query.trim(),
        };
        const assistantId = createId("msg");
        const assistantMessage = {
          id: assistantId,
          role: "assistant" as const,
          status: "streaming" as const,
          content: "",
        };

        setConversations((current) => {
          const existing = current.find((item) => item.id === conversationId);
          const nextConversation: Conversation = existing
            ? {
                ...existing,
                updatedAt: new Date().toISOString(),
                documentIds: input.documentIds,
                title:
                  existing.messages.length === 0
                    ? userMessage.content.slice(0, 48)
                    : existing.title,
                messages: [...existing.messages, userMessage, assistantMessage],
              }
            : {
                id: conversationId,
                title: userMessage.content.slice(0, 48),
                updatedAt: new Date().toISOString(),
                documentIds: input.documentIds,
                messages: [userMessage, assistantMessage],
              };

          return [
            nextConversation,
            ...current.filter((item) => item.id !== conversationId),
          ];
        });

        const timer = window.setTimeout(() => {
          const answer =
            input.documents.length === 0
              ? null
              : createAnswer(input.query, input.documents, input.style);

          setConversations((current) =>
            current.map((conversation) => {
              if (conversation.id !== conversationId) {
                return conversation;
              }

              return {
                ...conversation,
                updatedAt: new Date().toISOString(),
                messages: conversation.messages.map((message) =>
                  message.id === assistantId
                    ? answer
                      ? {
                          ...message,
                          status: "complete",
                          content: answer.content,
                          citations: answer.citations,
                        }
                      : {
                          ...message,
                          status: "error",
                          content:
                            "Select a ready document before asking a question.",
                        }
                    : message,
                ),
              };
            }),
          );
        }, 900);
        timers.current.push(timer);
        return conversationId;
      },
      regenerateMessage(conversationId, messageId) {
        const conversation = conversations.find((item) => item.id === conversationId);
        const messageIndex = conversation?.messages.findIndex(
          (message) => message.id === messageId,
        );
        const previousUser = conversation?.messages
          .slice(0, messageIndex)
          .reverse()
          .find((message) => message.role === "user");
        const selected = documents.filter(
          (document) =>
            conversation?.documentIds.includes(document.id) &&
            document.status === "ready",
        );

        if (!conversation || !previousUser || selected.length === 0) {
          notify("Couldn't regenerate this answer.", "error");
          return;
        }

        setConversations((current) =>
          current.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  messages: item.messages.map((message) =>
                    message.id === messageId
                      ? { ...message, status: "streaming", content: "", citations: [] }
                      : message,
                  ),
                }
              : item,
          ),
        );

        const timer = window.setTimeout(() => {
          const answer = createAnswer(
            previousUser.content,
            selected,
            preferences.responseStyle,
          );
          setConversations((current) =>
            current.map((item) =>
              item.id === conversationId
                ? {
                    ...item,
                    updatedAt: new Date().toISOString(),
                    messages: item.messages.map((message) =>
                      message.id === messageId
                        ? {
                            ...message,
                            status: "complete",
                            content: answer.content,
                            citations: answer.citations,
                          }
                        : message,
                    ),
                  }
                : item,
            ),
          );
        }, 900);
        timers.current.push(timer);
      },
      renameConversation(id, title) {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === id ? { ...conversation, title } : conversation,
          ),
        );
        notify("Conversation renamed.");
      },
      deleteConversation(id) {
        setConversations((current) =>
          current.filter((conversation) => conversation.id !== id),
        );
        notify("Conversation deleted.");
      },
      async savePreferences(next) {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
        setPreferences(next);
      },
      clearDocuments() {
        setDocuments([]);
        notify("All documents were deleted.");
      },
    }),
    [conversations, documents, libraryError, loading, preferences, preferencesReady, toasts],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
