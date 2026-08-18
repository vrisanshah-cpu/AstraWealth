import { NextRequest, NextResponse } from "next/server";
import { generateFounderReading } from "@/lib/generateReading";

export async function POST(req: NextRequest) {
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

  try {
    const reading = await generateFounderReading(
      {
        businessName,
        expressionNumber,
        isMasterNumber: Boolean(isMasterNumber),
        wealthFlagLabels: Array.isArray(wealthFlagLabels) ? wealthFlagLabels : [],
        lifePathNumber,
        archetypeName,
        archetypeLine,
      },
      apiKey
    );

    return NextResponse.json({ reading });
  } catch (err) {
    console.error("generateFounderReading failed:", err);
    return NextResponse.json(
      { error: "Failed to generate reading." },
      { status: 502 }
    );
  }
}
