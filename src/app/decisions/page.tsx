"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchDecisions, removeDecision } from "@/lib/supabase/decisions";
import type { Decision } from "@/lib/types";
import { DecisionCard } from "@/components/decision-card";
import { SignInGate } from "@/components/auth-ui";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await removeDecision(id);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // leave in list on error
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (cancelled) return;
        setUser(u ?? null);
        if (u) {
          const list = await fetchDecisions();
          if (!cancelled) setDecisions(list);
        }
      } catch {
        // leave user null
      } finally {
        if (!cancelled) setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <SignInGate
        title="Sign in to view decisions"
        message="Your decisions are stored in your account. Sign in to see them."
        redirectTo="/"
        next="/decisions"
      />
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-8 py-12 sm:px-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            No decisions yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Create your first decision to start building your decision journal.
          </p>
          <Link
            href="/decisions/new"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
          >
            New decision
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Decisions
        </h1>
        <Link
          href="/decisions/new"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          New decision
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {decisions.map((d) => (
          <li key={d.id}>
            <DecisionCard
              decision={d}
              onDelete={handleDelete}
              isDeleting={deletingId === d.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
