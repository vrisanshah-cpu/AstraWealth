# AstraWealth setup script
# Run this from INSIDE your astrawealth project folder (where package.json is)
Write-Host 'Setting up AstraWealth project files...' -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path 'components' | Out-Null
New-Item -ItemType Directory -Force -Path 'lib' | Out-Null

Write-Host 'Writing app\layout.tsx...'
@'
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "AstraWealth — Find your wealth signature",
  description:
    "Pythagorean numerology for founders and investors. Free business name and life path reveal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}

'@ | Set-Content -Path 'app\layout.tsx' -Encoding UTF8

Write-Host 'Writing app\page.tsx...'
@'
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return <HeroSection />;
}

'@ | Set-Content -Path 'app\page.tsx' -Encoding UTF8

Write-Host 'Writing app\globals.css...'
@'
:root {
  --navy-950: #0a0f1e;
  --navy-900: #0f1729;
  --navy-800: #16213b;
  --forest-700: #1b4332;
  --forest-500: #2d6a4f;
  --gold-400: #d4af37;
  --gold-300: #e2c465;
  --gold-100: #f4e9c8;
  --ivory-50: #f7f5f0;
  --line: rgba(212, 175, 55, 0.18);

  --font-display: "Fraunces", Georgia, serif;
  --font-sans: "Inter", -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
  background: var(--navy-950);
  color: var(--ivory-50);
  font-family: var(--font-sans);
}

button {
  font-family: inherit;
}

'@ | Set-Content -Path 'app\globals.css' -Encoding UTF8

Write-Host 'Writing components\HeroSection.tsx...'
@'
"use client";

import { useState, FormEvent } from "react";
import {
  calculateExpressionNumber,
  calculateLifePath,
  ExpressionResult,
  LifePathResult,
} from "@/lib/numerology";
import { getArchetype } from "@/lib/archetypes";
import WhopPaywall from "@/components/WhopPaywall";

type Step = "form" | "reveal";

export default function HeroSection() {
  const [step, setStep] = useState<Step>("form");
  const [businessName, setBusinessName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expression, setExpression] = useState<ExpressionResult | null>(null);
  const [lifePath, setLifePath] = useState<LifePathResult | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError("Enter a business name.");
      return;
    }
    if (!birthDate) {
      setError("Enter your date of birth.");
      return;
    }

    try {
      const expr = calculateExpressionNumber(businessName);
      const lp = calculateLifePath(birthDate);
      setExpression(expr);
      setLifePath(lp);
      setStep("reveal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "var(--navy-950)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "6rem 1.5rem 4rem",
      }}
    >
      <p
        style={{
          color: "var(--gold-400)",
          letterSpacing: "0.16em",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        AstraWealth
      </p>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ivory-50)",
          fontSize: "clamp(2rem, 5vw, 3.25rem)",
          textAlign: "center",
          maxWidth: 720,
          lineHeight: 1.15,
          margin: "0 0 1rem",
        }}
      >
        Every fortune has a number.
        <br />
        <span style={{ color: "var(--gold-400)" }}>Find yours.</span>
      </h1>

      <p
        style={{
          color: "rgba(247,245,240,0.65)",
          maxWidth: 480,
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        Your business name and birth date carry a wealth signature. See it in
        under a minute — free.
      </p>

      {step === "form" && (
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Your business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="date"
            aria-label="Date of birth"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={inputStyle}
          />
          {error && (
            <p style={{ color: "#e8a2a2", fontSize: 13, margin: 0 }}>{error}</p>
          )}
          <button type="submit" style={ctaStyle}>
            Reveal my wealth signature
          </button>
          <p
            style={{
              color: "rgba(247,245,240,0.4)",
              fontSize: 12,
              textAlign: "center",
              margin: "4px 0 0",
            }}
          >
            No account needed. Takes 30 seconds.
          </p>
        </form>
      )}

      {step === "reveal" && expression && lifePath && (
        <RevealAndPaywall expression={expression} lifePath={lifePath} />
      )}
    </section>
  );
}

