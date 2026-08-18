export interface FounderReadingInput {
  businessName: string;
  expressionNumber: number;
  isMasterNumber: boolean;
  wealthFlagLabels: string[];
  lifePathNumber: number;
  archetypeName: string;
  archetypeLine: string;
}

export async function generateFounderReading(
  input: FounderReadingInput,
  apiKey: string
): Promise<string> {
  const prompt = buildPrompt(input);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 220,
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

function buildPrompt(input: FounderReadingInput): string {
  const {
    businessName,
    expressionNumber,
    isMasterNumber,
    wealthFlagLabels,
    lifePathNumber,
    archetypeName,
    archetypeLine,
  } = input;

  const flagLine =
    wealthFlagLabels.length > 0
      ? "This business also carries a rare wealth code: " + wealthFlagLabels.join(", ") + "."
      : "";

  return (
    'You are writing a short "Founder Archetype" reading for a business wealth-numerology app called AstraWealth. ' +
    "The tone is confident, direct, and focused entirely on business and money outcomes -- never romance, relationships, or generic self-help fluff.\n\n" +
    'Business name: "' + businessName + '"\n' +
    "Expression Number: " + expressionNumber + (isMasterNumber ? " (a master number)" : "") + "\n" +
    "Life Path Number: " + lifePathNumber + "\n" +
    'Archetype: "' + archetypeName + '" -- ' + archetypeLine + "\n" +
    flagLine +
    "\n\n" +
    'Write a 3-4 sentence reading addressed directly to the founder ("you"). Focus on: how they make business decisions, where their edge is, and one specific caution or blind spot tied to their numbers. Be specific and punchy, not vague or mystical. Do not use bullet points. Do not mention astrology. Output only the reading text, no preamble.'
  );
}
