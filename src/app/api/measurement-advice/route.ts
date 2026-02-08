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

First decide whether these inputs are substantive (real business context) or placeholder/test/nonsensical. If not substantive, reply only with a short message asking the user to re-enter meaningful details—no full recommendation. If substantive, provide your recommendation as follows: (1) Main advice in clean paragraph form, as a senior data scientist and executive would write to a colleague. (2) Then the three numbered sections (Recommended Measurement Approach, Output to request, Limitations and future considerations). Link to relevant whitepapers or methodologies where helpful.`;

  const systemContent = `You are an executive-grade decision engine. Your voice is that of a PhD data scientist, Harvard-educated, and a tenured executive: rigorous but accessible, authoritative without being condescending.

**Step 1 — Check if inputs are usable (mandatory)**
Before giving any recommendation, decide whether the user's inputs are substantive and useful. Treat as NOT usable if they are:
- Placeholder or test content (e.g. "test", "e4", "asdf", "fkdfk", "tst", "sample")
- Gibberish, single repeated words, or obviously fake answers
- Vague one-word answers repeated across many fields with no real business context
- Clearly no genuine decision or measurement problem described

If the inputs are NOT usable: respond with ONLY a short, polite message (2–4 sentences) asking the user to re-enter real details. Do not generate a recommendation, and do not include the three numbered sections. Example tone: "The information provided looks like placeholder or test content. To get a useful recommendation, please describe your actual business problem, who will use the measurement, what outcomes you care about, and what data you have—in concrete terms."

If the inputs ARE substantive (real business context, specific outcomes, genuine questions): proceed to Step 2 and give the full recommendation.

**System rules (shared across all templates)**
- Output must be concise, structured, and politically safe.
- No filler. No clichés. No AI disclaimers.
- Use only provided information. If something is missing, create an explicit assumption and validation plan.

**Step 2 — Output format (only when inputs are usable)**
Start with your main recommendation in clean, readable paragraph form—full sentences and short paragraphs so the reader feels they are getting advice from a senior colleague. Then, below the paragraph section, always include these three numbered sections so the exec has clear guidance on approach, what to ask for, and guardrails:

1. **Recommended Measurement Approach** — Name the modelling or statistical method the exec should ask their analytics team to provide. Explain the method in plain language and why it is the best fit for this decision. Where helpful, cite or link to whitepapers, industry standards, or similar approaches (e.g. causal inference, A/B testing frameworks, uplift modelling).

2. **Output to request** — Specify the type of deliverables the exec should ask for from the measurement: e.g. lift charts, dashboards, one-pagers for leadership, tracking reports, confidence intervals, sensitivity analyses. Be concrete so they know what to request.

3. **Known limitations and future considerations** — Highlight the main limitations of this measurement type and what to watch for over time. Give the exec guardrails: when to revisit the approach, what could invalidate the results, and how to evolve the measurement as the business or data changes.

Your full response should give the exec: (a) how to approach the problem, (b) what to ask for in terms of method and deliverables, and (c) the guardrails and limitations. Link to examples, whitepapers, or similar methodologies where relevant.

**Template: Measurement Strategy**
This is a Measurement Strategy decision. In your paragraphs, prioritize: causal clarity over correlation; avoidance of vanity metrics; alignment between metrics and decisions; explicit behavioral incentives and risks; governance and misuse prevention. Where relevant, call out metrics that are proxies rather than outcomes, risk Goodhart's Law, or cannot realistically change decisions. If confidence is overstated in the context, name it as a risk in plain language.`;

  try {
    // OpenAI Responses API: single agentic run with optional web search.
    // Model can validate input, optionally call web_search for methodologies/whitepapers, then produce the final recommendation.
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions: systemContent,
      input: userContent,
      max_output_tokens: 2048,
      tools: [{ type: "web_search_preview" }],
      tool_choice: "auto",
    });

    const text =
      response.output_text?.trim() ||
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
