"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (data?.url) window.location.href = data.url;
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in with Google to save decisions to your account.
      </p>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "…" : "Sign in with Google"}
      </button>
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
