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
  const { unlockDocument, requestWarrant } = useGameStore();
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
          className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40"
        >
          Request Warrant
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-2 lg:col-span-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                if (doc.available) {
                  setSelected(doc.id);
                  unlockDocument(caseId, doc.id);
                }
              }}
              className={cn(
                "w-full text-left glass-panel p-3 transition-colors",
                active?.id === doc.id && "border-amber-500/30",
                !doc.available && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                {doc.available ? (
                  <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-[10px] font-mono text-slate-500">{doc.referenceNumber}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {active?.available && (
          <div className="lg:col-span-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <PoliceReport
              data={documentToReport({
                title: active.title,
                referenceNumber: active.referenceNumber,
                date: active.date,
                author: active.author,
                content: active.content,
                type: active.type,
                classified: active.classified,
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
