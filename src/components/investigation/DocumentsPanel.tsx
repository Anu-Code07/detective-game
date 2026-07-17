"use client";

import { useState } from "react";
import { FileText, Lock } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { documentToReport } from "@/lib/reports/parse-content";
import { PoliceReport } from "@/components/reports/PoliceReport";

export function DocumentsPanel({
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
  const [selected, setSelected] = useState<string | null>(null);
  const { unlockDocument, requestWarrant, navigationHint } = useGameStore();
  const unlocked = new Set(investigation?.unlockedDocuments ?? []);

  const docs = caseData.documents.map((d) => ({
    ...d,
    available: !d.classified || unlocked.has(d.id),
  }));

  const active = docs.find((d) => d.id === selected) ?? docs.find((d) => d.available);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Case Documents</h2>
        <button
          onClick={() => !locked && requestWarrant(caseId, "financial and forensic")}
          disabled={locked}
          className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 ring-2 ring-transparent focus:ring-amber-500/40"
        >
          Request Warrant
        </button>
      </div>

      {navigationHint && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          <span className="font-mono uppercase text-[10px] text-amber-400 block mb-1">Objective</span>
          {navigationHint}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-2 lg:col-span-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {docs.map((doc) => {
            const isActive = active?.id === doc.id;
            return (
            <button
              key={doc.id}
              onClick={() => {
                if (doc.available) {
                  setSelected(doc.id);
                  unlockDocument(caseId, doc.id);
                }
              }}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all",
                isActive
                  ? "bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/30 shadow-[inset_3px_0_0_0_rgb(245,158,11)]"
                  : "glass-panel border-transparent hover:bg-white/[0.04] hover:border-white/10",
                !doc.available && "opacity-50 cursor-not-allowed",
                doc.available && !isActive && "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-2">
                {doc.available ? (
                  <FileText className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-amber-300" : "text-amber-400")} />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium truncate", isActive ? "text-amber-100" : "text-slate-200")}>
                    {doc.title}
                  </p>
                  <p className={cn("text-[10px] font-mono", isActive ? "text-amber-400/70" : "text-slate-500")}>
                    {doc.referenceNumber}
                  </p>
                </div>
              </div>
            </button>
            );
          })}
        </div>

        {active?.available && (
          <div className="lg:col-span-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <PoliceReport
              data={documentToReport(
                {
                  title: active.title,
                  referenceNumber: active.referenceNumber,
                  date: active.date,
                  author: active.author,
                  content: active.content,
                  type: active.type,
                  classified: active.classified,
                },
                { caseMeta: caseData.meta, victim: caseData.victim }
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
