import Link from "next/link";

const routes = [
  {
    href: "/documents",
    title: "Documents",
    description: "The library of source files this workspace can answer from.",
  },
  {
    href: "/chat/new",
    title: "Chat",
    description: "A conversation grounded in those documents.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium tracking-wide text-zinc-500">
          AI Knowledge Workspace
        </p>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
          Ask questions grounded in your documents.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Pages, reusable UI, and feature logic are separated so the Dify API
          key never reaches the browser.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {routes.map((route) => (
          <li key={route.href}>
            <Link
              href={route.href}
              className="flex h-full flex-col gap-2 rounded-2xl border border-black/10 px-5 py-4 transition-colors hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06]"
            >
              <span className="font-medium">{route.title}</span>
              <span className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {route.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
