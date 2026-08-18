"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/verify-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
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
        justifyContent: "center",
        padding: "2rem 1.5rem",
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
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          textAlign: "center",
          maxWidth: 520,
          margin: "0 0 1rem",
        }}
      >
        Welcome to the Founder tier.
      </h1>
      <p
        style={{
          color: "rgba(247,245,240,0.6)",
          textAlign: "center",
          maxWidth: 420,
          marginBottom: "2rem",
        }}
      >
        Enter the email you used at checkout to unlock your dashboard.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            background: "var(--navy-900)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "14px 16px",
            color: "var(--ivory-50)",
            fontSize: 15,
            outline: "none",
          }}
        />
        {status === "error" && (
          <p style={{ color: "#e8a2a2", fontSize: 13, margin: 0 }}>{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            background: "var(--gold-400)",
            color: "var(--navy-950)",
            border: "none",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 15,
            fontWeight: 600,
            cursor: status === "loading" ? "default" : "pointer",
            opacity: status === "loading" ? 0.7 : 1,
          }}
        >
          {status === "loading" ? "Checking..." : "Unlock dashboard"}
        </button>
      </form>
    </section>
  );
}
