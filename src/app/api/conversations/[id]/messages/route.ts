import {
  ApiError,
  parseStyle,
  regenerateConversationMessage,
  sendConversationMessage,
} from "@/server/workspace";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      query?: unknown;
      documentIds?: unknown;
      style?: unknown;
      regenerateMessageId?: unknown;
    } | null;

    if (!body) {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const style = parseStyle(body.style);
    const conversation =
      typeof body.regenerateMessageId === "string"
        ? await regenerateConversationMessage(id, {
            messageId: body.regenerateMessageId,
            style,
          })
        : await sendConversationMessage(id, {
            query: typeof body.query === "string" ? body.query : "",
            documentIds: Array.isArray(body.documentIds)
              ? body.documentIds.filter((item): item is string => typeof item === "string")
              : [],
            style,
          });

    return Response.json({ conversation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't prepare an answer.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
