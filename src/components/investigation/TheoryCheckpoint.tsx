"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { getInvestigationProgress } from "@/lib/case-engine/objectives";
import { cn } from "@/lib/utils";

export function TheoryCheckpoint({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { setTheorySuspect, theorySuspects } = useGameStore();
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (!investigation || investigation.completed || dismissed) return null;

  const progress = getInvestigationProgress(caseData, investigation);
  const alreadyAnswered = theorySuspects?.[caseId];
  const shouldShow = progress.pct >= 50 && !alreadyAnswered;

  if (!shouldShow) return null;

  function submit() {
    if (!selected) return;
    setTheorySuspect(caseId, selected);
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="mb-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                Theory Checkpoint
              </p>
              <p className="text-sm font-semibold text-purple-100">Who do you think did it?</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          No penalty — we&apos;ll track if you change your mind by the end. Good detectives revise theories.
        </p>

        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          {caseData.suspects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={cn(
                "text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                selected === s.id
                  ? "border-purple-500/50 bg-purple-500/15 text-purple-100"
                  : "border-white/10 text-slate-400 hover:border-white/20"
              )}
            >
              {s.name}
              <span className="block text-[10px] text-slate-500 mt-0.5">{s.occupation}</span>
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={!selected}
          className="w-full py-2 rounded-lg bg-purple-500/80 text-white text-sm font-semibold disabled:opacity-40 hover:bg-purple-500 transition-colors"
        >
          Lock In Theory
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
