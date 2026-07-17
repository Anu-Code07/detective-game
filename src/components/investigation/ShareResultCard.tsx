"use client";

import { forwardRef } from "react";
import type { InvestigationCase, InvestigationState, VerdictResult } from "@/types/case";

const TIER_COLORS: Record<string, { accent: string; stamp: string }> = {
  master_detective: { accent: "#f59e0b", stamp: "#10b981" },
  solid_case: { accent: "#34d399", stamp: "#10b981" },
  lucky_guess: { accent: "#fbbf24", stamp: "#f59e0b" },
  failed_prosecution: { accent: "#f97316", stamp: "#ef4444" },
  wrong_accusation: { accent: "#ef4444", stamp: "#dc2626" },
};

export const ShareResultCard = forwardRef<
  HTMLDivElement,
  {
    caseData: InvestigationCase;
    investigation: InvestigationState;
    verdict: VerdictResult;
  }
>(function ShareResultCard({ caseData, investigation, verdict }, ref) {
  const accused = caseData.suspects.find(
    (s) => s.id === investigation.finalAccusation?.accusedId
  );
  const colors = TIER_COLORS[verdict.tier] ?? TIER_COLORS.solid_case;
  const caseNum = String(caseData.meta.order).padStart(2, "0");

  return (
    <div
      ref={ref}
      style={{
        width: 1200,
        height: 630,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "linear-gradient(135deg, #060a12 0%, #0c1220 45%, #121a2e 100%)",
        color: "#e2e8f0",
        boxSizing: "border-box",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}22 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div style={{ position: "relative", padding: "48px 56px", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: colors.accent,
                fontWeight: 600,
              }}
            >
              Case Files — Detective Simulator
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 15, color: "#94a3b8", fontFamily: "monospace" }}>
              CASE #{caseNum} · {caseData.meta.difficulty.toUpperCase()}
            </p>
          </div>
          <div
            style={{
              border: `2px solid ${colors.stamp}`,
              color: colors.stamp,
              padding: "6px 16px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              transform: "rotate(-4deg)",
              fontFamily: "monospace",
            }}
          >
            {verdict.success ? "SOLVED" : "CLOSED"}
          </div>
        </div>

        {/* Title + score */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 48, marginTop: 24 }}>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#fff",
                maxWidth: 520,
              }}
            >
              {caseData.meta.title}
            </h1>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 22,
                fontWeight: 600,
                color: colors.accent,
                letterSpacing: "0.05em",
              }}
            >
              {verdict.tierLabel}
            </p>
            {accused && (
              <p style={{ margin: "12px 0 0", fontSize: 16, color: "#94a3b8" }}>
                Accused: <span style={{ color: "#e2e8f0" }}>{accused.name}</span>
              </p>
            )}
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "28px 36px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              minWidth: 200,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 72,
                fontWeight: 800,
                fontFamily: "monospace",
                color: colors.accent,
                lineHeight: 1,
              }}
            >
              {verdict.score}%
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
              FINAL SCORE
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Evidence", value: verdict.categoryScores.evidence },
            { label: "Interrogation", value: verdict.categoryScores.interrogation },
            { label: "Theory", value: verdict.categoryScores.theory },
            { label: "Questions", value: investigation.questionsAsked, suffix: "" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {stat.label}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: "#f1f5f9" }}>
                {stat.value}
                {stat.suffix === undefined ? "%" : ""}
              </p>
              {stat.label !== "Questions" && (
                <div
                  style={{
                    marginTop: 8,
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${stat.value}%`,
                      borderRadius: 2,
                      background:
                        stat.value >= 70 ? "#10b981" : stat.value >= 40 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p
          style={{
            margin: "20px 0 0",
            fontSize: 12,
            color: "#475569",
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          casefiles.detective · Can you beat my score?
        </p>
      </div>
    </div>
  );
});
