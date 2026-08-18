"use client";

import { useRef } from "react";

interface ShareCardProps {
  businessName: string;
  expressionNumber: number;
  archetypeName: string;
  chineseZodiacAnimal: string;
  wealthFlagLabel?: string;
}

export default function ShareCard(props: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    const gradient = ctx.createRadialGradient(
      size / 2, size * 0.4, 60,
      size / 2, size * 0.4, size
    );
    gradient.addColorStop(0, "#16213b");
    gradient.addColorStop(1, "#0a0f1e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, size - 80, size - 80);

    ctx.textAlign = "center";

    ctx.fillStyle = "#d4af37";
    ctx.font = "600 28px sans-serif";
    ctx.fillText("ASTRAWEALTH", size / 2, 160);

    ctx.fillStyle = "#f7f5f0";
    ctx.font = "700 260px serif";
    ctx.fillText(String(props.expressionNumber), size / 2, 480);

    ctx.fillStyle = "#f4e9c8";
    ctx.font = "600 56px serif";
    ctx.fillText(props.archetypeName, size / 2, 590);

    ctx.fillStyle = "rgba(247,245,240,0.7)";
    ctx.font = "400 30px sans-serif";
    ctx.fillText(props.businessName, size / 2, 660);

    ctx.fillStyle = "rgba(247,245,240,0.5)";
    ctx.font = "400 26px sans-serif";
    ctx.fillText("Year of the " + props.chineseZodiacAnimal, size / 2, 710);

    if (props.wealthFlagLabel) {
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      const label = props.wealthFlagLabel;
      ctx.font = "600 26px sans-serif";
      const textWidth = ctx.measureText(label).width;
      const boxW = textWidth + 60;
      const boxX = size / 2 - boxW / 2;
      const boxY = 770;
      ctx.beginPath();
      const r = 999;
      ctx.moveTo(boxX + r, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + 56, r);
      ctx.arcTo(boxX + boxW, boxY + 56, boxX, boxY + 56, r);
      ctx.arcTo(boxX, boxY + 56, boxX, boxY, r);
      ctx.arcTo(boxX, boxY, boxX + boxW, boxY, r);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#d4af37";
      ctx.fillText(label, size / 2, boxY + 37);
    }

    ctx.fillStyle = "rgba(247,245,240,0.4)";
    ctx.font = "400 22px sans-serif";
    ctx.fillText("astrawealth", size / 2, size - 80);
  }

  function handleDownload() {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "astrawealth-wealth-signature.png";
    a.click();
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        onClick={handleDownload}
        className="aw-btn"
        style={{
          background: "transparent",
          border: "1px solid var(--gold-400)",
          color: "var(--gold-400)",
          borderRadius: 10,
          padding: "12px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Download my chart
      </button>
    </div>
  );
}
