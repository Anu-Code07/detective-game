"use client";

import Link from "next/link";
import { Gavel, RotateCcw } from "lucide-react";
import type { InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";

export function CaseClosedBanner({
  caseId,
  investigation,
}: {
  caseId: string;
  investigation: InvestigationState | null;
}) {
  const { resetCase } = useGameStore();

  if (!investigation?.completed || !investigation.verdict) return null;

  const success = investigation.verdict.success;

  return (
    <div className={`mx-3 sm:mx-4 mb-2 rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
      success ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
    }`}>
      <div className="flex items-center gap-2 flex-1">
        <Gavel className={`w-4 h-4 flex-shrink-0 ${success ? "text-emerald-400" : "text-red-400"}`} />
        <div>
          <p className={`text-sm font-semibold ${success ? "text-emerald-300" : "text-red-300"}`}>
            {success ? "Case Closed — Review Mode" : "Case Unsolved — Review Mode"}
          </p>
          <p className="text-[10px] text-slate-400">
            Score: {investigation.verdict.score}% · Investigation locked. View evidence & verdict only.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => resetCase(caseId)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300"
        >
          <RotateCcw className="w-3 h-3" /> Replay Case
        </button>
        <Link href="/cases" className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
          All Cases
        </Link>
      </div>
    </div>
  );
}
