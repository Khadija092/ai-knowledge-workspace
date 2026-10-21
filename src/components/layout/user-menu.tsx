"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function UserMenu({
  onHelp,
  compact = false,
  placement = "up",
  tone = "default",
}: {
  onHelp: () => void;
  compact?: boolean;
  placement?: "up" | "down";
  tone?: "default" | "inverse";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex items-center gap-3 rounded-xl text-left",
          tone === "inverse" ? "hover:bg-white/8" : "hover:bg-background",
          compact ? "px-2 py-2" : "w-full px-2 py-2",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-selected text-xs font-semibold text-primary">
          KH
        </span>
        {compact ? null : (
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-sm font-medium",
                tone === "inverse" ? "text-white" : "text-foreground",
              )}
            >
              Khadija Hafeez
            </span>
            <span className={cn("block text-xs", tone === "inverse" ? "text-white/45" : "text-muted")}>
              Demo profile
            </span>
          </span>
        )}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute z-30 w-60 rounded-2xl border border-border bg-card p-1 shadow-card",
            placement === "down" ? "top-12 right-0" : "bottom-12 left-0",
          )}
        >
          <div className="px-3 py-3">
            <p className="text-sm font-medium">Khadija Hafeez</p>
            <p className="text-xs text-muted">Demo account</p>
          </div>
          <MenuLink href="/settings" label="Profile" onSelect={() => setOpen(false)} />
          <MenuLink href="/settings" label="Settings" onSelect={() => setOpen(false)} />
          <button
            type="button"
            role="menuitem"
            className="flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-background"
            onClick={() => {
              setOpen(false);
              onHelp();
            }}
          >
            Help and support
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-background"
            onClick={() => router.push("/login")}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  label,
  onSelect,
}: {
  href: string;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex rounded-lg px-3 py-2 text-sm hover:bg-background"
      onClick={onSelect}
    >
      {label}
    </Link>
  );
}
