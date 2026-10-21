"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HelpDialog } from "@/components/layout/help-dialog";
import { useWorkspace } from "@/features/workspace/workspace-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuOpen = menuPath === pathname;
  const { toasts, dismissToast } = useWorkspace();
  const immersive =
    pathname.startsWith("/chat") || /^\/documents\/[^/]+$/.test(pathname);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[#101218]/50 backdrop-blur-[2px] md:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuPath(null)}
        />
      ) : null}
      <AppSidebar
        mobileOpen={menuOpen}
        onNavigate={() => setMenuPath(null)}
        onHelp={() => setHelpOpen(true)}
      />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader onOpenMenu={() => setMenuPath(pathname)} onHelp={() => setHelpOpen(true)} />
        <main
          className={
            immersive
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-7 md:px-8 md:py-8"
          }
        >
          {children}
        </main>
      </div>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(100%-2rem,320px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card"
          >
            <p className={toast.tone === "error" ? "text-destructive" : "text-foreground"}>
              {toast.message}
            </p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
            >
              <X className="size-4 text-secondary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
