import { Suspense } from "react";
import type { Metadata } from "next";
import { ChatScreen } from "@/components/chat/chat-screen";

export const metadata: Metadata = {
  title: "AI Assistant",
};

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prompt?: string; document?: string; documents?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-background" />}>
      <ChatQuery params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ChatQuery({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prompt?: string; document?: string; documents?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const fromList = query.documents?.split(",").filter(Boolean) ?? [];
  const initialDocumentIds = query.document ? [query.document, ...fromList] : fromList;

  return (
    <ChatScreen
      key={id}
      id={id}
      initialPrompt={query.prompt ?? ""}
      initialDocumentIds={initialDocumentIds}
    />
  );
}
