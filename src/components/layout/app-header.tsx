"use client";

import { usePathname } from "next/navigation";
import { CircleHelp, Menu } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { UserMenu } from "@/components/layout/user-menu";

const titles: Array<[prefix: string, title: string]> = [
  ["/documents/", "Document"],
  ["/documents", "Documents"],
  ["/chat", "AI Assistant"],
  ["/history", "Chat History"],
  ["/settings", "Settings"],
  ["/dashboard", "Overview"],
];

export function AppHeader({
  onOpenMenu,
  onHelp,
}: {
  onOpenMenu: () => void;
  onHelp: () => void;
}) {
  const pathname = usePathname();
  const title = titles.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Overview";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-card/80 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-background md:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      <p className="min-w-0 truncate text-sm font-medium md:hidden">{title}</p>
      <form action="/documents" className="hidden min-w-0 flex-1 md:block md:max-w-md">
        <SearchInput name="q" placeholder="Search documents..." label="Search documents" />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-secondary hover:bg-background hover:text-foreground"
          onClick={onHelp}
          aria-label="Help"
        >
          <CircleHelp className="size-5" />
        </button>
        <UserMenu onHelp={onHelp} compact placement="down" />
      </div>
    </header>
  );
}
