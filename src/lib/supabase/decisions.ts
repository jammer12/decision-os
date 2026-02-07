"use client";

import { createClient } from "./client";
import type { Decision } from "../types";

export type DecisionRow = {
  id: string;
  user_id: string;
  title: string;
  context: string;
  options: string[];
  outcome: string | null;
  created_at: string;
  decided_at: string | null;
};

function rowToDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    title: row.title,
    context: row.context,
    options: row.options ?? [],
    outcome: row.outcome ?? undefined,
    createdAt: row.created_at,
    decidedAt: row.decided_at ?? undefined,
  };
}

export async function fetchDecisions(): Promise<Decision[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToDecision);
}

export async function fetchDecision(id: string): Promise<Decision | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToDecision(data) : null;
}

export async function insertDecision(
  decision: Omit<Decision, "id" | "createdAt">
): Promise<Decision> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      title: decision.title,
      context: decision.context,
      options: decision.options,
      outcome: decision.outcome ?? null,
      decided_at: decision.decidedAt ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToDecision(data);
}

export async function updateDecision(
  id: string,
  updates: Partial<Pick<Decision, "title" | "context" | "options" | "outcome" | "decidedAt">>
): Promise<void> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.context !== undefined) row.context = updates.context;
  if (updates.options !== undefined) row.options = updates.options;
  if (updates.outcome !== undefined) row.outcome = updates.outcome;
  if (updates.decidedAt !== undefined) row.decided_at = updates.decidedAt;

  const { error } = await supabase.from("decisions").update(row).eq("id", id);
  if (error) throw error;
}

export async function removeDecision(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) throw error;
}
