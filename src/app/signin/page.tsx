"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [loading, setLoading] = useState(false);

  async function handleSignIn(provider: "google" | "apple" = "google") {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Sign in to Decision OS
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in to access your decisions. You’ll use your Google or Apple
          account.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={() => handleSignIn("google")}
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 text-center">
            <button
              type="button"
              onClick={() => handleSignIn("apple")}
              disabled={loading}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
            >
              Sign in with Apple instead
            </button>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link
            href={next}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back
          </Link>
        </p>
      </div>
    </div>
  );
}
