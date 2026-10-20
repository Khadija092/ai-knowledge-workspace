"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "signup" && name.trim().length === 0) {
      setError("Enter your name to continue.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setError("");
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="font-semibold">Knowledge AI</span>
        </div>
        <h1 className="mt-8 text-[28px] leading-9 font-semibold">
          {mode === "login" ? "Welcome back" : "Create your workspace"}
        </h1>
        <p className="mt-2 text-sm text-secondary">
          {mode === "login"
            ? "Continue your research."
            : "Start asking questions from your documents."}
        </p>
        <form className="mt-8 flex flex-col gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Name
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Password
            <Input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-2 w-full">
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-[13px] text-secondary">
          Demo screen. Your password is not saved or sent anywhere.
        </p>
        <p className="mt-6 text-sm text-secondary">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="font-medium text-primary"
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
