"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  fetchDecision,
  updateDecision as updateSupabaseDecision,
  removeDecision as removeSupabaseDecision,
} from "@/lib/supabase/decisions";
import type { Decision } from "@/lib/types";
import { SignInGate } from "@/components/auth-ui";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: "long",
  });
}

export default function DecisionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [decision, setDecision] = useState<Decision | null>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [outcome, setOutcome] = useState("");
  const [editingOutcome, setEditingOutcome] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (cancelled) return;
        setUser(u ?? null);
        if (u) {
          const d = await fetchDecision(id);
          if (!cancelled && d) {
            setDecision(d);
            if (d.outcome) setOutcome(d.outcome);
          }
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
  }, [id]);

  async function handleSaveOutcome() {
    if (saving || !decision) return;
    setSaving(true);
    const newOutcome = outcome.trim();
    const decidedAt = newOutcome ? new Date().toISOString() : undefined;
    try {
      await updateSupabaseDecision(id, { outcome: newOutcome, decidedAt });
      setDecision((d) => (d ? { ...d, outcome: newOutcome, decidedAt } : null));
      setEditingOutcome(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!decision || !confirm("Delete this decision? This can't be undone."))
      return;
    try {
      await removeSupabaseDecision(id);
      router.push("/decisions");
    } catch {
      // leave on page
    }
  }

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
        title="Sign in to view this decision"
        message="Your decisions are in your account. Sign in to view and edit them."
        redirectTo="/"
        next={`/decisions/${id}`}
      />
    );
  }

  if (!decision) {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--muted)]">Decision not found.</p>
        <Link
          href="/decisions"
          className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Back to decisions
        </Link>
      </div>
    );
  }

  const hasOutcome = !!decision.outcome?.trim();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/decisions"
        className="mb-6 inline-block text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        ← Back to decisions
      </Link>

      <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {decision.title || "Untitled decision"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Created {formatDate(decision.createdAt)}
          </p>

          {decision.context && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-[var(--muted)]">
                Context
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-[var(--foreground)]">
                {decision.context}
              </p>
            </div>
          )}

          {decision.options.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-[var(--muted)]">
                Options
              </h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--foreground)]">
                {decision.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <h2 className="text-sm font-medium text-[var(--muted)]">
              Outcome
            </h2>
            {editingOutcome || !hasOutcome ? (
              <div className="mt-2 flex flex-col gap-3">
                <textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What did you decide? How did it go?"
                  rows={3}
                  className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOutcome}
                    disabled={saving}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save outcome"}
                  </button>
                  {hasOutcome && (
                    <button
                      type="button"
                      onClick={() => {
                        setOutcome(decision.outcome ?? "");
                        setEditingOutcome(false);
                      }}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="whitespace-pre-wrap text-[var(--foreground)]">
                  {decision.outcome}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingOutcome(true)}
                  className="mt-2 text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Edit outcome
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface-hover)]/50 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete decision
          </button>
        </div>
      </article>
    </div>
  );
}