function RevealAndPaywall({
  expression,
  lifePath,
}: {
  expression: ExpressionResult;
  lifePath: LifePathResult;
}) {
  const archetype = getArchetype(lifePath.lifePathNumber);
  const hasWealthFlag = expression.wealthFlags.length > 0;

  return (
    <div style={{ width: "100%", maxWidth: 640, textAlign: "center" }}>
      <NumberSeal
        number={expression.expressionNumber}
        highlighted={hasWealthFlag || expression.isMasterNumber}
      />

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          color: "var(--gold-100)",
          margin: "1.5rem 0 0.25rem",
        }}
      >
        {archetype.name}
      </p>
      <p style={{ color: "rgba(247,245,240,0.6)", margin: "0 0 1.5rem" }}>
        {archetype.line}
      </p>

      {hasWealthFlag && (
        <div
          style={{
            display: "inline-block",
            border: "1px solid var(--gold-400)",
            color: "var(--gold-400)",
            fontSize: 13,
            padding: "6px 14px",
            borderRadius: 999,
            marginBottom: "1.5rem",
          }}
        >
          {expression.wealthFlags.map((f) => f.label).join(" · ")}
        </div>
      )}

      <p
        style={{
          color: "rgba(247,245,240,0.55)",
          fontSize: 14,
          maxWidth: 440,
          margin: "0 auto 0.5rem",
        }}
      >
        Your full Founder Archetype, Growth Calendar, and AI Wealth
        Consultant are still locked.
      </p>

      <WhopPaywall />
    </div>
  );
}

