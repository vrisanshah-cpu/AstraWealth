import { NextRequest, NextResponse } from "next/server";
import { generateFounderReading, type FounderReadingInput } from "@/lib/generateReading";
import { fallbackReading } from "@/lib/fallbackReading";

/**
 * Returns a founder reading. It always returns a reading.
 *
 * The model call is the preferred source, but a visitor who reaches this point
 * has already given us a business name and a birth date and is looking at the
 * single screen that has to earn the upgrade. An outage, a rate limit or a
 * missing key must not turn that screen into an apology, so a handwritten
 * reading is returned instead and `source` records which one they got.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    businessName,
    expressionNumber,
    isMasterNumber,
    wealthFlagLabels,
    lifePathNumber,
    archetypeName,
    archetypeLine,
  } = body ?? {};

  if (
    typeof businessName !== "string" ||
    typeof expressionNumber !== "number" ||
    typeof lifePathNumber !== "number" ||
    typeof archetypeName !== "string" ||
    typeof archetypeLine !== "string"
  ) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const input: FounderReadingInput = {
    businessName,
    expressionNumber,
    isMasterNumber: Boolean(isMasterNumber),
    wealthFlagLabels: Array.isArray(wealthFlagLabels) ? wealthFlagLabels : [],
    lifePathNumber,
    archetypeName,
    archetypeLine,
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Not a 500. Log it loudly - this is a deployment problem, not a visitor
    // problem - and still show the visitor a reading.
    console.error(
      "GEMINI_API_KEY is not set. Serving the handwritten fallback reading."
    );
    return NextResponse.json({ reading: fallbackReading(input), source: "fallback" });
  }

  try {
    const reading = await generateFounderReading(input, apiKey);
    return NextResponse.json({ reading, source: "model" });
  } catch (err) {
    console.error("generateFounderReading failed:", err);
    return NextResponse.json({ reading: fallbackReading(input), source: "fallback" });
  }
}
