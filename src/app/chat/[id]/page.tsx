import Link from "next/link";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
        >
          Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Chat</h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Conversation <span className="font-mono text-sm">{id}</span>. Messages
          will be sent to <span className="font-mono text-sm">/api/chat</span>,
          which forwards them to Dify on the server.
        </p>
      </div>
    </main>
  );
}
