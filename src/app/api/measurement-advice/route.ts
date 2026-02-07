import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 503 }
    );
  }

  const openai = new OpenAI({ apiKey });

  let body: {
    businessProblem?: string;
    speed?: string;
    teamSophistication?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { businessProblem = "", speed = "", teamSophistication = "" } = body;

  const userContent = `The user is making a measurement decision with the following context:

**Business problem:** ${businessProblem.trim() || "(Not provided)"}

**How quickly they want the measurement result:** ${speed.trim() || "(Not provided)"}

**How sophisticated their team is for measurement:** ${teamSophistication.trim() || "(Not provided)"}

Provide a professional, concise recommendation. Focus on practical next steps, suggested metrics or approaches where relevant, and any caveats based on their timeline and team sophistication. Use clear paragraphs and avoid jargon unless you briefly define it.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert advisor on measurement and analytics decisions. You give clear, professional, actionable advice. Your tone is supportive and direct.",
        },
        { role: "user", content: userContent },
      ],
      max_tokens: 1024,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      "No response generated. Please try again.";

    return NextResponse.json({ advice: text });
  } catch (err) {
    console.error("OpenAI API error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to get recommendation.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
