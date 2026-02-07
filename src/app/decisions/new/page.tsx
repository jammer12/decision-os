"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { insertDecision } from "@/lib/supabase/decisions";
import { addDecision } from "@/lib/storage";

type DecisionType = "measurement" | "people" | null;

export default function NewDecisionPage() {
  const [decisionType, setDecisionType] = useState<DecisionType>(null);

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
        Choose the type of decision you&apos;re making.
      </p>

      {decisionType === null ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDecisionType("measurement")}
            className="flex flex-col items-start rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left shadow-sm transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--surface-hover)]"
          >
            <span className="text-lg font-semibold text-[var(--foreground)]">
              Measurement Decision
            </span>
            <span className="mt-2 text-sm text-[var(--muted)]">
              Define metrics, track outcomes, and get recommendations for your measurement approach.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDecisionType("people")}
            className="flex flex-col items-start rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left shadow-sm transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--surface-hover)] opacity-75"
          >
            <span className="text-lg font-semibold text-[var(--foreground)]">
              People Decision
            </span>
            <span className="mt-2 text-sm text-[var(--muted)]">
              Coming soon.
            </span>
          </button>
        </div>
      ) : decisionType === "measurement" ? (
        <MeasurementDecisionForm onBack={() => setDecisionType(null)} />
      ) : null}
    </div>
  );
}

function MeasurementDecisionForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [businessProblem, setBusinessProblem] = useState("");
  const [speed, setSpeed] = useState("");
  const [teamSophistication, setTeamSophistication] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleGetAdvice(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdvice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/measurement-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProblem: businessProblem.trim(),
          speed: speed.trim(),
          teamSophistication: teamSophistication.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setAdvice(data.advice ?? null);
    } catch {
      setError("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    const title = "Measurement Decision";
    const contextParts = [
      "Business problem: " + (businessProblem.trim() || "(not provided)"),
      "How quickly: " + (speed.trim() || "(not provided)"),
      "Team sophistication: " + (teamSophistication.trim() || "(not provided)"),
    ];
    if (advice) contextParts.push("\nRecommendation:\n" + advice);
    const context = contextParts.join("\n\n");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const decision = await insertDecision({
          title,
          context,
          options: [],
          outcome: advice || undefined,
        });
        setSaving(false);
        router.push(`/decisions/${decision.id}`);
        return;
      }
    } catch {
      // Supabase not configured or not signed in — save locally
    }
    try {
      const decision = addDecision({
        title,
        context,
        options: [],
        outcome: advice || undefined,
      });
      router.push(`/decisions/${decision.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Change decision type
      </button>

      <h2 className="text-xl font-semibold text-[var(--foreground)]">
        Measurement Decision
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Answer the questions below to get a professional recommendation.
      </p>

      <form onSubmit={handleGetAdvice} className="mt-6 flex flex-col gap-6">
        <div>
          <label
            htmlFor="business-problem"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Explain your business problem
          </label>
          <textarea
            id="business-problem"
            value={businessProblem}
            onChange={(e) => setBusinessProblem(e.target.value)}
            placeholder="What are you trying to measure or improve? What’s the business context?"
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>

        <div>
          <label
            htmlFor="speed"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            How quickly do you want the measurement result?
          </label>
          <textarea
            id="speed"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            placeholder="e.g. Real-time, weekly, one-off report, within a quarter…"
            rows={2}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>

        <div>
          <label
            htmlFor="team-sophistication"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            How sophisticated is your team for measurement?
          </label>
          <textarea
            id="team-sophistication"
            value={teamSophistication}
            onChange={(e) => setTeamSophistication(e.target.value)}
            placeholder="e.g. New to analytics, use dashboards regularly, have dedicated data team…"
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Getting recommendation…" : "Get recommendation"}
          </button>
          <Link
            href="/decisions"
            className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Cancel
          </Link>
        </div>
      </form>

      {advice && (
        <>
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Recommendation
            </h3>
            <div className="mt-4 whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
              {advice}
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm text-[var(--muted)]">
              Save this decision to access it later from your list.
            </p>
            {saveError && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {saveError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save to my decisions"}
              </button>
              <Link
                href="/decisions"
                className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                Skip
              </Link>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Not signed in?{" "}
              <Link href="/signin" className="text-[var(--accent)] hover:underline">
                Sign in
              </Link>{" "}
              to save to your account (Supabase). Otherwise we’ll save to this device only.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
