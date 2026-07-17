"use client";

import { useState } from "react";
import { AlertTriangle, Gavel, Zap } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { PoliceReport } from "@/components/reports/PoliceReport";
import type { PoliceReportData, ReportSection } from "@/lib/reports/parse-content";

function buildSubmittedReport(
  caseData: InvestigationCase,
  accusation: NonNullable<InvestigationState["finalAccusation"]>
): PoliceReportData {
  const accused = caseData.suspects.find((s) => s.id === accusation.accusedId);
  const evidenceList = accusation.evidence
    .map((id) => caseData.evidence.find((e) => e.id === id)?.title)
    .filter(Boolean) as string[];

  const sections: ReportSection[] = [
    {
      heading: "Case Reference",
      rows: [
        { label: "Case Title", value: caseData.meta.title },
        { label: "Crime Type", value: caseData.meta.crimeType },
        { label: "Incident", value: `${caseData.meta.date} — ${caseData.meta.time}` },
        { label: "Scene", value: caseData.meta.location },
        { label: "Filing Type", value: accusation.isQuickGuess ? "Quick Accusation (incomplete)" : "Full Chargesheet" },
      ],
    },
    {
      heading: "Accused Party",
      rows: [
        { label: "Name", value: accused?.name ?? "Unknown" },
        { label: "Age", value: accused ? String(accused.age) : "N/A" },
        { label: "Occupation", value: accused?.occupation ?? "N/A" },
        { label: "Stated Alibi", value: accused?.alibi ?? "Not provided" },
        { label: "Known Motive (intel)", value: accused?.motive ?? "Under investigation" },
      ],
    },
    {
      heading: "Charges Filed",
      bullets: accusation.charges,
    },
  ];

  if (accusation.motive?.trim()) {
    sections.push({ heading: "Motive", body: accusation.motive });
  }
  if (accusation.opportunity?.trim()) {
    sections.push({ heading: "Opportunity", body: accusation.opportunity });
  }
  if (accusation.method?.trim()) {
    sections.push({ heading: "Method", body: accusation.method });
  }
  if (evidenceList.length) {
    sections.push({ heading: "Supporting Exhibits", bullets: evidenceList });
  } else {
    sections.push({
      heading: "Supporting Exhibits",
      body: "None filed — quick accusation without evidence documentation.",
      highlight: true,
    });
  }
  if (accusation.summary?.trim()) {
    sections.push({ heading: "Additional Notes", body: accusation.summary });
  }

  sections.push({
    heading: "Victim",
    rows: [
      { label: "Name", value: `${caseData.victim.name}, age ${caseData.victim.age}` },
      { label: "Occupation", value: caseData.victim.occupation },
      { label: "Cause of Death", value: caseData.victim.causeOfDeath },
      { label: "Last Seen", value: caseData.victim.lastSeen },
      { label: "Background", value: caseData.victim.background },
    ],
  });

  sections.push({
    heading: "Prosecution Certification",
    body:
      "I certify that the above filing is submitted in good faith based on evidence collected during this investigation. " +
      (accusation.isQuickGuess
        ? "NOTE: This is a preliminary accusation without full theory documentation."
        : "Theory of crime, supporting exhibits, and victim particulars have been documented as required."),
  });

  return {
    department: "METROPOLITAN POLICE — PROSECUTOR'S OFFICE",
    title: "POLICE CHARGESHEET",
    subtitle: caseData.meta.title,
    referenceNumber: `CF-${String(caseData.meta.order).padStart(2, "0")}-CHARGE`,
    date: new Date(accusation.submittedAt).toLocaleDateString(),
    author: "Lead Detective — Filing Officer",
    classification: accusation.isQuickGuess ? "RESTRICTED" : "OFFICIAL",
    sections,
    footer: "Submitted for judicial review. False filing is a criminal offense.",
    stamp: accusation.isQuickGuess ? "HUNCH" : "FILED",
  };
}