function NumberSeal({ number, highlighted }: { number: number; highlighted: boolean }) {
  return (
    <div
      style={{
        width: 132,
        height: 132,
        margin: "0 auto",
        borderRadius: "50%",
        border: `2px solid ${highlighted ? "var(--gold-400)" : "var(--forest-500)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 40%, var(--navy-800), var(--navy-950))",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 52,
          color: highlighted ? "var(--gold-400)" : "var(--ivory-50)",
        }}
      >
        {number}
      </span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--navy-900)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "14px 16px",
  color: "var(--ivory-50)",
  fontSize: 15,
  outline: "none",
};

const ctaStyle: React.CSSProperties = {
  background: "var(--gold-400)",
  color: "var(--navy-950)",
  border: "none",
  borderRadius: 10,
  padding: "14px 16px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

'@ | Set-Content -Path 'components\HeroSection.tsx' -Encoding UTF8

Write-Host 'Writing components\WhopPaywall.tsx...'
@'
"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";

// Replace with the real plan IDs from `whop plans create` (see setup notes).
const TRIAL_PLAN_ID = process.env.NEXT_PUBLIC_WHOP_TRIAL_PLAN_ID ?? "plan_TRIAL_ID_HERE";
const ANNUAL_PLAN_ID = process.env.NEXT_PUBLIC_WHOP_ANNUAL_PLAN_ID ?? "plan_ANNUAL_ID_HERE";

export default function WhopPaywall() {
  return (
    <div
      style={{
        display: "grid",
        gap: "1.5rem",
        gridTemplateColumns: "1fr",
        maxWidth: 720,
        margin: "3rem auto 0",
      }}
      className="paywall-grid"
    >
      <style>{`
        @media (min-width: 720px) {
          .paywall-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div
        style={{
          background: "var(--navy-900)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "1.75rem",
        }}
      >
        <p style={{ color: "var(--gold-100)", fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 4px" }}>
          Trial access
        </p>
        <p style={{ color: "var(--gold-400)", fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 18px" }}>
          $8.99<span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ivory-50)" }}>/week</span>
        </p>
        <WhopCheckoutEmbed planId={TRIAL_PLAN_ID} theme="dark" returnUrl="/welcome" />
      </div>

      <div
        style={{
          background: "var(--navy-900)",
          border: "1.5px solid var(--gold-400)",
          borderRadius: 16,
          padding: "1.75rem",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: -12,
            right: 20,
            background: "var(--gold-400)",
            color: "var(--navy-950)",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          Best value
        </span>
        <p style={{ color: "var(--gold-100)", fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 4px" }}>
          Founder tier — annual
        </p>
        <p style={{ color: "var(--gold-400)", fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 18px" }}>
          $98<span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ivory-50)" }}>/year</span>
        </p>
        <WhopCheckoutEmbed planId={ANNUAL_PLAN_ID} theme="dark" returnUrl="/welcome" />
      </div>
    </div>
  );
}

'@ | Set-Content -Path 'components\WhopPaywall.tsx' -Encoding UTF8

Write-Host 'Writing lib\numerology.ts...'
@'
/**
 * AstraWealth — Pythagorean Numerology Engine
 * -------------------------------------------
 * Pure, dependency-free calculation logic. No side effects, no API calls —
 * safe to run client-side for the instant "free reveal" moment.
 */

// ---------------------------------------------------------------------------
// Letter → number map (classic Pythagorean system, 1–9 repeating)
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
// "compound number" in the Chaldean tradition — it only ever appears
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
// Business Namer — Expression Number
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
// Founder Archetype — Life Path Number
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
// Investment Timing Cycles — Personal Year / Month / Day
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

'@ | Set-Content -Path 'lib\numerology.ts' -Encoding UTF8

Write-Host 'Writing lib\archetypes.ts...'
@'
export interface Archetype {
  name: string;
  line: string;
}

// Keyed by reduced Life Path number (1-9, plus master numbers 11, 22, 33).
export const ARCHETYPES: Record<number, Archetype> = {
  1: { name: "The Founder", line: "Builds first, asks permission never." },
  2: { name: "The Broker", line: "Wins through alliances others don't see coming." },
  3: { name: "The Storyteller", line: "Turns a pitch deck into a movement." },
  4: { name: "The Architect", line: "Builds the thing that outlasts the trend." },
  5: { name: "The Operator", line: "Moves fast across markets and never gets stuck." },
  6: { name: "The Steward", line: "Grows wealth that takes care of people." },
  7: { name: "The Strategist", line: "Sees three moves ahead of the market." },
  8: { name: "The Executive", line: "Built for scale, boardrooms, and leverage." },
  9: { name: "The Visionary", line: "Plays a longer game than the quarter." },
  11: { name: "The Catalyst", line: "One conversation from you changes a room." },
  22: { name: "The Master Builder", line: "Turns abstract vision into standing infrastructure." },
  33: { name: "The Lord of Wealth", line: "Rare. Built to steward outsized abundance." },
};

export function getArchetype(lifePathNumber: number): Archetype {
  return ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1];
}

'@ | Set-Content -Path 'lib\archetypes.ts' -Encoding UTF8

Write-Host 'Writing .env.local (placeholders - you will edit the values)...'
@'
NEXT_PUBLIC_WHOP_TRIAL_PLAN_ID=plan_XXXXXXXXX
NEXT_PUBLIC_WHOP_ANNUAL_PLAN_ID=plan_XXXXXXXXX
'@ | Set-Content -Path '.env.local' -Encoding UTF8

Write-Host 'Installing @whop/checkout...' -ForegroundColor Cyan
npm install '@whop/checkout'

Write-Host 'Done! Next steps:' -ForegroundColor Green
Write-Host '1. Open .env.local in Notepad and paste in your real plan IDs (replace the XXXXXXXXX placeholders).'
Write-Host '   Run:  notepad .env.local'
Write-Host '2. Run:  npm run dev   and open http://localhost:3000 to test locally (optional).'
Write-Host '3. When ready, push to GitHub and deploy on Vercel (see earlier steps).'