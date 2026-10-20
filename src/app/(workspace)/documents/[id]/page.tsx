import { Suspense } from "react";
import type { Metadata } from "next";
import { DocumentViewer } from "@/components/documents/document-viewer";

export const metadata: Metadata = {
  title: "Document",
};

export default function DocumentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-canvas" />}>
      <DocumentQuery params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function DocumentQuery({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const page = Number(query.page);
  const initialPage = Number.isFinite(page) && page > 0 ? page : 1;

  return <DocumentViewer key={`${id}-${initialPage}`} id={id} initialPage={initialPage} />;
}
