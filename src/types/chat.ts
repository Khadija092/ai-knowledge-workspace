import type { Citation } from "@/types/citation";

export type ChatRequest = {
  query: string;
  conversationId?: string;
  user?: string;
};

export type ChatResponse = {
  answer: string;
  conversationId: string;
};

export type ResponseStyle = "concise" | "detailed";

export type Preferences = {
  responseStyle: ResponseStyle;
  prioritizeSelectedDocuments: boolean;
  startNewConversationsAutomatically: boolean;
};

export type MessageStatus = "streaming" | "complete" | "error";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  status: MessageStatus;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  documentIds: string[];
  messages: ChatMessage[];
};
