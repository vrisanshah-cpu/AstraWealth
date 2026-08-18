"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";

const TRIAL_PLAN_ID = process.env.NEXT_PUBLIC_WHOP_TRIAL_PLAN_ID ?? "plan_TRIAL_ID_HERE";
const ANNUAL_PLAN_ID = process.env.NEXT_PUBLIC_WHOP_ANNUAL_PLAN_ID ?? "plan_ANNUAL_ID_HERE";

const BENEFITS = [
  "Daily Wealth Vibration briefing every morning",
  "AI Wealth Consultant - ask timing questions anytime",
  "Full 12-month Growth Calendar",
  "Complete Wealth Chart across every metric",
];

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
        <p style={{ color: "var(--gold-400)", fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 4px" }}>
          $8.99<span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ivory-50)" }}>/week</span>
        </p>
        <p style={{ color: "var(--gold-300)", fontSize: 13, fontWeight: 600, margin: "0 0 18px" }}>
          3-day free trial - cancel anytime
        </p>
        <BenefitList />
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
          Founder tier - annual
        </p>
        <p style={{ color: "var(--gold-400)", fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 4px" }}>
          $98<span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ivory-50)" }}>/year</span>
        </p>
        <p style={{ color: "var(--gold-300)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>
          7-day free trial - cancel anytime
        </p>
        <p style={{ color: "rgba(247,245,240,0.5)", fontSize: 12, margin: "0 0 18px" }}>
          Save 79% versus paying weekly
        </p>
        <BenefitList />
        <WhopCheckoutEmbed planId={ANNUAL_PLAN_ID} theme="dark" returnUrl="/welcome" />
      </div>
    </div>
  );
}

function BenefitList() {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: "0 0 20px",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {BENEFITS.map((b) => (
        <li
          key={b}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            color: "rgba(247,245,240,0.8)",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <span style={{ color: "var(--gold-400)", fontWeight: 700 }}>+</span>
          {b}
        </li>
      ))}
    </ul>
  );
}
