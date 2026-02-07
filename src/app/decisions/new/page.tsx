"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { insertDecision } from "@/lib/supabase/decisions";
import { SignInGate } from "@/components/auth-ui";

type DecisionType = "measurement" | "people" | null;

export default function NewDecisionPage() {
  const [decisionType, setDecisionType] = useState<DecisionType>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!cancelled) setUser(u ?? null);
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
        title="Sign in to create a decision"
        message="Decisions are saved to your account. Sign in to create one."
        redirectTo="/"
        next="/decisions/new"
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

const inputClass =
  "mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20";

function MeasurementDecisionForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [decisionTitle, setDecisionTitle] = useState("");
  const [measurementSupport, setMeasurementSupport] = useState("");
  const [problemUnderstandControl, setProblemUnderstandControl] = useState("");
  const [primaryOutcomes, setPrimaryOutcomes] = useState("");
  const [leadingIndicators, setLeadingIndicators] = useState("");
  const [laggingIndicators, setLaggingIndicators] = useState("");
  const [unintendedBehaviors, setUnintendedBehaviors] = useState("");
  const [dataSources, setDataSources] = useState("");
  const [dataQualityLimitations, setDataQualityLimitations] = useState("");
  const [measurementFrequency, setMeasurementFrequency] = useState("");
  const [whoUsesMeasurement, setWhoUsesMeasurement] = useState("");
  const [decisionsNotToMake, setDecisionsNotToMake] = useState("");
  const [successIn612Months, setSuccessIn612Months] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  function getPayload() {
    return {
      decisionTitle: decisionTitle.trim(),
      measurementSupport: measurementSupport.trim(),
      problemUnderstandControl: problemUnderstandControl.trim(),
      primaryOutcomes: primaryOutcomes.trim(),
      leadingIndicators: leadingIndicators.trim(),
      laggingIndicators: laggingIndicators.trim(),
      unintendedBehaviors: unintendedBehaviors.trim(),
      dataSources: dataSources.trim(),
      dataQualityLimitations: dataQualityLimitations.trim(),
      measurementFrequency: measurementFrequency.trim(),
      whoUsesMeasurement: whoUsesMeasurement.trim(),
      decisionsNotToMake: decisionsNotToMake.trim(),
      successIn612Months: successIn612Months.trim(),
    };
  }

  function getContextParts() {
    const p = getPayload();
    return [
      "Decision title: " + (p.decisionTitle || "(not provided)"),
      "What decision(s) will this measurement support?: " + (p.measurementSupport || "(not provided)"),
      "What problem are we trying to understand or control?: " + (p.problemUnderstandControl || "(not provided)"),
      "Primary business outcome(s): " + (p.primaryOutcomes || "(not provided)"),
      "Leading indicators: " + (p.leadingIndicators || "(not provided)"),
      "Lagging indicators: " + (p.laggingIndicators || "(not provided)"),
      "Unintended behaviors?: " + (p.unintendedBehaviors || "(not provided)"),
      "Available data sources: " + (p.dataSources || "(not provided)"),
      "Data quality limitations: " + (p.dataQualityLimitations || "(not provided)"),
      "Measurement frequency required: " + (p.measurementFrequency || "(not provided)"),
      "Who will use this measurement?: " + (p.whoUsesMeasurement || "(not provided)"),
      "Decisions NOT to make with this metric?: " + (p.decisionsNotToMake || "(not provided)"),
      "Success in 6–12 months?: " + (p.successIn612Months || "(not provided)"),
    ];
  }

  async function handleGetAdvice(e: React.FormEvent) {
    e.preventDefault();
    const p = getPayload();
    const required: [string, string][] = [
      [p.decisionTitle, "Decision title"],
      [p.measurementSupport, "What decision(s) will this measurement support?"],
      [p.problemUnderstandControl, "What problem are we trying to understand or control?"],
      [p.primaryOutcomes, "Primary business outcome(s)"],
      [p.unintendedBehaviors, "What behaviors might this measurement unintentionally incentivize?"],
      [p.dataSources, "Available data sources"],
      [p.measurementFrequency, "Measurement frequency required"],
      [p.whoUsesMeasurement, "Who will use this measurement to make decisions?"],
      [p.successIn612Months, "What would success look like in 6–12 months?"],
    ];
    const missing = required.filter(([v]) => !v).map(([, label]) => label);
    if (missing.length > 0) {
      setError("Please complete all required fields: " + missing.slice(0, 3).join(", ") + (missing.length > 3 ? "…" : ""));
      return;
    }
    setError(null);
    setAdvice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/measurement-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
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

  function openTitleModal() {
    setTitleInput(decisionTitle.trim() || "Measurement Decision");
    setSaveError(null);
    setShowTitleModal(true);
  }

  async function handleSaveWithTitle(title: string) {
    setSaveError(null);
    setSaving(true);
    setShowTitleModal(false);
    const contextParts = getContextParts();
    if (advice) contextParts.push("\nRecommendation:\n" + advice);
    const context = contextParts.join("\n\n");

    try {
      const decision = await insertDecision({
        title: title.trim() || decisionTitle.trim() || "Measurement Decision",
        context,
        options: [],
        outcome: undefined,
      });
      try {
        await Promise.race([
          fetch("/api/user-profile", { method: "POST" }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 15000)
          ),
        ]);
      } catch {
        // Profile update is best-effort; still redirect
      }
      router.push(`/decisions/${decision.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
      setShowTitleModal(true);
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
        Complete the sections below to get a professional recommendation.
      </p>

      <form onSubmit={handleGetAdvice} className="mt-6 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Basic framing</h3>
          <div>
            <label htmlFor="decision-title" className="block text-sm font-medium text-[var(--foreground)]">Decision title</label>
            <input id="decision-title" type="text" value={decisionTitle} onChange={(e) => setDecisionTitle(e.target.value)} required className={inputClass} placeholder="e.g. Q1 revenue metrics" />
          </div>
          <div>
            <label htmlFor="measurement-support" className="block text-sm font-medium text-[var(--foreground)]">What decision(s) will this measurement support? <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="measurement-support" value={measurementSupport} onChange={(e) => setMeasurementSupport(e.target.value)} required rows={3} className={inputClass} placeholder="Decisions this measurement will inform" />
          </div>
          <div>
            <label htmlFor="problem-understand" className="block text-sm font-medium text-[var(--foreground)]">What problem are we trying to understand or control? <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="problem-understand" value={problemUnderstandControl} onChange={(e) => setProblemUnderstandControl(e.target.value)} required rows={3} className={inputClass} placeholder="The core problem or uncertainty" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Metrics & outcomes</h3>
          <div>
            <label htmlFor="primary-outcomes" className="block text-sm font-medium text-[var(--foreground)]">Primary business outcome(s) <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="primary-outcomes" value={primaryOutcomes} onChange={(e) => setPrimaryOutcomes(e.target.value)} required rows={3} className={inputClass} placeholder="Key outcomes you want to drive or track" />
          </div>
          <div>
            <label htmlFor="leading-indicators" className="block text-sm font-medium text-[var(--foreground)]">Leading indicators you believe matter today</label>
            <textarea id="leading-indicators" value={leadingIndicators} onChange={(e) => setLeadingIndicators(e.target.value)} rows={2} className={inputClass} placeholder="Early signals or predictors" />
          </div>
          <div>
            <label htmlFor="lagging-indicators" className="block text-sm font-medium text-[var(--foreground)]">Lagging indicators currently used</label>
            <textarea id="lagging-indicators" value={laggingIndicators} onChange={(e) => setLaggingIndicators(e.target.value)} rows={2} className={inputClass} placeholder="Existing outcome or results metrics" />
          </div>
          <div>
            <label htmlFor="unintended-behaviors" className="block text-sm font-medium text-[var(--foreground)]">What behaviors might this measurement unintentionally incentivize? <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="unintended-behaviors" value={unintendedBehaviors} onChange={(e) => setUnintendedBehaviors(e.target.value)} required rows={3} className={inputClass} placeholder="Gaming, tunnel vision, or misaligned incentives" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Data & feasibility</h3>
          <div>
            <label htmlFor="data-sources" className="block text-sm font-medium text-[var(--foreground)]">Available data sources <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="data-sources" value={dataSources} onChange={(e) => setDataSources(e.target.value)} required rows={3} className={inputClass} placeholder="Systems, tools, or data you can use" />
          </div>
          <div>
            <label htmlFor="data-quality" className="block text-sm font-medium text-[var(--foreground)]">Known data quality limitations</label>
            <textarea id="data-quality" value={dataQualityLimitations} onChange={(e) => setDataQualityLimitations(e.target.value)} rows={2} className={inputClass} placeholder="Gaps, noise, or reliability issues" />
          </div>
          <div>
            <label htmlFor="measurement-frequency" className="block text-sm font-medium text-[var(--foreground)]">Measurement frequency required <span className="text-[var(--muted)]">(required)</span></label>
            <input id="measurement-frequency" type="text" value={measurementFrequency} onChange={(e) => setMeasurementFrequency(e.target.value)} required className={inputClass} placeholder="e.g. Daily, weekly, monthly, one-off" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Governance & risk</h3>
          <div>
            <label htmlFor="who-uses" className="block text-sm font-medium text-[var(--foreground)]">Who will use this measurement to make decisions? <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="who-uses" value={whoUsesMeasurement} onChange={(e) => setWhoUsesMeasurement(e.target.value)} required rows={3} className={inputClass} placeholder="Roles, teams, or decision makers" />
          </div>
          <div>
            <label htmlFor="decisions-not-to-make" className="block text-sm font-medium text-[var(--foreground)]">What decisions should NOT be made using this metric?</label>
            <textarea id="decisions-not-to-make" value={decisionsNotToMake} onChange={(e) => setDecisionsNotToMake(e.target.value)} rows={2} className={inputClass} placeholder="Boundaries or misuse to avoid" />
          </div>
          <div>
            <label htmlFor="success-6-12" className="block text-sm font-medium text-[var(--foreground)]">What would &quot;success&quot; look like in 6–12 months? <span className="text-[var(--muted)]">(required)</span></label>
            <textarea id="success-6-12" value={successIn612Months} onChange={(e) => setSuccessIn612Months(e.target.value)} required rows={3} className={inputClass} placeholder="Concrete success criteria or outcomes" />
          </div>
        </section>


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
              Nerdy Executive uses your outcomes to learn and adjust future recommendations.
            </p>
            {saveError && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {saveError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={openTitleModal}
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
          </div>
        </>
      )}

      {showTitleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !saving && setShowTitleModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Title this decision
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Give it a name so you can find it in your list.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveWithTitle(titleInput);
              }}
              className="mt-4 flex flex-col gap-4"
            >
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Q1 metrics, Dashboard rollout"
                autoFocus
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => !saving && setShowTitleModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
