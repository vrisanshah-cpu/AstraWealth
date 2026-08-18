export interface ConsultantMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ConsultantContext {
  businessName: string;
  expressionNumber: number;
  lifePathNumber: number;
  archetypeName: string;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
}

export async function generateConsultantReply(
  context: ConsultantContext,
  history: ConsultantMessage[],
  apiKey: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const trimmedHistory = history.slice(-6);

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [{ text: "Understood. I'm ready to answer as the AstraWealth AI Wealth Consultant." }],
    },
    ...trimmedHistory.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
  ];

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 200,
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Gemini request failed: " + res.status);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== "string") {
    throw new Error("Gemini response missing text.");
  }

  return text.trim();
}

function buildSystemPrompt(context: ConsultantContext): string {
  const {
    businessName,
    expressionNumber,
    lifePathNumber,
    archetypeName,
    personalYear,
    personalMonth,
    personalDay,
  } = context;

  return (
    "You are the AstraWealth AI Wealth Consultant, a business-timing advisor for a founder. " +
    "You answer specific questions about business decisions, deal timing, negotiation, hiring, and risk-taking, using the founder's numerology profile as your lens. " +
    "Never discuss romance or generic wellness. Never give real financial, legal, tax, or investment advice, and never guarantee outcomes -- keep answers framed as perspective, not instructions to act on blindly. " +
    "Keep every answer to 2-4 sentences, direct and specific, no bullet points, no long preambles.\n\n" +
    'Founder\'s business: "' + businessName + '"\n' +
    "Expression Number: " + expressionNumber + "\n" +
    "Life Path / Archetype: " + lifePathNumber + " (" + archetypeName + ")\n" +
    "Current Personal Year: " + personalYear + "\n" +
    "Current Personal Month: " + personalMonth + "\n" +
    "Current Personal Day: " + personalDay
  );
}
