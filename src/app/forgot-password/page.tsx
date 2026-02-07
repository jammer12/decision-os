"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: "Check your email for the reset link. It may take a few minutes.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter your email and we&apos;ll send you a link to reset your password.
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
          {loading ? "…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/signin"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
