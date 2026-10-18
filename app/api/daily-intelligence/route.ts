import { NextRequest, NextResponse } from "next/server";
import { generateDailyIntelligence } from "@/lib/generateDaily";
import { requireMember } from "@/lib/requireMember";

export async function POST(req: NextRequest) {
  // Paid feature - see lib/requireMember.ts.
  const denied = requireMember(req);
  if (denied) return denied;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured with a Gemini API key." },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    businessName,
    expressionNumber,
    lifePathNumber,
    archetypeName,
    personalYear,
    personalMonth,
    personalDay,
  } = body ?? {};

  if (
    typeof businessName !== "string" ||
    typeof expressionNumber !== "number" ||
    typeof lifePathNumber !== "number" ||
    typeof archetypeName !== "string" ||
    typeof personalYear !== "number" ||
    typeof personalMonth !== "number" ||
    typeof personalDay !== "number"
  ) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  try {
    const reading = await generateDailyIntelligence(
      {
        businessName,
        expressionNumber,
        lifePathNumber,
        archetypeName,
        personalYear,
        personalMonth,
        personalDay,
      },
      apiKey
    );

    return NextResponse.json({ reading });
  } catch (err) {
    console.error("generateDailyIntelligence failed:", err);
    return NextResponse.json(
      { error: "Failed to generate daily briefing." },
      { status: 502 }
    );
  }
}
