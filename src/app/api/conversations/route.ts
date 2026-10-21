import { ApiError, createConversation } from "@/server/workspace";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      title?: unknown;
      documentIds?: unknown;
    } | null;
    const conversation = await createConversation({
      title: typeof body?.title === "string" ? body.title : undefined,
      documentIds: Array.isArray(body?.documentIds)
        ? body.documentIds.filter((id): id is string => typeof id === "string")
        : [],
    });
    return Response.json({ conversation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't start the conversation.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
