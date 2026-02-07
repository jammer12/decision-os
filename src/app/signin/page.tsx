"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
          return;
        }
        if (data.user && !data.session) {
          setMessage({
            type: "success",
            text: "Check your email for the confirmation link.",
          });
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
          return;
        }
      }
      window.location.href = "/decisions";
    } catch (err) {
      console.error("Sign-in error:", err);
      const text =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Something went wrong. Try again.";
      setMessage({
        type: "error",
        text: text + " (Check the browser console for details.)",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        {mode === "signup" ? "Create account" : "Sign in"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {mode === "signup"
          ? "Create an account to save your decisions."
          : "Sign in to access your saved decisions."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          {mode === "signup" && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              At least 6 characters
            </p>
          )}
        </div>

        {message && (
          <p
            className={
              message.type === "error"
                ? "rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                : "rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
            }
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Create account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage(null);
              }}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back
        </Link>
      </p>
    </div>
  );
}
