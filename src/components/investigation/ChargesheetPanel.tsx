"use client";

import { useState } from "react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";

export function ChargesheetPanel({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { submitAccusation } = useGameStore();
  const discovered = new Set(investigation?.discoveredEvidence ?? []);
  const [accusedId, setAccusedId] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  const evidenceOptions = caseData.evidence.filter((e) => discovered.has(e.id));

  function toggleEvidence(id: string) {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function submit() {
    if (!accusedId || selectedEvidence.length < 2 || !summary.trim()) return;
    submitAccusation(caseId, {
      accusedId,
      charges: caseData.solution.charges,
      evidence: selectedEvidence,
      summary: summary.trim(),
    });
  }

  if (investigation?.chargesheetSubmitted) {
    return (
      <div className="glass-panel p-6 text-center">
        <p className="text-amber-300 font-semibold mb-2">Chargesheet Submitted</p>
        <p className="text-sm text-slate-400">View your verdict in the Verdict tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">Prepare Chargesheet</h2>
      <p className="text-sm text-slate-400">
        Select the accused, supporting evidence, and write your investigation summary. You need critical proof.
      </p>

      <div>
        <label className="text-sm font-mono text-slate-500 uppercase block mb-2">Accused</label>
        <select
          value={accusedId}
          onChange={(e) => setAccusedId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Select suspect...</option>
          {caseData.suspects.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.occupation}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-mono text-slate-500 uppercase block mb-2">
          Supporting Evidence ({selectedEvidence.length} selected)
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {evidenceOptions.map((e) => (
            <label key={e.id} className="flex items-center gap-3 glass-panel p-3 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={selectedEvidence.includes(e.id)}
                onChange={() => toggleEvidence(e.id)}
                className="rounded border-white/20"
              />
              <div>
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-slate-500">{e.significance}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-mono text-slate-500 uppercase block mb-2">Investigation Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="State your theory: motive, opportunity, method, and how evidence connects..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <button
        onClick={submit}
        disabled={!accusedId || selectedEvidence.length < 2 || summary.length < 20}
        className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold disabled:opacity-40 hover:bg-amber-400 transition-colors"
      >
        Submit to Court
      </button>
    </div>
  );
}
