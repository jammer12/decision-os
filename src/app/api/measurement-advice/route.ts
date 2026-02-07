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

  let body: Record<string, string | undefined> = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const def = (key: string) => (body[key] ?? "").trim() || "(Not provided)";

  const userContent = `The user is making a measurement decision with the following context:

**Basic framing**
- Decision title: ${def("decisionTitle")}
- What decision(s) will this measurement support?: ${def("measurementSupport")}
- What problem are we trying to understand or control?: ${def("problemUnderstandControl")}

**Metrics & outcomes**
- Primary business outcome(s): ${def("primaryOutcomes")}
- Leading indicators you believe matter today: ${def("leadingIndicators")}
- Lagging indicators currently used: ${def("laggingIndicators")}
- What behaviors might this measurement unintentionally incentivize?: ${def("unintendedBehaviors")}

**Data & feasibility**
- Available data sources: ${def("dataSources")}
- Known data quality limitations: ${def("dataQualityLimitations")}
- Measurement frequency required: ${def("measurementFrequency")}

**Governance & risk**
- Who will use this measurement to make decisions?: ${def("whoUsesMeasurement")}
- What decisions should NOT be made using this metric?: ${def("decisionsNotToMake")}
- What would success look like in 6–12 months?: ${def("successIn612Months")}

Provide your recommendation following the system and template rules.`;

  const systemContent = `You are an executive-grade decision engine.

**System rules (shared across all templates)**
- Output must be concise, structured, and politically safe.
- No filler. No clichés. No AI disclaimers.
- Use only provided information. If something is missing, create an explicit assumption and validation plan.
- Output must match the required format: structured text with clear sections (headings, bullets as needed). No JSON unless a schema is specified.

**Template: Measurement Strategy**
This is a Measurement Strategy decision. Prioritize:
- Causal clarity over correlation
- Avoidance of vanity metrics
- Alignment between metrics and decisions
- Explicit behavioral incentives and risks
- Governance and misuse prevention

Flag metrics that:
- Are proxies rather than outcomes
- Risk Goodhart's Law
- Cannot realistically change decisions

If confidence is overstated, explicitly call it out as a risk.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
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
