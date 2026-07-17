"use client";

import { useState } from "react";
import { Lock, ChevronRight, Package } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { cn } from "@/lib/utils";
import { EvidenceDetailSheet } from "./EvidenceDetailSheet";

const sigDot = {
  critical: "bg-red-400",
  important: "bg-amber-400",
  supporting: "bg-blue-400",
  red_herring: "bg-slate-500",
};

export function EvidencePanel({
  caseData,
  investigation,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const discovered = new Set(investigation?.discoveredEvidence ?? []);
  const isClosed = investigation?.completed === true;

  const items = caseData.evidence.map((e) => ({
    ...e,
    found: discovered.has(e.id) || e.discoveredByDefault,
  }));

  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Evidence Locker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tap an exhibit to open the full property report</p>
        </div>
        <span className="text-sm font-mono text-slate-500">
          {items.filter((i) => i.found).length}/{items.length}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => item.found && setSelectedId(item.id)}
            disabled={!item.found}
            className={cn(
              "w-full text-left glass-panel p-3 sm:p-4 flex items-center gap-3 transition-all",
              item.found ? "hover:bg-white/[0.06] hover:border-amber-500/20 active:scale-[0.99] cursor-pointer" : "opacity-50 cursor-not-allowed"
            )}
          >
            {item.found ? (
              <>
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", sigDot[item.significance])} />
                <Package className="w-4 h-4 text-amber-400/60 flex-shrink-0 hidden sm:block" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                    {item.type} · {item.significance.replace("_", " ")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600">Sealed — Not yet recovered</p>
                  {item.unlockCondition && (
                    <p className="text-[10px] text-amber-400/50 mt-0.5">{item.unlockCondition}</p>
                  )}
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {isClosed && (
        <p className="text-xs text-center text-slate-600 font-mono">Case closed — evidence review only</p>
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
