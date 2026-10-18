import { NextRequest, NextResponse } from "next/server";
import { generateConsultantReply, ConsultantMessage } from "@/lib/generateConsultant";
import { requireMember } from "@/lib/requireMember";

const MAX_MESSAGE_LENGTH = 500;

export async function POST(req: NextRequest) {
  // Paid feature. Without this check anyone could call it with curl and spend
  // the account's Gemini budget.
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

  const { context, history, message } = body ?? {};

  if (
    !context ||
    typeof context.businessName !== "string" ||
    typeof context.expressionNumber !== "number" ||
    typeof context.lifePathNumber !== "number" ||
    typeof context.archetypeName !== "string" ||
    typeof context.personalYear !== "number" ||
    typeof context.personalMonth !== "number" ||
    typeof context.personalDay !== "number"
  ) {
    return NextResponse.json({ error: "Missing or invalid context." }, { status: 400 });
  }

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Message is too long. Keep it under " + MAX_MESSAGE_LENGTH + " characters." },
      { status: 400 }
    );
  }

  const safeHistory: ConsultantMessage[] = Array.isArray(history)
    ? history
        .filter(
          (m: any) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.text === "string"
        )
        .slice(-6)
    : [];

  try {
    const reply = await generateConsultantReply(
      context,
      [...safeHistory, { role: "user", text: message.trim() }],
      apiKey
    );

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("generateConsultantReply failed:", err);
    return NextResponse.json(
      { error: "Failed to generate a reply." },
      { status: 502 }
    );
  }
}
