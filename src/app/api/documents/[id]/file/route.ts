import { headers } from "next/headers";
import { ApiError, openDocumentFile } from "@/server/workspace";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  await headers();

  try {
    const { id } = await context.params;
    const { document, bytes } = await openDocumentFile(id);
    const filename = document.filename.replace(/["\r\n]/g, "");
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't open the PDF.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