export function ChargesheetPanel({
  caseData,
  investigation,
  caseId,
  locked = false,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
  locked?: boolean;
}) {
  const { submitAccusation } = useGameStore();
  const discovered = new Set(investigation?.discoveredEvidence ?? []);
  const [accusedId, setAccusedId] = useState("");
  const [motive, setMotive] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [method, setMethod] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  const evidenceOptions = caseData.evidence.filter((e) => discovered.has(e.id));
  const accusation = investigation?.finalAccusation;

  function toggleEvidence(id: string) {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function submitFull() {
    if (!accusedId) return;
    submitAccusation(caseId, {
      accusedId,
      charges: caseData.solution.charges,
      evidence: selectedEvidence,
      motive: motive.trim(),
      opportunity: opportunity.trim(),
      method: method.trim(),
      summary: summary.trim(),
      isQuickGuess: false,
    });
  }

  function submitGuess() {
    if (!accusedId) return;
    submitAccusation(caseId, {
      accusedId,
      charges: caseData.solution.charges,
      evidence: [],
      isQuickGuess: true,
    });
  }

  if (locked && accusation) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Submitted Chargesheet</h2>
        <PoliceReport data={buildSubmittedReport(caseData, accusation)} />
      </div>
    );
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
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gavel className="w-5 h-5 text-amber-400" /> Prepare Chargesheet
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Build your case properly — or take a shot with a quick accusation (the court will notice).
        </p>
      </div>

      {/* Section 1: Accused */}
      <fieldset className="glass-panel p-4 space-y-3">
        <legend className="text-xs font-mono text-amber-400 uppercase px-1">I. Accused Party *</legend>
        <select
          value={accusedId}
          onChange={(e) => setAccusedId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
        >
          <option value="">Select suspect to charge...</option>
          {caseData.suspects.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.occupation}</option>
          ))}
        </select>
      </fieldset>

      {/* Section 2: Theory */}
      <fieldset className="glass-panel p-4 space-y-3">
        <legend className="text-xs font-mono text-amber-400 uppercase px-1">II. Theory of Crime</legend>
        <div>
          <label className="text-[10px] font-mono text-slate-500 uppercase">Motive — Why would they kill?</label>
          <textarea
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            placeholder="Financial gain, silencing a witness, revenge..."
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none focus:border-amber-500/40 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 uppercase">Opportunity — How did they access the victim?</label>
          <textarea
            value={opportunity}
            onChange={(e) => setOpportunity(e.target.value)}
            placeholder="Alibi gaps, access to location, timeline window..."
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none focus:border-amber-500/40 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 uppercase">Method — How was the crime committed?</label>
          <textarea
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Weapon used, poison, arson, cause of death..."
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none focus:border-amber-500/40 focus:outline-none"
          />
        </div>
      </fieldset>

      {/* Section 3: Evidence */}
      <fieldset className="glass-panel p-4 space-y-2">
        <legend className="text-xs font-mono text-amber-400 uppercase px-1">
          III. Supporting Exhibits ({selectedEvidence.length} selected)
        </legend>
        <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
          {evidenceOptions.length === 0 ? (
            <p className="text-xs text-slate-500">No evidence collected yet.</p>
          ) : (
            evidenceOptions.map((e) => (
              <label key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEvidence.includes(e.id)}
                  onChange={() => toggleEvidence(e.id)}
                  className="rounded border-white/20"
                />
                <div className="min-w-0">
                  <p className="text-sm truncate">{e.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{e.significance}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </fieldset>

      {/* Section 4: Notes */}
      <fieldset className="glass-panel p-4">
        <legend className="text-xs font-mono text-slate-500 uppercase px-1">IV. Additional Notes (optional)</legend>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Connect the dots for the prosecutor..."
          className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none focus:outline-none"
        />
      </fieldset>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={submitFull}
          disabled={!accusedId}
          className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold disabled:opacity-40 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
        >
          <Gavel className="w-4 h-4" /> File Full Chargesheet
        </button>
        <button
          onClick={submitGuess}
          disabled={!accusedId}
          className="w-full py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/5 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-amber-400" /> Quick Accusation (guess only)
        </button>
        <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Quick accusations without evidence rarely hold up in court
        </p>
      </div>
    </div>
  );
}
