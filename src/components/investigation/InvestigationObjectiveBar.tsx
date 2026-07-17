"use client";

import { ArrowRight } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { getCurrentObjective, getInvestigationProgress } from "@/lib/case-engine/objectives";
import { ObjectiveBanner } from "@/components/ui/ObjectiveBanner";
import { useGameStore } from "@/store/game-store";

export function InvestigationObjectiveBar({
  caseData,
  investigation,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { navigationHint, setActiveTab } = useGameStore();

  if (!investigation || investigation.completed) return null;

  const objective = getCurrentObjective(caseData, investigation, navigationHint);
  if (!objective) return null;

  function go() {
    if (navigationHint) {
      setActiveTab(objective!.tab);
      return;
    }
    setActiveTab(objective!.tab);
    if (objective!.leadId) {
      setTimeout(() => {
        document.getElementById(`lead-${objective!.leadId}`)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }

  return (
    <div className="mb-4 space-y-2">
      <ObjectiveBanner hint={objective.hint} />
      <button
        onClick={go}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
      >
        {objective.actionLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function InvestigationProgressStrip({
  caseData,
  investigation,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
}) {
  const progress = getInvestigationProgress(caseData, investigation);
  return (
    <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-500">
      <span className="text-amber-400/90">
        {progress.exhibits}/{progress.total} exhibits
      </span>
      <span className="w-px h-3 bg-white/10" />
      <span>{progress.leadsSolved}/{progress.totalLeads} leads</span>
      <span className="w-px h-3 bg-white/10" />
      <span>{investigation?.questionsAsked ?? 0} questions</span>
    </div>
  );
}
