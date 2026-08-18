/**
 * AstraWealth â€” Pythagorean Numerology Engine
 * -------------------------------------------
 * Pure, dependency-free calculation logic. No side effects, no API calls â€”
 * safe to run client-side for the instant "free reveal" moment.
 */

// ---------------------------------------------------------------------------
// Letter â†’ number map (classic Pythagorean system, 1â€“9 repeating)
// ---------------------------------------------------------------------------
const LETTER_VALUES: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

// Numbers that must NOT be collapsed further during digit reduction.
const MASTER_NUMBERS = [11, 22, 33];

// Wealth codes AstraWealth calls out specifically in the UI/copy.
// 33 is treated as a master number stop (see reduceNumber). 51 is a
// "compound number" in the Chaldean tradition â€” it only ever appears
// as an intermediate sum before final reduction, so it's detected
// separately (see compoundNumber tracking below).
export const WEALTH_CODES = {
  LORD_OF_WEALTH: 33,
  ROYAL_STAR_OF_FORTUNE: 51,
} as const;

export interface WealthFlag {
  code: number;
  label: string;
  description: string;
}

export interface ExpressionResult {
  input: string;
  expressionNumber: number;
  compoundNumber: number; // the last two-digit (or higher) sum before final reduction
  isMasterNumber: boolean;
  wealthFlags: WealthFlag[];
  breakdown: { letter: string; value: number }[];
}

export interface LifePathResult {
  birthDate: string; // ISO yyyy-mm-dd as provided
  lifePathNumber: number;
  isMasterNumber: boolean;
  breakdown: { part: string; sum: number }[];
}

export interface PersonalCycle {
  personalYear: number;
  personalMonth: number;
  personalDay: number;
}

// ---------------------------------------------------------------------------
// Core digit-reduction helper
// ---------------------------------------------------------------------------

/**
 * Reduces a positive integer to a single digit, unless it lands on a
 * master number (11, 22, 33) at any point in the reduction chain, in
 * which case reduction stops there.
 */
function reduceNumber(value: number): number {
  let n = Math.abs(Math.trunc(value));
  if (n === 0) return 0;

  while (n > 9 && !MASTER_NUMBERS.includes(n)) {
    n = String(n)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n;
}

// ---------------------------------------------------------------------------
// Business Namer â€” Expression Number
// ---------------------------------------------------------------------------

export function calculateExpressionNumber(businessName: string): ExpressionResult {
  const cleaned = businessName.toUpperCase().replace(/[^A-Z]/g, "");

  if (!cleaned) {
    throw new Error("Business name must contain at least one letter.");
  }

  const breakdown = cleaned.split("").map((letter) => ({
    letter,
    value: LETTER_VALUES[letter] ?? 0,
  }));

  const rawSum = breakdown.reduce((sum, { value }) => sum + value, 0);

  // Track the compound number: the first sum with more than one digit,
  // captured before any further reduction. This is where 51 shows up.
  let compoundNumber = rawSum;
  let current = rawSum;
  while (current > 9 && !MASTER_NUMBERS.includes(current)) {
    compoundNumber = current;
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  const expressionNumber = reduceNumber(rawSum);

  const wealthFlags: WealthFlag[] = [];

  if (expressionNumber === WEALTH_CODES.LORD_OF_WEALTH) {
    wealthFlags.push({
      code: 33,
      label: "Lord of Wealth",
      description:
        "A rare master number associated with large-scale abundance and long-term financial stewardship.",
    });
  }

  if (compoundNumber === WEALTH_CODES.ROYAL_STAR_OF_FORTUNE) {
    wealthFlags.push({
      code: 51,
      label: "Royal Star of Fortune",
      description:
        "A compound number tied to leadership, rapid recognition, and favorable timing in business ventures.",
    });
  }

  return {
    input: businessName,
    expressionNumber,
    compoundNumber,
    isMasterNumber: MASTER_NUMBERS.includes(expressionNumber),
    wealthFlags,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Founder Archetype â€” Life Path Number
// ---------------------------------------------------------------------------

/**
 * @param birthDate ISO-formatted date string, e.g. "1990-07-14"
 */
export function calculateLifePath(birthDate: string): LifePathResult {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) {
    throw new Error("birthDate must be in YYYY-MM-DD format.");
  }
  const [, year, month, day] = match;

  const sumDigits = (str: string) =>
    str.split("").reduce((sum, d) => sum + Number(d), 0);

  const yearReduced = reduceNumber(sumDigits(year));
  const monthReduced = reduceNumber(sumDigits(month));
  const dayReduced = reduceNumber(sumDigits(day));

  const lifePathNumber = reduceNumber(yearReduced + monthReduced + dayReduced);

  return {
    birthDate,
    lifePathNumber,
    isMasterNumber: MASTER_NUMBERS.includes(lifePathNumber),
    breakdown: [
      { part: "year", sum: yearReduced },
      { part: "month", sum: monthReduced },
      { part: "day", sum: dayReduced },
    ],
  };
}

// ---------------------------------------------------------------------------
// Investment Timing Cycles â€” Personal Year / Month / Day
// ---------------------------------------------------------------------------

/**
 * @param birthDate ISO-formatted date string, e.g. "1990-07-14"
 * @param targetDate Defaults to today. ISO-formatted date string.
 */
export function calculatePersonalCycle(
  birthDate: string,
  targetDate: string = new Date().toISOString().slice(0, 10)
): PersonalCycle {
  const birth = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  const target = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
  if (!birth || !target) {
    throw new Error("Dates must be in YYYY-MM-DD format.");
  }

  const [, , birthMonth, birthDay] = birth;
  const [, targetYear, targetMonth, targetDay] = target;

  const sumDigits = (str: string) =>
    str.split("").reduce((sum, d) => sum + Number(d), 0);

  const personalYear = reduceNumber(
    sumDigits(birthMonth) + sumDigits(birthDay) + sumDigits(targetYear)
  );
  const personalMonth = reduceNumber(personalYear + sumDigits(targetMonth));
  const personalDay = reduceNumber(personalMonth + sumDigits(targetDay));

  return { personalYear, personalMonth, personalDay };
}

// ---------------------------------------------------------------------------
// Convenience: build a full free "Founder Archetype" snapshot in one call
// ---------------------------------------------------------------------------

export function generateFreeSnapshot(businessName: string, birthDate: string) {
  return {
    expression: calculateExpressionNumber(businessName),
    lifePath: calculateLifePath(birthDate),
    todayCycle: calculatePersonalCycle(birthDate),
  };
}

