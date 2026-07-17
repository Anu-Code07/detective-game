"use client";

import { useState } from "react";
import { FileText, Lock } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

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
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.image ?? caseData.meta.coverImage}
                alt={active.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = caseData.meta.coverImage;
                }}
              />
            </div>
            <div className="doc-paper max-h-[55vh] overflow-y-auto whitespace-pre-wrap">
              <div className="border-b border-slate-300 pb-3 mb-4 text-xs text-slate-600">
                <strong>{active.title}</strong><br />
                Ref: {active.referenceNumber} · {active.date}<br />
                Author: {active.author}
              </div>
              {active.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
