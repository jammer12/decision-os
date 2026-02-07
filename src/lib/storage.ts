"use client";

import type { Decision } from "./types";

const STORAGE_KEY = "decision-os-decisions";

export function getDecisions(): Decision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Decision[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDecisions(decisions: Decision[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
  } catch {
    // ignore
  }
}

export function addDecision(decision: Omit<Decision, "id" | "createdAt">): Decision {
  const decisions = getDecisions();
  const newDecision: Decision = {
    ...decision,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveDecisions([newDecision, ...decisions]);
  return newDecision;
}

export function updateDecision(id: string, updates: Partial<Decision>): void {
  const decisions = getDecisions();
  const next = decisions.map((d) =>
    d.id === id ? { ...d, ...updates } : d
  );
  saveDecisions(next);
}

export function deleteDecision(id: string): void {
  saveDecisions(getDecisions().filter((d) => d.id !== id));
}
