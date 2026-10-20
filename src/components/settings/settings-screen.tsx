"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import type { Preferences, ResponseStyle } from "@/types/chat";

const categories = ["General", "Account", "AI preferences"] as const;

export function SettingsScreen() {
  const { preferencesReady } = useWorkspace();

  if (!preferencesReady) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Settings"
          description="Manage your account and workspace preferences."
        />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  return <SettingsForm />;
}

function SettingsForm() {
  const { preferences, savePreferences, clearDocuments, notify } = useWorkspace();
  const [category, setCategory] = useState<(typeof categories)[number]>("General");
  const [draft, setDraft] = useState<Preferences>(preferences);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function save() {
    setStatus("saving");
    try {
      await savePreferences(draft);
      setStatus("saved");
      notify("Preferences saved.");
    } catch {
      setStatus("error");
      notify("Couldn't save your preferences.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your account and workspace preferences."
      />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap ${
                category === item ? "bg-selected text-primary" : "text-secondary hover:bg-card"
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <section className="rounded-xl border border-border bg-card p-6">
          {category === "General" ? (
            <div className="flex max-w-xl flex-col gap-6">
              <h2 className="text-xl font-semibold">General settings</h2>
              <fieldset>
                <legend className="text-sm font-medium">Appearance</legend>
                <label className="mt-3 flex items-center gap-3 text-sm">
                  <input type="radio" checked readOnly className="accent-primary" />
                  Light theme
                </label>
                <p className="mt-2 text-[13px] text-secondary">
                  Knowledge AI currently uses the light theme.
                </p>
              </fieldset>
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="mt-2 text-sm text-secondary">English</p>
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={draft.startNewConversationsAutomatically}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      startNewConversationsAutomatically: event.target.checked,
                    }))
                  }
                />
                <span>
                  <span className="font-medium">Start new conversations automatically</span>
                  <span className="mt-1 block text-[13px] text-secondary">
                    When this is off, New Chat opens your most recent conversation.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
          {category === "Account" ? (
            <div className="flex max-w-xl flex-col gap-5">
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="text-sm text-secondary">
                This is a demo profile. Name and email stay read-only until sign-in is connected.
              </p>
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-selected text-sm font-semibold text-primary">
                  KH
                </span>
                <div>
                  <p className="font-medium">Khadija Hafeez</p>
                  <p className="text-[13px] text-secondary">Demo account</p>
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Display name
                <input
                  readOnly
                  value="Khadija Hafeez"
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm font-normal text-secondary"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Email
                <input
                  readOnly
                  value="khadija@example.com"
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm font-normal text-secondary"
                />
              </label>
              <div className="border-t border-border pt-5">
                <h3 className="text-base font-semibold">Delete documents</h3>
                <p className="mt-1 text-[13px] text-secondary">
                  This removes every document from the demo library. Conversations stay in history.
                </p>
                <Button className="mt-4" variant="destructive" onClick={() => setConfirmOpen(true)}>
                  Delete all documents
                </Button>
              </div>
            </div>
          ) : null}
          {category === "AI preferences" ? (
            <div className="flex max-w-xl flex-col gap-6">
              <h2 className="text-xl font-semibold">AI preferences</h2>
              <fieldset>
                <legend className="text-sm font-medium">Response style</legend>
                <div className="mt-3 flex flex-col gap-2">
                  {(["concise", "detailed"] as ResponseStyle[]).map((style) => (
                    <label key={style} className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name="response-style"
                        className="accent-primary"
                        checked={draft.responseStyle === style}
                        onChange={() =>
                          setDraft((current) => ({ ...current, responseStyle: style }))
                        }
                      />
                      {style === "concise" ? "Concise" : "Detailed"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={draft.prioritizeSelectedDocuments}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      prioritizeSelectedDocuments: event.target.checked,
                    }))
                  }
                />
                <span>
                  <span className="font-medium">Prioritize selected documents</span>
                  <span className="mt-1 block text-[13px] text-secondary">
                    When this is on, a question is sent only for the documents you check. When it is off and nothing is checked, ready documents in the library are used.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
          {category !== "Account" ? (
            <div className="mt-8 flex items-center gap-3">
              <Button onClick={save} disabled={status === "saving"}>
                {status === "saving" ? "Saving..." : "Save changes"}
              </Button>
              {status === "saved" ? (
                <p className="text-sm text-success">Saved</p>
              ) : null}
              {status === "error" ? (
                <p className="text-sm text-destructive">Couldn&apos;t save changes.</p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete all documents?"
        description="Every file in the demo library will be removed. This does not delete conversations."
        confirmLabel="Delete documents"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          clearDocuments();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
