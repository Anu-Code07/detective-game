"use client";

import type { InvestigationCase, InvestigationState } from "@/types/case";
import { scoreColor, cn } from "@/lib/utils";
import { Gavel, Scale } from "lucide-react";
import { PoliceReport } from "@/components/reports/PoliceReport";
import type { PoliceReportData } from "@/lib/reports/parse-content";

const TIER_STAMP: Record<string, string> = {
  master_detective: "CLOSED",
  solid_case: "GUILTY",
  lucky_guess: "HUNCH",
  failed_prosecution: "DISMISSED",
  wrong_accusation: "ACQUITTED",
};

export function VerdictPanel({
  caseData,
  investigation,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
}) {
  const verdict = investigation?.verdict;

  if (!verdict) {
    return (
      <div className="glass-panel p-12 text-center">
        <Scale className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">File your chargesheet to receive a court verdict.</p>
      </div>
    );
  }

  const accused = caseData.suspects.find(
    (s) => s.id === investigation?.finalAccusation?.accusedId
  );

  const reportData: PoliceReportData = {
    department: "METROPOLITAN COURT — CRIMINAL DIVISION",
    title: "COURT VERDICT & RULING",
    subtitle: caseData.meta.title,
    referenceNumber: `CF-${String(caseData.meta.order).padStart(2, "0")}-VERDICT`,
    date: new Date().toLocaleDateString(),
    author: "Hon. Margaret Cross, Presiding Judge",
    classification: verdict.success ? "OFFICIAL" : "RESTRICTED",
    meta: [
      { label: "Accused", value: accused?.name ?? "Unknown" },
      { label: "Score", value: `${verdict.score}%` },
      { label: "Ruling", value: verdict.tierLabel },
    ],
    sections: [
      {
        heading: "Judicial Finding",
        body: verdict.tierMessage,
        highlight: true,
      },
      {
        heading: "Court Commentary",
        bullets: verdict.feedback,
      },
      {
        heading: "Performance Grades",
        table: {
          headers: ["Category", "Score"],
          rows: Object.entries(verdict.grades).map(([k, v]) => [
            k.replace(/([A-Z])/g, " $1").trim(),
            `${v}%`,
          ]),
        },
      },
      ...(verdict.defenseChallenges.length
        ? [{ heading: "Defense Challenges Sustained", bullets: verdict.defenseChallenges }]
        : []),
    ],
    footer: "This ruling is final for this investigation filing.",
    stamp: TIER_STAMP[verdict.tier] ?? "RULED",
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-2">
        <p className={cn("text-3xl font-bold font-mono", scoreColor(verdict.score))}>
          {verdict.score}%
        </p>
        <p className="text-sm text-amber-400 font-mono uppercase tracking-wider mt-1">
          {verdict.tierLabel}
        </p>
      </div>

      <PoliceReport data={reportData} />

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
        <Gavel className="w-3 h-3" />
        {verdict.success ? "CASE CLOSED" : "CASE OPEN — REBUILD YOUR FILING"}
      </div>
    </div>
  );
}
