"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  if (!investigation?.completed || !investigation.verdict) return null;

  const success = investigation.verdict.success;

  function handleReplay() {
    resetCase(caseId);
    router.refresh();
  }

  return (
    <div
      className={`mx-3 sm:mx-4 mb-2 rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
        success ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
      }`}
    >
      <div className="flex items-center gap-2 flex-1">
        <Gavel className={`w-4 h-4 flex-shrink-0 ${success ? "text-emerald-400" : "text-amber-400"}`} />
        <div>
          <p className={`text-sm font-semibold ${success ? "text-emerald-300" : "text-amber-300"}`}>
            {success ? "Case Solved" : "Case Ended"} — Score {investigation.verdict.score}%
          </p>
          <p className="text-[10px] text-slate-400">
            Replay anytime to beat your score or try a different theory.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleReplay}
          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400"
        >
          <RotateCcw className="w-3 h-3" /> Replay Case
        </button>
        <Link href="/cases" className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 hover:bg-white/15 self-center">
          All Cases
        </Link>
      </div>
    </div>
  );
}
