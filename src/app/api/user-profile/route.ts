import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type UserProfileAlgo = {
  potentialAgeRange?: string;
  professionalType?: string;
  industry?: string;
  seniority?: string;
  focusAreas?: string;
  profileDescription?: string;
  other?: string;
  [key: string]: string | undefined;
};

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: decisions, error: decisionsError } = await supabase
    .from("decisions")
    .select("id, title, context, outcome, created_at")
    .order("created_at", { ascending: false });

  if (decisionsError) {
    console.error("Supabase decisions error:", decisionsError);
    return NextResponse.json(
      { error: "Failed to load decisions." },
      { status: 500 }
    );
  }

  const count = (decisions ?? []).length;
  if (count === 0) {
    return NextResponse.json({
      profile: null,
      decisionsCount: 0,
      message: "No decisions yet.",
    });
  }

  const { data: existingRow } = await supabase
    .from("user_profiles")
    .select("user_profile_algo, decisions_count")
    .eq("user_id", user.id)
    .single();

  const existing = existingRow as
    | { user_profile_algo: string; decisions_count: number }
    | null;

  if (existing && existing.decisions_count === count) {
    let profile: UserProfileAlgo | null = null;
    try {
      profile = JSON.parse(existing.user_profile_algo || "{}");
    } catch {
      // ignore
    }
    return NextResponse.json({
      profile,
      decisionsCount: count,
      updated: false,
    });
  }

  const raw = (decisions as { title: string; context: string; outcome: string | null }[])
    .map(
      (d, i) =>
        `[${i + 1}] Title: ${d.title}\nContext: ${d.context}\nOutcome: ${d.outcome ?? "(none)"}`
    )
    .join("\n\n");

  const openai = new OpenAI({ apiKey });
  const systemPrompt = `You create a user profile description from their decision cards. Your job is to infer who this person is professionally and demographically based only on the titles, context, and outcomes of their decisions. Do not invent details; only use what is clearly suggested by the text.

Output valid JSON only. No markdown, no code fences, no explanation. Use exactly these keys. Use empty string "" or "unknown" when you cannot infer:
- potentialAgeRange: e.g. "25-34", "35-44", "45-54", or "unknown"
- professionalType: e.g. "data/analytics lead", "product manager", "executive", "operations"
- industry: e.g. "tech", "healthcare", "finance", "retail", "unknown"
- seniority: e.g. "individual contributor", "manager", "director", "VP", "C-level", "unknown"
- focusAreas: comma-separated themes from their decisions (e.g. "measurement, pricing, hiring")
- profileDescription: 2-4 sentence narrative summary of the person (role, focus, seniority, industry) as inferred from the decisions. This is the main profile description.`;

  const userPrompt = `Create a profile from these decisions. Return only the JSON object.\n\nDecisions:\n\n${raw.slice(0, 12000)}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 512,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ?? "{}";
    let profile: UserProfileAlgo = {};
    try {
      profile = JSON.parse(text.replace(/^```json?\s*|\s*```$/g, "")) as UserProfileAlgo;
    } catch {
      profile = { other: text };
    }

    const userProfileAlgo = JSON.stringify(profile);

    const { error: upsertError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: user.id,
          user_profile_algo: userProfileAlgo,
          decisions_count: count,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Supabase upsert user_profiles error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile,
      decisionsCount: count,
      updated: true,
    });
  } catch (err) {
    console.error("OpenAI user profile error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate profile.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
