"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  calculateExpressionNumber,
  calculateLifePath,
  calculatePersonalCycle,
} from "@/lib/numerology";
import { getArchetype } from "@/lib/archetypes";

type Tab = "daily" | "chart" | "consultant";

interface ChartInfo {
  businessName: string;
  birthDate: string;
}

const STORAGE_KEY = "astrawealth_chart_info";

export default function DashboardClient({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("daily");
  const [chartInfo, setChartInfo] = useState<ChartInfo | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChartInfo(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function saveChartInfo(info: ChartInfo) {
    setChartInfo(info);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // ignore
    }
  }

  function resetChartInfo() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setChartInfo(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy-950)" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 2rem",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <p
          style={{
            color: "var(--gold-400)",
            letterSpacing: "0.16em",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          AstraWealth Dashboard
        </p>
        <p style={{ color: "rgba(247,245,240,0.5)", fontSize: 13, margin: 0 }}>
          {email}
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          gap: 4,
          padding: "1.5rem 2rem 0",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {(
          [
            ["daily", "Daily Intelligence"],
            ["chart", "Wealth Chart"],
            ["consultant", "AI Consultant"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: tab === key ? "var(--navy-900)" : "transparent",
              color: tab === key ? "var(--gold-400)" : "rgba(247,245,240,0.55)",
              border:
                "1px solid " + (tab === key ? "var(--gold-400)" : "var(--line)"),
              borderBottom: "none",
              borderRadius: "10px 10px 0 0",
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "2rem",
          background: "var(--navy-900)",
          border: "1px solid var(--line)",
          borderRadius: "0 12px 12px 12px",
          minHeight: 400,
        }}
      >
        {!hydrated ? null : !chartInfo ? (
          <ChartSetupForm onSave={saveChartInfo} />
        ) : (
          <>
            {tab === "daily" && <DailyIntelligence chartInfo={chartInfo} />}
            {tab === "chart" && (
              <WealthChart chartInfo={chartInfo} onReset={resetChartInfo} />
            )}
            {tab === "consultant" && <ConsultantPlaceholder />}
          </>
        )}
      </main>
    </div>
  );
}

function ChartSetupForm({ onSave }: { onSave: (info: ChartInfo) => void }) {
  const [businessName, setBusinessName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !birthDate) return;
    onSave({ businessName, birthDate });
  }

  return (
    <div style={{ maxWidth: 380, margin: "0 auto", textAlign: "center" }}>
      <p
        style={{
          color: "var(--ivory-50)",
          fontFamily: "var(--font-display)",
          fontSize: 20,
          marginBottom: 8,
        }}
      >
        Set up your chart
      </p>
      <p style={{ color: "rgba(247,245,240,0.55)", fontSize: 14, marginBottom: 24 }}>
        Enter your business name and birth date once - your dashboard
        remembers it on this device.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="text"
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={ctaStyle}>
          Save and continue
        </button>
      </form>
    </div>
  );
}

function DailyIntelligence({ chartInfo }: { chartInfo: ChartInfo }) {
  const [reading, setReading] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      try {
        const expr = calculateExpressionNumber(chartInfo.businessName);
        const lp = calculateLifePath(chartInfo.birthDate);
        const pc = calculatePersonalCycle(chartInfo.birthDate);
        const archetype = getArchetype(lp.lifePathNumber);

        const res = await fetch("/api/daily-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: chartInfo.businessName,
            expressionNumber: expr.expressionNumber,
            lifePathNumber: lp.lifePathNumber,
            archetypeName: archetype.name,
            personalYear: pc.personalYear,
            personalMonth: pc.personalMonth,
            personalDay: pc.personalDay,
          }),
        });
        const data = await res.json();
        if (!res.ok || typeof data.reading !== "string") throw new Error("bad");
        if (!cancelled) {
          setReading(data.reading);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [chartInfo]);

  return (
    <div>
      <p
        style={{
          color: "var(--gold-400)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Today's Wealth Vibration
      </p>
      {status === "loading" && (
        <p style={{ color: "rgba(247,245,240,0.55)" }}>
          Reading today's numbers...
        </p>
      )}
      {status === "ready" && reading && (
        <p style={{ color: "var(--ivory-50)", fontSize: 16, lineHeight: 1.7 }}>
          {reading}
        </p>
      )}
      {status === "error" && (
        <p style={{ color: "rgba(247,245,240,0.55)" }}>
          Couldn't load today's reading. Try refreshing.
        </p>
      )}
    </div>
  );
}

function WealthChart({
  chartInfo,
  onReset,
}: {
  chartInfo: ChartInfo;
  onReset: () => void;
}) {
  const expr = calculateExpressionNumber(chartInfo.businessName);
  const lp = calculateLifePath(chartInfo.birthDate);
  const archetype = getArchetype(lp.lifePathNumber);

  return (
    <div>
      <p
        style={{
          color: "var(--gold-400)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Your Wealth Chart
      </p>
      <p style={{ color: "var(--ivory-50)", fontSize: 18, marginBottom: 4 }}>
        Expression Number:{" "}
        <span style={{ color: "var(--gold-400)" }}>
          {expr.expressionNumber}
        </span>
      </p>
      <p style={{ color: "var(--ivory-50)", fontSize: 18, marginBottom: 4 }}>
        Life Path: <span style={{ color: "var(--gold-400)" }}>{lp.lifePathNumber}</span>{" "}
        - {archetype.name}
      </p>
      {expr.wealthFlags.length > 0 && (
        <p style={{ color: "var(--gold-300)", fontSize: 14, marginTop: 12 }}>
          {expr.wealthFlags.map((f) => f.label).join(" | ")}
        </p>
      )}
      <button
        onClick={onReset}
        style={{
          ...ctaStyle,
          marginTop: 24,
          background: "transparent",
          border: "1px solid var(--line)",
          color: "rgba(247,245,240,0.6)",
        }}
      >
        Edit business name / birth date
      </button>
    </div>
  );
}

function ConsultantPlaceholder() {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <p
        style={{
          color: "var(--gold-400)",
          fontFamily: "var(--font-display)",
          fontSize: 22,
          marginBottom: 8,
        }}
      >
        AI Wealth Consultant
      </p>
      <p style={{ color: "rgba(247,245,240,0.55)", fontSize: 14 }}>
        Coming soon - ask hyper-personalized business timing questions based
        on your chart.
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--navy-950)",
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
