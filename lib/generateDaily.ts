export interface DailyIntelligenceInput {
  businessName: string;
  expressionNumber: number;
  lifePathNumber: number;
  archetypeName: string;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
}

export async function generateDailyIntelligence(
  input: DailyIntelligenceInput,
  apiKey: string
): Promise<string> {
  const prompt = buildPrompt(input);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" +
    apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 260,
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

function buildPrompt(input: DailyIntelligenceInput): string {
  const {
    businessName,
    expressionNumber,
    lifePathNumber,
    archetypeName,
    personalYear,
    personalMonth,
    personalDay,
  } = input;

  return (
    'You are writing a short daily business-timing update for a founder using a wealth-numerology app called AstraWealth. ' +
    "The tone is confident and practical -- like a sharp advisor giving a morning briefing, not a mystic. Focus on business decisions, deal timing, negotiation, and risk-taking -- never romance or generic wellness advice.\n\n" +
    'Business: "' + businessName + '"\n' +
    "Expression Number: " + expressionNumber + "\n" +
    "Life Path / Archetype: " + lifePathNumber + " (" + archetypeName + ")\n" +
    "Today's Personal Year: " + personalYear + "\n" +
    "Today's Personal Month: " + personalMonth + "\n" +
    "Today's Personal Day: " + personalDay + "\n\n" +
    'Write a 3-4 sentence "Today\'s Wealth Vibration" briefing addressed directly to the founder ("you"). Say whether today favors bold moves, patience, negotiation, or caution, and give one concrete type of decision to lean into or avoid today. Be specific and punchy. Do not use bullet points. Do not mention astrology. Output only the briefing text, no preamble.'
  );
}
