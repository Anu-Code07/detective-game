"use client";

import type { InvestigationCase, InvestigationState } from "@/types/case";
import { scoreColor, cn } from "@/lib/utils";
import { Gavel, Scale } from "lucide-react";
import { PoliceReport } from "@/components/reports/PoliceReport";
import type { PoliceReportData } from "@/lib/reports/parse-content";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { ShareImageButton } from "@/components/investigation/ShareImageButton";
import { useGameStore } from "@/store/game-store";

const TIER_STAMP: Record<string, string> = {
  master_detective: "CLOSED",
  solid_case: "GUILTY",
  lucky_guess: "HUNCH",
  failed_prosecution: "DISMISSED",
  wrong_accusation: "ACQUITTED",
};

const CATEGORY_LABELS: Record<string, string> = {
  evidence: "Evidence",
  interrogation: "Interrogation",
  theory: "Theory",
};

export function VerdictPanel({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { theorySuspects } = useGameStore();
  const verdict = investigation?.verdict;

  if (!verdict) {
    return (
      <div className="empty-state">
        <Scale className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">File your chargesheet to receive a court verdict.</p>
      </div>
    );
  }

  const accused = caseData.suspects.find(
    (s) => s.id === investigation?.finalAccusation?.accusedId
  );
  const earlyTheory = theorySuspects?.[caseId];
  const earlyTheoryName = caseData.suspects.find((s) => s.id === earlyTheory)?.name;

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
      ...(verdict.defenseChallenges.length
        ? [{ heading: "Defense Challenges Sustained", bullets: verdict.defenseChallenges }]
        : []),
    ],
    footer: "This ruling is final for this investigation filing.",
    stamp: TIER_STAMP[verdict.tier] ?? "RULED",
  };

  const shareText = `Case Files #${String(caseData.meta.order).padStart(2, "0")} — ${verdict.tierLabel} — ${verdict.score}% — ${investigation?.questionsAsked ?? 0} questions`;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <PanelHeader icon={Gavel} title="Court Verdict" subtitle={verdict.tierLabel} />

      <div className="text-center glass-panel p-6">
        <p className={cn("text-4xl font-bold font-mono", scoreColor(verdict.score))}>
          {verdict.score}%
        </p>
        <p className="text-sm text-amber-400 font-mono uppercase tracking-wider mt-2">
          {verdict.tierLabel}
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          {Object.entries(verdict.categoryScores).map(([key, val]) => (
            <div key={key} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                {CATEGORY_LABELS[key] ?? key}
              </p>
              <p className={cn("text-xl font-bold font-mono", scoreColor(val))}>{val}%</p>
              <div className="h-1 bg-white/10 rounded mt-2 overflow-hidden">
                <div
                  className={cn("h-full rounded", val >= 70 ? "bg-emerald-500" : val >= 40 ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Replay to earn Elite Detective in all three categories
        </p>
      </div>

      {earlyTheoryName && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm">
          <p className="text-purple-300 font-medium">Theory checkpoint</p>
          <p className="text-slate-400 text-xs mt-1">
            At 50% evidence you suspected <strong className="text-purple-200">{earlyTheoryName}</strong>.
            {verdict.theoryChanged
              ? " You changed your mind by filing — good detectives revise theories."
              : earlyTheory === investigation?.finalAccusation?.accusedId
                ? " You stuck with your theory all the way through."
                : " Your final accusation differed from your mid-case theory."}
          </p>
        </div>
      )}

      {verdict.recapStory && (
        <div className="glass-panel p-5 border-emerald-500/20">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-3">
            What Really Happened
          </p>
          <div className="space-y-2">
            {verdict.recapStory.map((line, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <PoliceReport data={reportData} />

      {investigation && (
        <div className="glass-panel p-5">
          <p className="text-sm font-semibold text-white mb-1 text-center">Share Your Result</p>
          <p className="text-xs text-slate-500 text-center mb-4">{shareText}</p>
          <ShareImageButton
            caseData={caseData}
            investigation={investigation}
            verdict={verdict}
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono pb-4">
        <Gavel className="w-3 h-3" />
        {verdict.success ? "CASE CLOSED" : "CASE OPEN — REBUILD YOUR FILING"}
      </div>
    </div>
  );
}
