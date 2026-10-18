"use client";

import { useRef, useState } from "react";

interface ShareCardProps {
  businessName: string;
  expressionNumber: number;
  archetypeName: string;
  chineseZodiacAnimal: string;
  wealthFlagLabel?: string;
}

const SIZE = 1080;
const DISPLAY = '"Fraunces", Georgia, "Times New Roman", serif';
const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';

const GOLD = "#d4af37";
const GOLD_PALE = "#f4e9c8";
const IVORY = "#f7f5f0";

export default function ShareCard(props: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    // Background
    const gradient = ctx.createRadialGradient(
      SIZE / 2, SIZE * 0.38, 60,
      SIZE / 2, SIZE * 0.38, SIZE
    );
    gradient.addColorStop(0, "#16213b");
    gradient.addColorStop(1, "#0a0f1e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Two-weight frame: a hairline inside a heavier rule reads as printed
    // stock rather than as a border on a div.
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, SIZE - 80, SIZE - 80);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.strokeRect(56, 56, SIZE - 112, SIZE - 112);
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // Wordmark
    ctx.fillStyle = GOLD;
    letterspaced(ctx, "ASTRAWEALTH", SIZE / 2, 150, `600 26px ${SANS}`, 7);

    // Business name - the subject of the card, so it sits above the number.
    // Shrinks and wraps to two lines before it is ever allowed to overflow.
    ctx.fillStyle = "rgba(247,245,240,0.82)";
    const name = fitLines(ctx, props.businessName, 820, 2, 44, 28, DISPLAY);
    const nameTop = name.lines.length === 2 ? 252 : 278;
    ctx.font = `500 ${name.fontSize}px ${DISPLAY}`;
    name.lines.forEach((line, i) => {
      ctx.fillText(line, SIZE / 2, nameTop + i * (name.fontSize + 12));
    });

    // Label above the number, so the big glyph is legible as a number and not
    // as decoration.
    ctx.fillStyle = "rgba(247,245,240,0.4)";
    letterspaced(ctx, "EXPRESSION NUMBER", SIZE / 2, 372, `500 20px ${SANS}`, 5);

    // The number
    ctx.fillStyle = IVORY;
    ctx.font = `700 250px ${DISPLAY}`;
    ctx.fillText(String(props.expressionNumber), SIZE / 2, 610);

    // Rule between the number and the archetype
    ctx.strokeStyle = GOLD;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SIZE / 2 - 90, 656);
    ctx.lineTo(SIZE / 2 + 90, 656);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = GOLD_PALE;
    ctx.font = `600 54px ${DISPLAY}`;
    ctx.fillText(props.archetypeName, SIZE / 2, 728);

    ctx.fillStyle = "rgba(247,245,240,0.5)";
    ctx.font = `400 26px ${SANS}`;
    ctx.fillText("Year of the " + props.chineseZodiacAnimal, SIZE / 2, 776);

    if (props.wealthFlagLabel) {
      pill(ctx, props.wealthFlagLabel, SIZE / 2, 822);
    }

    // The footer is the growth mechanic: this card travels to people who have
    // never seen the site, and it has to tell them where to go. The host is
    // read from the browser so the card stays correct the day a real domain
    // is attached, with no code change.
    ctx.fillStyle = "rgba(247,245,240,0.55)";
    letterspaced(ctx, siteHost(), SIZE / 2, 944, `500 24px ${SANS}`, 4);

    ctx.fillStyle = "rgba(247,245,240,0.3)";
    ctx.font = `400 18px ${SANS}`;
    ctx.fillText(
      "Numerology, for reflection. Not financial advice.",
      SIZE / 2,
      982
    );
  }

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    try {
      // Without this the first download renders in a system fallback face,
      // because the webfonts have not finished loading when draw() runs.
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      draw();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = slugify(props.businessName) + "-wealth-signature.png";
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        onClick={handleDownload}
        disabled={busy}
        className="aw-btn"
        style={{
          background: "transparent",
          border: "1px solid var(--gold-400)",
          color: "var(--gold-400)",
          borderRadius: 10,
          padding: "12px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Drawing your chart..." : "Download my chart"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Canvas helpers
 * ---------------------------------------------------------------------- */

/** Canvas has no letter-spacing in every browser we care about, so draw it. */
function letterspaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  font: string,
  spacing: number
) {
  ctx.font = font;
  const chars = text.split("");
  const width =
    chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) +
    spacing * (chars.length - 1);
  let x = centerX - width / 2;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, x, y);
    x += ctx.measureText(c).width + spacing;
  }
  ctx.textAlign = previousAlign;
}

interface FittedLines {
  lines: string[];
  fontSize: number;
}

/**
 * Shrinks the type, then wraps, then truncates - in that order - so a long
 * business name degrades gracefully instead of running off the card.
 */
function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  maxFont: number,
  minFont: number,
  family: string
): FittedLines {
  const words = text.trim().split(/\s+/);

  for (let size = maxFont; size >= minFont; size -= 2) {
    ctx.font = `500 ${size}px ${family}`;
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? current + " " + word : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);

    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
      return { lines, fontSize: size };
    }
  }

  // Nothing fits: truncate at the smallest size.
  ctx.font = `500 ${minFont}px ${family}`;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(clipped + "...").width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return { lines: [clipped.trimEnd() + "..."], fontSize: minFont };
}

/** Whatever host this is actually served from, tidied for display. */
function siteHost(): string {
  if (typeof window === "undefined") return "ASTRAWEALTH";
  const host = window.location.host.replace(/^www\./, "");
  return host ? host.toUpperCase() : "ASTRAWEALTH";
}

function pill(
  ctx: CanvasRenderingContext2D,
  label: string,
  centerX: number,
  top: number
) {
  ctx.font = `600 26px ${SANS}`;
  const boxW = ctx.measureText(label).width + 60;
  const boxH = 56;
  const boxX = centerX - boxW / 2;
  const r = boxH / 2;

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxX + r, top);
  ctx.arcTo(boxX + boxW, top, boxX + boxW, top + boxH, r);
  ctx.arcTo(boxX + boxW, top + boxH, boxX, top + boxH, r);
  ctx.arcTo(boxX, top + boxH, boxX, top, r);
  ctx.arcTo(boxX, top, boxX + boxW, top, r);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.textAlign = "center";
  ctx.fillText(label, centerX, top + 37);
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "astrawealth";
}
