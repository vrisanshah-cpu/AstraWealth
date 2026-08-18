export interface MonthlyReportInput {
  businessName: string;
  expressionNumber: number;
  lifePathNumber: number;
  archetypeName: string;
  personalYear: number;
  personalMonth: number;
  chineseZodiacAnimal: string;
  customRequest: string;
}

export async function generateMonthlyReport(
  input: MonthlyReportInput,
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
        maxOutputTokens: 450,
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

function buildPrompt(input: MonthlyReportInput): string {
  const {
    businessName,
    expressionNumber,
    lifePathNumber,
    archetypeName,
    personalYear,
    personalMonth,
    chineseZodiacAnimal,
    customRequest,
  } = input;

  const requestLine = customRequest.trim()
    ? "The founder specifically wants this report to address: " + customRequest.trim()
    : "The founder did not specify particular topics - cover general business timing for the month.";

  return (
    "You are writing a monthly business intelligence report for a founder, for a wealth-numerology app called AstraWealth. " +
    "Tone: confident, specific, practical - like a sharp advisor's monthly briefing. Never romance, never generic wellness advice, never guaranteed outcomes.\n\n" +
    'Business: "' + businessName + '"\n' +
    "Expression Number: " + expressionNumber + "\n" +
    "Life Path / Archetype: " + lifePathNumber + " (" + archetypeName + ")\n" +
    "Personal Year: " + personalYear + "\n" +
    "Personal Month: " + personalMonth + "\n" +
    "Chinese Zodiac: " + chineseZodiacAnimal + "\n\n" +
    requestLine +
    "\n\n" +
    "Write a 5-7 sentence monthly report. Open with the overall theme of the month, then directly address the founder's specific request(s) if given, and close with one concrete recommendation. No bullet points, no headers, no preamble - just the report text."
  );
}
