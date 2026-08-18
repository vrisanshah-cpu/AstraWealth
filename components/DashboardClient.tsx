"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  calculateExpressionNumber,
  calculateLifePath,
  calculatePersonalCycle,
} from "@/lib/numerology";
import { getArchetype } from "@/lib/archetypes";
import { CORE_NUMBER_MEANINGS, CYCLE_MEANINGS } from "@/lib/numerologyMeanings";

type Tab = "daily" | "chart" | "consultant";

interface ChartInfo {
  businessName: string;
  birthDate: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const STORAGE_KEY = "astrawealth_chart_info";
const MAX_CHAT_MESSAGES = 15;

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
            {tab === "consultant" && <ConsultantChat chartInfo={chartInfo} />}
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
  const pc = calculatePersonalCycle(chartInfo.birthDate);
  const archetype = getArchetype(lp.lifePathNumber);

  return (
    <div>
      <p
        style={{
          color: "var(--gold-400)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Your Wealth Chart
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatBlock
          label="Expression Number"
          value={String(expr.expressionNumber)}
          meaning={CORE_NUMBER_MEANINGS[expr.expressionNumber]}
        />
        <StatBlock
          label="Life Path Number"
          value={String(lp.lifePathNumber) + (lp.isMasterNumber ? " (master)" : "")}
          meaning={CORE_NUMBER_MEANINGS[lp.lifePathNumber]}
        />
        <StatBlock
          label="Personal Year"
          value={String(pc.personalYear)}
          meaning={CYCLE_MEANINGS[pc.personalYear]}
        />
        <StatBlock
          label="Personal Month"
          value={String(pc.personalMonth)}
          meaning={CYCLE_MEANINGS[pc.personalMonth]}
        />
      </div>

      <div
        style={{
          background: "var(--navy-950)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "1.25rem",
          marginBottom: 16,
        }}
      >
        <p
          style={{
            color: "var(--gold-100)",
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: "0 0 4px",
          }}
        >
          {archetype.name}
        </p>
        <p style={{ color: "rgba(247,245,240,0.65)", fontSize: 14, margin: 0 }}>
          {archetype.line}
        </p>
      </div>

      {expr.wealthFlags.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {expr.wealthFlags.map((f) => (
            <div
              key={f.code}
              style={{
                background: "var(--navy-950)",
                border: "1px solid var(--gold-400)",
                borderRadius: 12,
                padding: "1rem 1.25rem",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  color: "var(--gold-400)",
                  fontSize: 15,
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                {f.label} (#{f.code})
              </p>
              <p style={{ color: "rgba(247,245,240,0.7)", fontSize: 13, margin: 0 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onReset}
        style={{
          ...ctaStyle,
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

function StatBlock({
  label,
  value,
  meaning,
}: {
  label: string;
  value: string;
  meaning?: string;
}) {
  return (
    <div
      style={{
        background: "var(--navy-950)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          color: "var(--gold-400)",
          fontFamily: "var(--font-display)",
          fontSize: 22,
          margin: "0 0 2px",
        }}
      >
        {value}
      </p>
      <p style={{ color: "rgba(247,245,240,0.5)", fontSize: 11, margin: "0 0 6px" }}>
        {label}
      </p>
      {meaning && (
        <p style={{ color: "rgba(247,245,240,0.65)", fontSize: 12, lineHeight: 1.4, margin: 0 }}>
          {meaning}
        </p>
      )}
    </div>
  );
}

function ConsultantChat({ chartInfo }: { chartInfo: ChartInfo }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const limitReached = messages.filter((m) => m.role === "user").length >= MAX_CHAT_MESSAGES;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending || limitReached) return;

    setError(null);
    const nextMessages = [...messages, { role: "user" as const, text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const expr = calculateExpressionNumber(chartInfo.businessName);
      const lp = calculateLifePath(chartInfo.birthDate);
      const pc = calculatePersonalCycle(chartInfo.birthDate);
      const archetype = getArchetype(lp.lifePathNumber);

      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(0, -1),
          context: {
            businessName: chartInfo.businessName,
            expressionNumber: expr.expressionNumber,
            lifePathNumber: lp.lifePathNumber,
            archetypeName: archetype.name,
            personalYear: pc.personalYear,
            personalMonth: pc.personalMonth,
            personalDay: pc.personalDay,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || typeof data.reply !== "string") {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setError("Couldn't get a reply. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
      <p
        style={{
          color: "var(--gold-400)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        AI Wealth Consultant
      </p>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingRight: 4,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "rgba(247,245,240,0.5)", fontSize: 14 }}>
            Ask a specific business timing question - e.g. "Is this a good
            week to close a deal?"
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.role === "user" ? "var(--gold-400)" : "var(--navy-800)",
              color: m.role === "user" ? "var(--navy-950)" : "var(--ivory-50)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <div
            style={{
              alignSelf: "flex-start",
              color: "rgba(247,245,240,0.5)",
              fontSize: 13,
            }}
          >
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p style={{ color: "#e8a2a2", fontSize: 13, marginBottom: 8 }}>{error}</p>
      )}

      {limitReached ? (
        <p style={{ color: "rgba(247,245,240,0.5)", fontSize: 13 }}>
          You've reached this session's question limit. Refresh to start a
          new session.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            maxLength={500}
            placeholder="Ask about timing, deals, hiring..."
            onChange={(e) => setInput(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            style={{
              ...ctaStyle,
              opacity: sending || !input.trim() ? 0.6 : 1,
              cursor: sending || !input.trim() ? "default" : "pointer",
            }}
          >
            Send
          </button>
        </form>
      )}
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
