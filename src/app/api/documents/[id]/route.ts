import { ApiError, deleteDocument, renameDocument } from "@/server/workspace";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
    if (!body || typeof body.title !== "string") {
      return Response.json({ error: "Enter a document name." }, { status: 400 });
    }
    const document = await renameDocument(id, body.title);
    return Response.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't rename that document.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await deleteDocument(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't delete that document.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
