import Link from "next/link";
import { listDocuments } from "@/features/documents";

export default function DocumentsPage() {
  const documents = listDocuments();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
        >
          Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Uploaded files will appear here. The documents feature supplies the
          list.
        </p>
      </div>
      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/15 px-5 py-8 text-sm text-zinc-500 dark:border-white/15">
          No documents yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((document) => (
            <li
              key={document.id}
              className="rounded-2xl border border-black/10 px-5 py-4 dark:border-white/10"
            >
              <p className="font-medium">{document.title}</p>
              <p className="text-sm text-zinc-500">{document.filename}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
