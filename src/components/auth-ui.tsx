"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthUI() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        setUser(u);
        setLoading(false);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    } catch {
      setLoading(false);
    }
    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="max-w-[140px] truncate text-sm text-[var(--muted)] sm:max-w-[200px]">
          {user.email}
        </span>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton provider="google" />
      <SignInButton provider="apple" />
    </div>
  );
}

function SignInButton({
  provider,
  className = "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60",
}: {
  provider: "google" | "apple";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } catch {
      // e.g. Supabase not configured
    }
    setLoading(false);
  }

  const label = provider === "google" ? "Google" : "Apple";

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      className={className}
    >
      {loading ? "…" : label}
    </button>
  );
}

/** Full-page gate when a route requires sign-in. Use when user is null after auth check. */
export function SignInGate({
  title,
  message,
  redirectTo,
}: {
  title: string;
  message: string;
  redirectTo?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-10 shadow-sm sm:px-12">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <SignInButton
            provider="google"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
          />
          <SignInButton
            provider="apple"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
          />
        </div>
        {redirectTo && (
          <p className="mt-6">
            <a
              href={redirectTo}
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              ← Back to home
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
