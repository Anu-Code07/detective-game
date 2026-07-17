"use client";

import { useState } from "react";
import { Lock, ChevronRight, Search } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { cn } from "@/lib/utils";
import { getEvidenceImage } from "@/lib/evidence-images";
import { getLeadForEvidence } from "@/lib/case-engine/evidence-unlocks";
import { EvidenceThumbnail } from "./EvidenceThumbnail";
import { EvidenceDetailSheet } from "./EvidenceDetailSheet";
import { InvestigationLeadsSection } from "./InvestigationLeadsSection";

const sigDot = {
  critical: "bg-red-400",
  important: "bg-amber-400",
  supporting: "bg-blue-400",
  red_herring: "bg-slate-500",
};

export function EvidencePanel({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const discovered = new Set(investigation?.discoveredEvidence ?? []);

  const items = caseData.evidence.map((e) => ({
    ...e,
    found: discovered.has(e.id) || e.discoveredByDefault,
    lead: e.hidden ? getLeadForEvidence(caseData.meta.id, e.id) : undefined,
  }));

  const recovered = items.filter((i) => i.found);
  const sealed = items.filter((i) => !i.found);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Evidence Locker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Solve investigation leads or interrogate smartly to recover sealed exhibits
          </p>
        </div>
        <span className="text-sm font-mono text-slate-500">
          {recovered.length}/{items.length}
        </span>
      </div>

      <InvestigationLeadsSection caseData={caseData} investigation={investigation} caseId={caseId} />

      {recovered.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Recovered Exhibits</p>
          {recovered.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "w-full text-left glass-panel p-3 sm:p-4 flex items-center gap-3 transition-all",
                "hover:bg-white/[0.06] hover:border-amber-500/20 active:scale-[0.99] cursor-pointer"
              )}
            >
              <EvidenceThumbnail
                src={getEvidenceImage(item, caseData.meta)}
                alt={item.title}
                className="w-14 h-14 sm:w-16 sm:h-16"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", sigDot[item.significance])} />
                  <p className="font-medium text-sm truncate">{item.title}</p>
                </div>
                <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                  {item.type} · {item.significance.replace("_", " ")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {sealed.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sealed Exhibits</p>
          {sealed.map((item) => (
            <div
              key={item.id}
              className="w-full glass-panel p-3 sm:p-4 flex items-center gap-3 opacity-70"
            >
              <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-500 font-medium">{item.title}</p>
                {item.lead ? (
                  <p className="text-[10px] text-amber-400/70 mt-0.5 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Lead: {item.lead.title}
                  </p>
                ) : (
                  item.unlockCondition && (
                    <p className="text-[10px] text-slate-600 mt-0.5">{item.unlockCondition}</p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <EvidenceDetailSheet
        item={selected}
        caseData={caseData}
        open={!!selectedId && !!selected?.found}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
