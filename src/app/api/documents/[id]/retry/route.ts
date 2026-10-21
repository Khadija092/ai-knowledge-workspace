import { ApiError, retryDocument } from "@/server/workspace";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const document = await retryDocument(id);
    return Response.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't process that document.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
