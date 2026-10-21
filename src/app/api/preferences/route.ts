import { ApiError, updatePreferences } from "@/server/workspace";
import type { Preferences } from "@/types/chat";

export async function PUT(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Preferences | null;
    if (!body) {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const preferences = await updatePreferences(body);
    return Response.json({ preferences });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't save your preferences.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
