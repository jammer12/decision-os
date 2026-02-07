"use client";

import Link from "next/link";
import type { Decision } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

export function DecisionCard({
  decision,
  onDelete,
  isDeleting,
}: {
  decision: Decision;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}) {
  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting || !onDelete) return;
    if (confirm("Delete this decision? This can't be undone.")) {
      onDelete(decision.id);
    }
  }

  return (
    <div className="flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--surface-hover)]">
      <Link
        href={`/decisions/${decision.id}`}
        className="min-w-0 flex-1"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[var(--foreground)] truncate">
              {decision.title || "Untitled decision"}
            </h2>
            {decision.context && (
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                {decision.context}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          {formatDate(decision.createdAt)}
        </p>
      </Link>
      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: "var(--surface-hover)",
            color: "var(--muted)",
          }}
          aria-label="Delete decision"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      )}
    </div>
  );
}
