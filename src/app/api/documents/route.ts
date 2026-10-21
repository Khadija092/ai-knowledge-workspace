import { ApiError, deleteAllDocuments, uploadDocuments } from "@/server/workspace";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form
      .getAll("files")
      .filter((item): item is File => typeof item !== "string");
    const documents = await uploadDocuments(files);
    return Response.json({ documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    await deleteAllDocuments();
    return Response.json({ documents: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't delete the documents.";
    const status = error instanceof ApiError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
