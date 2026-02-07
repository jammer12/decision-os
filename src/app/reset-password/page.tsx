"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: password.trim() });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      setMessage({ type: "success", text: "Password updated. Redirecting…" });
      router.push("/decisions");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        Set new password
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">At least 6 characters</p>
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
          {loading ? "…" : "Update password"}
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
