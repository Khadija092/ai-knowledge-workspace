import { isChatRequest } from "@/features/conversations";
import { forwardChatToDify } from "@/lib/dify";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isChatRequest(body)) {
    return Response.json(
      { error: "A non-empty query string is required." },
      { status: 400 },
    );
  }

  try {
    const result = await forwardChatToDify({
      query: body.query.trim(),
      conversationId: body.conversationId,
      user: body.user,
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat request failed.";
    const status = message === "Dify is not configured." ? 503 : 502;

    return Response.json({ error: message }, { status });
  }
}
