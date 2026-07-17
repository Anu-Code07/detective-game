"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { getAvailableLeads } from "@/lib/case-engine/evidence-unlocks";

const HINTS_BY_CASE: Record<string, string[]> = {
  "case-01-meridian-ledger": [
    "Financial records and shell companies might matter.",
    "Ask the night guard about camera overrides in the garage.",
    "Check who had executive badge access after 22:30.",
  ],
  "case-02-blood-tide": [
    "Tide tables affect when containers can be opened.",
    "Cross-check the union call alibi against supervisor logs.",
    "The murder weapon may still be at the dock.",
  ],
  "case-03-silent-partner": [
    "Phone records don't lie — check who called whom.",
    "Partnership agreements hide motives.",
  ],
  "case-04-winter-exhibit": [
    "The gallery's security log has gaps worth investigating.",
    "Ask about who had keys after closing.",
  ],
  "case-05-last-broadcast": [
    "Studio schedules don't match witness statements.",
    "Check the broadcast delay and green room access.",
  ],
};

const STUCK_MS = 10 * 60 * 1000; // 10 minutes

export function StuckHint({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { hintsUsed, requestHint, detectivePride } = useGameStore();
  const [stuck, setStuck] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!investigation || investigation.completed) return;
    const elapsed = Date.now() - new Date(investigation.startedAt).getTime();
    const sealed = caseData.evidence.some(
      (e) => !investigation.discoveredEvidence.includes(e.id) && e.hidden
    );
    if (elapsed >= STUCK_MS && sealed) setStuck(true);
    const timer = setTimeout(() => setStuck(true), Math.max(0, STUCK_MS - elapsed));
    return () => clearTimeout(timer);
  }, [investigation, caseData]);

  if (!investigation || investigation.completed || !stuck || shown) return null;
  if ((hintsUsed?.[caseId] ?? 0) >= 2) return null;

  const available = getAvailableLeads(caseData, {
    ...investigation,
    solvedLeads: investigation.solvedLeads ?? [],
  });
  if (available.length === 0) return null;

  const hints = HINTS_BY_CASE[caseId] ?? ["Review your evidence and try a new interrogation angle."];
  const hintIndex = hintsUsed?.[caseId] ?? 0;
  const hint = hints[hintIndex % hints.length];
  const prideCost = 5;

  function accept() {
    requestHint(caseId, prideCost);
    setShown(true);
  }

  return (
    <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1">
        <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-blue-400 mb-1">
            Detective hint available
          </p>
          <p className="text-sm text-blue-100">{hint}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Costs {prideCost} detective pride (you have {detectivePride ?? 100})
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => setShown(true)}
          className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
        >
          No thanks
        </button>
        <button
          onClick={accept}
          disabled={(detectivePride ?? 100) < prideCost}
          className="px-4 py-2 rounded-lg bg-blue-500/80 text-white text-xs font-semibold disabled:opacity-40 hover:bg-blue-500"
        >
          Reveal Hint
        </button>
      </div>
    </div>
  );
}
