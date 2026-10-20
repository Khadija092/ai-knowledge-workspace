import { Suspense } from "react";
import type { Metadata } from "next";
import { DocumentsLibrary } from "@/components/documents/documents-library";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl border border-border bg-card" />}>
      <DocumentsQuery searchParams={searchParams} />
    </Suspense>
  );
}

async function DocumentsQuery({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <DocumentsLibrary initialQuery={params.q ?? ""} />;
}
