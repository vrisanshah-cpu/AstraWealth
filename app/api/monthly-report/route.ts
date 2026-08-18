import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyReport } from "@/lib/generateMonthlyReport";

const MAX_REQUEST_LENGTH = 500;

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
    lifePathNumber,
    archetypeName,
    personalYear,
    personalMonth,
    chineseZodiacAnimal,
    customRequest,
  } = body ?? {};

  if (
    typeof businessName !== "string" ||
    typeof expressionNumber !== "number" ||
    typeof lifePathNumber !== "number" ||
    typeof archetypeName !== "string" ||
    typeof personalYear !== "number" ||
    typeof personalMonth !== "number" ||
    typeof chineseZodiacAnimal !== "string"
  ) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const safeRequest =
    typeof customRequest === "string" ? customRequest.slice(0, MAX_REQUEST_LENGTH) : "";

  try {
    const report = await generateMonthlyReport(
      {
        businessName,
        expressionNumber,
        lifePathNumber,
        archetypeName,
        personalYear,
        personalMonth,
        chineseZodiacAnimal,
        customRequest: safeRequest,
      },
      apiKey
    );

    return NextResponse.json({ report });
  } catch (err) {
    console.error("generateMonthlyReport failed:", err);
    return NextResponse.json(
      { error: "Failed to generate monthly report." },
      { status: 502 }
    );
  }
}
