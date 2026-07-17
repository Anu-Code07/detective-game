"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, HelpCircle, Lock, XCircle } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import type { EvidenceUnlockLead } from "@/lib/case-engine/evidence-unlocks";
import {
  getAvailableLeads,
  getPendingLeads,
} from "@/lib/case-engine/evidence-unlocks";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

function LeadCard({
  lead,
  caseId,
  evidenceTitle,
  highlighted,
}: {
  lead: EvidenceUnlockLead;
  caseId: string;
  evidenceTitle: string;
  highlighted?: boolean;
}) {
  const { solveLeadAnswer } = useGameStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  function submit() {
    if (selected === null || result) return;
    const outcome = solveLeadAnswer(caseId, lead.id, selected);
    setResult(outcome.correct ? "correct" : "wrong");
    if (!outcome.correct) {
      setTimeout(() => {
        setResult(null);
        setSelected(null);
      }, 2200);
    }
  }

  return (
    <motion.div
      ref={cardRef}
      id={`lead-${lead.id}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-panel p-4 border space-y-3 transition-all duration-500",
        highlighted && "border-amber-500/60 ring-2 ring-amber-500/30 bg-amber-500/5",
        result === "correct" && "border-emerald-500/40 bg-emerald-500/5",
        result === "wrong" && "border-red-500/30 bg-red-500/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Investigation Lead</p>
          <h3 className="font-semibold text-sm text-slate-100">{lead.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Unlocks: {evidenceTitle}</p>
        </div>
        <Brain className="w-5 h-5 text-amber-400/60 flex-shrink-0" />
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{lead.context}</p>

      <div className="rounded-lg bg-black/20 border border-white/5 p-3">
        <p className="text-sm font-medium text-slate-200 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          {lead.question}
        </p>
      </div>

      <div className="grid gap-2">
        {lead.options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => !result && setSelected(i)}
            disabled={!!result}
            className={cn(
              "text-left text-xs sm:text-sm px-3 py-2.5 rounded-lg border transition-all",
              selected === i
                ? "border-amber-500/50 bg-amber-500/10 text-amber-100"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5",
              result && i === lead.correctIndex && "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
              result === "wrong" && selected === i && i !== lead.correctIndex && "border-red-500/40 bg-red-500/10"
            )}
          >
            <span className="font-mono text-[10px] text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result === "correct" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-emerald-400 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            Correct — evidence recovered and logged!
          </motion.div>
        )}
        {result === "wrong" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-400 text-sm"
          >
            <XCircle className="w-4 h-4" />
            Not quite — review your evidence and try again.
          </motion.div>
        )}
      </AnimatePresence>

      {!result && (
        <button
          onClick={submit}
          disabled={selected === null}
          className="w-full py-2.5 rounded-lg bg-amber-500 text-black text-sm font-bold disabled:opacity-40 hover:bg-amber-400 transition-colors"
        >
          Submit Deduction
        </button>
      )}

      <p className="text-[10px] text-slate-600 text-center">
        Tip: You can also unlock this by asking the right questions in Interrogate.
      </p>
    </motion.div>
  );
}

export function InvestigationLeadsSection({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { focusLeadId, navigationHint } = useGameStore();

  if (!investigation) return null;

  const state = { ...investigation, solvedLeads: investigation.solvedLeads ?? [] };
  const available = getAvailableLeads(caseData, state);
  const pending = getPendingLeads(caseData, state);

  if (available.length === 0 && pending.length === 0) return null;

  return (
    <div className="space-y-3" id="investigation-leads">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-400" />
            Investigation Leads
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Answer deduction questions to recover sealed evidence
          </p>
        </div>
        <span className="text-xs font-mono text-amber-400/80">{available.length} active</span>
      </div>

      {navigationHint && focusLeadId && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {navigationHint}
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-3">
          {available.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              caseId={caseId}
              evidenceTitle={caseData.evidence.find((e) => e.id === lead.evidenceId)?.title ?? "Exhibit"}
              highlighted={focusLeadId === lead.id}
            />
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Locked leads — gather more evidence first</p>
          {pending.map((lead) => {
            const missing = (lead.requiresEvidence ?? []).filter(
              (id) => !state.discoveredEvidence.includes(id)
            );
            return (
              <div key={lead.id} className="glass-panel p-3 opacity-60 flex items-start gap-3">
                <Lock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{lead.title}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Requires:{" "}
                    {missing
                      .map((id) => caseData.evidence.find((e) => e.id === id)?.title ?? id)
                      .join(", ") || "further investigation"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
