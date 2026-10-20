export type ChatRequest = {
  query: string;
  conversationId?: string;
  user?: string;
};

export type ChatResponse = {
  answer: string;
  conversationId: string;
};
