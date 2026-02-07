"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SignInGate } from "@/components/auth-ui";

type InsightsData = {
  topicsCount: number;
  learnings: string[];
  insights: string;
  raw?: string;
};

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!cancelled) setUser(u ?? null);
        if (!u) {
          if (!cancelled) setLoading(false);
          return;
        }
        const res = await fetch("/api/insights");
        if (cancelled) return;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.error || "Failed to load insights.");
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Failed to load insights.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <SignInGate
        title="Sign in to view insights"
        message="Insights are generated from your saved decisions. Sign in to see them."
        redirectTo="/"
        next="/insights"
      />
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/decisions"
          className="mb-6 inline-block text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back to decisions
        </Link>
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/decisions"
        className="mb-6 inline-block text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to decisions
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Insights
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Summary and learnings from your decision cards.
      </p>

      {data && (
        <div className="mt-8 flex flex-col gap-8">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Topics covered
            </h2>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {data.topicsCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Distinct themes across your decisions
            </p>
          </section>

          {data.insights && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Summary
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
                {data.insights}
              </p>
            </section>
          )}

          {data.learnings && data.learnings.length > 0 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Potential learnings from recommendations
              </h2>
              <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--foreground)]">
                {data.learnings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
