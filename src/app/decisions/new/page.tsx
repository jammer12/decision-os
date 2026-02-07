"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDecision } from "@/lib/storage";

export default function NewDecisionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const options = optionsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const decision = addDecision({
      title: title.trim() || "Untitled decision",
      context: context.trim(),
      options,
    });
    router.push(`/decisions/${decision.id}`);
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
