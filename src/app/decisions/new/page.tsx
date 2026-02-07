"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { insertDecision } from "@/lib/supabase/decisions";
import { SignInGate } from "@/components/auth-ui";

export default function NewDecisionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const options = optionsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!cancelled) {
          setSignedIn(!!user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !signedIn) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim() || "Untitled decision",
      context: context.trim(),
      options,
    };

    try {
      const decision = await insertDecision(payload);
      router.push(`/decisions/${decision.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <SignInGate
        title="Sign in to create a decision"
        message="Use Google or Apple to save decisions to your account."
        redirectTo="/"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/decisions"
        className="mb-6 inline-block text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        ← Back to decisions
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        New decision
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Capture what you&apos;re deciding and your options. You can add the
        outcome later.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            What are you deciding?
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Whether to take the new job"
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="context"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Context (optional)
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="What's going on? What matters to you here?"
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>

        <div>
          <label
            htmlFor="options"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Options (one per line, optional)
          </label>
          <textarea
            id="options"
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder={"Option A\nOption B\nOption C"}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save decision"}
          </button>
          <Link
            href="/decisions"
            className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
