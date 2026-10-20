"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  History,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
  SquarePen,
} from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { cn } from "@/lib/utils";

const workspaceLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/chat/new", label: "AI Assistant", icon: Sparkles },
];

export function AppSidebar({
  mobileOpen,
  onNavigate,
  onHelp,
}: {
  mobileOpen: boolean;
  onNavigate: () => void;
  onHelp: () => void;
}) {
  const pathname = usePathname();
  const { conversations, preferences } = useWorkspace();
  const latest = [...conversations].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )[0];
  const newChatHref =
    preferences.startNewConversationsAutomatically || !latest
      ? "/chat/new"
      : `/chat/${latest.id}`;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-border bg-sidebar transition-transform md:static md:w-[72px] md:translate-x-0 lg:w-[248px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-6 md:justify-center md:px-3 lg:justify-start lg:px-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <span className="font-semibold md:hidden lg:inline">Knowledge AI</span>
      </div>
      <div className="px-4 md:px-3 lg:px-4">
        <Link
          href={newChatHref}
          onClick={onNavigate}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary-hover md:px-0 lg:justify-center"
        >
          <Plus className="size-4" aria-hidden />
          <span className="md:hidden lg:inline">New Chat</span>
        </Link>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto px-3">
        <div>
          <p className="px-3 pb-2 text-xs font-medium tracking-wide text-muted uppercase md:hidden lg:block">
            Workspace
          </p>
          <ul className="flex flex-col gap-1">
            {workspaceLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(pathname, link.href)}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="px-3 pb-2 text-xs font-medium tracking-wide text-muted uppercase md:hidden lg:block">
            Library
          </p>
          <NavLink
            href="/history"
            label="Chat History"
            icon={History}
            active={isActive(pathname, "/history")}
            onNavigate={onNavigate}
          />
        </div>
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-3">
        <NavLink
          href="/settings"
          label="Settings"
          icon={Settings}
          active={isActive(pathname, "/settings")}
          onNavigate={onNavigate}
        />
        <div className="md:hidden lg:block">
          <UserMenu onHelp={onHelp} />
        </div>
        <div className="hidden md:block lg:hidden">
          <UserMenu onHelp={onHelp} compact />
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof SquarePen;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium md:justify-center lg:justify-start",
        active ? "bg-selected text-primary" : "text-[#374151] hover:bg-background",
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span className="md:hidden lg:inline">{label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/chat/new") {
    return pathname.startsWith("/chat");
  }
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
