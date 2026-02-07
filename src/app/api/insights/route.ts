import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const { data: rows, error } = await supabase
    .from("decisions")
    .select("id, title, context, outcome, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to load decisions." },
      { status: 500 }
    );
  }

  const decisions = (rows ?? []) as {
    id: string;
    title: string;
    context: string;
    outcome: string | null;
    created_at: string;
  }[];

  if (decisions.length === 0) {
    return NextResponse.json({
      topicsCount: 0,
      learnings: [],
      insights: "You don't have any decisions yet. Create and save decisions to see insights here.",
      raw: "",
    });
  }

  const raw = decisions
    .map(
      (d, i) =>
        `[Decision ${i + 1}] Title: ${d.title}\nContext: ${d.context}\nOutcome: ${d.outcome ?? "(none)"}\nCreated: ${d.created_at}`
    )
    .join("\n\n---\n\n");

  const openai = new OpenAI({ apiKey });
  const systemPrompt = `You are an executive advisor. Given a user's list of decision cards (title, context, outcome), produce a concise insights summary.

Respond with valid JSON only, no markdown or extra text, in this exact shape:
{
  "topicsCount": number,
  "learnings": string[],
  "insights": string
}

- topicsCount: Count of distinct topics or themes covered across the decisions (e.g. measurement, pricing, hiring).
- learnings: Array of 3–7 short bullets capturing potential learnings or patterns from the recommendations and outcomes (one sentence each).
- insights: A short paragraph (2–4 sentences) summarizing the key insights across all decisions and what the executive might take away.`;

  const userPrompt = `Here are the user's decision cards:\n\n${raw}\n\nProduce the JSON summary as specified.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      "{}";

    let parsed: {
      topicsCount?: number;
      learnings?: string[];
      insights?: string;
    } = {};
    try {
      parsed = JSON.parse(text.replace(/^```json?\s*|\s*```$/g, ""));
    } catch {
      parsed = { insights: text };
    }

    return NextResponse.json({
      topicsCount: parsed.topicsCount ?? 0,
      learnings: Array.isArray(parsed.learnings) ? parsed.learnings : [],
      insights: parsed.insights ?? "Unable to generate insights.",
      raw: raw.slice(0, 2000) + (raw.length > 2000 ? "…" : ""),
    });
  } catch (err) {
    console.error("OpenAI API error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate insights.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
