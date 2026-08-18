const ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

const TRAITS: Record<string, string> = {
  Rat: "Sharp instincts for opportunity - quick to spot an opening before others do.",
  Ox: "Methodical and reliable - builds slowly, but what it builds holds.",
  Tiger: "Bold risk-taker - moves before the competition reacts.",
  Rabbit: "Cautious and diplomatic - avoids unnecessary conflict, protects the downside.",
  Dragon: "Magnetic leadership - takes big swings and commands attention.",
  Snake: "Strategic and private - plays a long, quiet game.",
  Horse: "Restless energy - always chasing the next opportunity.",
  Goat: "Creative and collaborative - thrives with the right team around it.",
  Monkey: "Resourceful and clever - finds unconventional solutions under pressure.",
  Rooster: "Detail-oriented and confident - precise in execution.",
  Dog: "Loyal and principled - protects what's already been built.",
  Pig: "Generous and straightforward - builds trust easily.",
};

export interface ChineseZodiacResult {
  animal: string;
  trait: string;
}

/**
 * Approximate: uses the Gregorian birth year, not the exact Lunar New Year
 * cutoff date. People born in January or early February may technically
 * belong to the previous year's animal under the precise lunar calendar.
 */
export function getChineseZodiac(birthDateISO: string): ChineseZodiacResult {
  const match = /^(\d{4})-\d{2}-\d{2}$/.exec(birthDateISO);
  if (!match) {
    throw new Error("birthDate must be in YYYY-MM-DD format.");
  }
  const year = parseInt(match[1], 10);

  let index = (year - 1900) % 12;
  if (index < 0) index += 12;

  const animal = ANIMALS[index];
  return { animal, trait: TRAITS[animal] };
}
