import { ApiError, deleteConversation, renameConversation } from "@/server/workspace";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
    if (!body || typeof body.title !== "string") {
      return Response.json({ error: "Enter a conversation name." }, { status: 400 });
    }
    const conversation = await renameConversation(id, body.title);
    return Response.json({ conversation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't rename that conversation.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await deleteConversation(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Couldn't delete that conversation.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
