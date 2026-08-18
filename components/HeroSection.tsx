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
        under a minute â€” free.
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
          {expression.wealthFlags.map((f) => f.label).join(" Â· ")}
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

