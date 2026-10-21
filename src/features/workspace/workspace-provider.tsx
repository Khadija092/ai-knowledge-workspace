"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Conversation, Preferences, ResponseStyle } from "@/types/chat";
import type { Document } from "@/types/document";

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
  addUploadedFiles: (files: File[]) => Promise<void>;
  renameDocument: (id: string, title: string) => void;
  deleteDocument: (id: string) => void;
  retryDocument: (id: string) => void;
  sendMessage: (input: SendMessageInput) => Promise<string>;
  regenerateMessage: (conversationId: string, messageId: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  savePreferences: (next: Preferences) => Promise<void>;
  clearDocuments: () => void;
};

type WorkspacePayload = {
  documents: Document[];
  conversations: Conversation[];
  preferences: Preferences;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

async function readPayload<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let data: (T & { error?: string }) | null = null;

  try {
    data = JSON.parse(raw) as T & { error?: string };
  } catch {
    // Vercel can reject an oversized upload before the route handler runs.
  }

  if (!response.ok) {
    const message =
      data?.error ??
      (response.status === 413
        ? "Upload rejected: the file is larger than Vercel's request limit. Choose a PDF smaller than 4 MB."
        : raw.trim()
          ? `Request failed (${response.status}): ${raw.slice(0, 180)}`
          : `Request failed (${response.status}).`);
    throw new Error(message);
  }

  if (!data) {
    throw new Error("The server returned an invalid response.");
  }

  return data as T;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
    timers.current.push(timer);
  }, []);

  const loadWorkspace = useCallback(async () => {
    try {
      const response = await fetch("/api/workspace");
      const data = await readPayload<WorkspacePayload>(response);
      setDocuments(data.documents);
      setConversations(data.conversations);
      setPreferences(data.preferences);
      setLibraryError(null);
    } catch (error) {
      setLibraryError(
        error instanceof Error ? error.message : "Couldn't load your workspace.",
      );
    } finally {
      setLoading(false);
      setPreferencesReady(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
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
        void loadWorkspace();
      },
      async addUploadedFiles(files) {
        const body = new FormData();
        for (const file of files) {
          body.append("files", file);
        }
        const response = await fetch("/api/documents", { method: "POST", body });
        const data = await readPayload<{ documents: Document[] }>(response);
        setDocuments((current) => {
          const ids = new Set(data.documents.map((document) => document.id));
          return [...data.documents, ...current.filter((document) => !ids.has(document.id))];
        });
        notify("Your document was saved to the library.");
      },
      renameDocument(id, title) {
        void (async () => {
          try {
            const response = await fetch(`/api/documents/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title }),
            });
            const data = await readPayload<{ document: Document }>(response);
            setDocuments((current) =>
              current.map((document) => (document.id === id ? data.document : document)),
            );
            notify("Document renamed.");
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't rename that document.",
              "error",
            );
          }
        })();
      },
      deleteDocument(id) {
        void (async () => {
          try {
            const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            await readPayload<{ ok: boolean }>(response);
            setDocuments((current) => current.filter((document) => document.id !== id));
            notify("Document deleted.");
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't delete that document.",
              "error",
            );
          }
        })();
      },
      retryDocument(id) {
        setDocuments((current) =>
          current.map((document) =>
            document.id === id
              ? { ...document, status: "processing", error: undefined }
              : document,
          ),
        );
        void (async () => {
          try {
            const response = await fetch(`/api/documents/${id}/retry`, { method: "POST" });
            const data = await readPayload<{ document: Document }>(response);
            setDocuments((current) =>
              current.map((document) => (document.id === id ? data.document : document)),
            );
            notify(
              data.document.status === "ready"
                ? "Processing finished."
                : "Processing failed again.",
              data.document.status === "ready" ? "success" : "error",
            );
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't process that document.",
              "error",
            );
            void loadWorkspace();
          }
        })();
      },
      async sendMessage(input) {
        const query = input.query.trim();
        let conversationId = input.conversationId;

        if (!conversationId) {
          const response = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: query.slice(0, 48),
              documentIds: input.documentIds,
            }),
          });
          const data = await readPayload<{ conversation: Conversation }>(response);
          conversationId = data.conversation.id;
        }

        const targetId = conversationId;
        const userMessage = {
          id: crypto.randomUUID(),
          role: "user" as const,
          status: "complete" as const,
          content: query,
        };
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          status: "streaming" as const,
          content: "",
        };

        setConversations((current) => {
          const existing = current.find((item) => item.id === targetId);
          const nextConversation: Conversation = existing
            ? {
                ...existing,
                updatedAt: new Date().toISOString(),
                documentIds: input.documentIds,
                title: existing.messages.length === 0 ? query.slice(0, 48) : existing.title,
                messages: [...existing.messages, userMessage, assistantMessage],
              }
            : {
                id: targetId,
                title: query.slice(0, 48),
                updatedAt: new Date().toISOString(),
                documentIds: input.documentIds,
                messages: [userMessage, assistantMessage],
              };
          return [nextConversation, ...current.filter((item) => item.id !== targetId)];
        });

        void (async () => {
          try {
            const response = await fetch(`/api/conversations/${targetId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query,
                documentIds: input.documentIds,
                style: input.style,
              }),
            });
            const data = await readPayload<{ conversation: Conversation }>(response);
            setConversations((current) =>
              current.map((item) => (item.id === targetId ? data.conversation : item)),
            );
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Couldn't prepare an answer.";
            setConversations((current) =>
              current.map((item) =>
                item.id === targetId
                  ? {
                      ...item,
                      messages: item.messages.map((entry) =>
                        entry.id === assistantMessage.id
                          ? { ...entry, status: "error", content: message }
                          : entry,
                      ),
                    }
                  : item,
              ),
            );
          }
        })();

        return targetId;
      },
      regenerateMessage(conversationId, messageId) {
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
        void (async () => {
          try {
            const response = await fetch(`/api/conversations/${conversationId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                regenerateMessageId: messageId,
                style: preferences.responseStyle,
              }),
            });
            const data = await readPayload<{ conversation: Conversation }>(response);
            setConversations((current) =>
              current.map((item) => (item.id === conversationId ? data.conversation : item)),
            );
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't regenerate this answer.",
              "error",
            );
            void loadWorkspace();
          }
        })();
      },
      renameConversation(id, title) {
        void (async () => {
          try {
            const response = await fetch(`/api/conversations/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title }),
            });
            const data = await readPayload<{ conversation: Conversation }>(response);
            setConversations((current) =>
              current.map((conversation) =>
                conversation.id === id ? data.conversation : conversation,
              ),
            );
            notify("Conversation renamed.");
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't rename that conversation.",
              "error",
            );
          }
        })();
      },
      deleteConversation(id) {
        void (async () => {
          try {
            const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
            await readPayload<{ ok: boolean }>(response);
            setConversations((current) =>
              current.filter((conversation) => conversation.id !== id),
            );
            notify("Conversation deleted.");
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't delete that conversation.",
              "error",
            );
          }
        })();
      },
      async savePreferences(next) {
        const response = await fetch("/api/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        const data = await readPayload<{ preferences: Preferences }>(response);
        setPreferences(data.preferences);
      },
      clearDocuments() {
        void (async () => {
          try {
            const response = await fetch("/api/documents", { method: "DELETE" });
            await readPayload<{ documents: Document[] }>(response);
            setDocuments([]);
            notify("All documents were deleted.");
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "Couldn't delete the documents.",
              "error",
            );
          }
        })();
      },
    }),
    [
      conversations,
      documents,
      libraryError,
      loadWorkspace,
      loading,
      notify,
      preferences,
      preferencesReady,
      toasts,
    ],
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
