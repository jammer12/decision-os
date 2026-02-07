"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const MAIN_SITE_URL = "https://www.nerdyexecutive.com";

export function HeaderNav() {
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
      setTimeout(() => setLoading(false), 0);
    }
    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <nav className="flex items-center gap-6">
        <a
          href={MAIN_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          Main Site
        </a>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-6">
      <a
        href={MAIN_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        Main Site
      </a>
      {user && (
        <>
          <Link
            href="/decisions/new"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
          >
            New decision
          </Link>
          <Link
            href="/decisions"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Decisions
          </Link>
          <Link
            href="/insights"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Insights
          </Link>
        </>
      )}
      {user ? (
        <div className="flex items-center gap-3">
          <span className="max-w-[140px] truncate text-sm text-[var(--muted)] sm:max-w-[200px]">
            {user.email}
          </span>
          <SignOutButton />
        </div>
      ) : (
        <Link
          href="/signin"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          Sign in
        </Link>
      )}
    </nav>
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
