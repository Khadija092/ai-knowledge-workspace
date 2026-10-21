import { headers } from "next/headers";
import { ApiError, loadWorkspace } from "@/server/workspace";

export async function GET() {
  await headers();

  try {
    return Response.json(await loadWorkspace());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't load your workspace.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
