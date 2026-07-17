"use client";

import { AlertTriangle, Clock } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { cn } from "@/lib/utils";

export function TimelinePanel({
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
  const { discoverTimeline, markContradiction } = useGameStore();
  const discovered = new Set(investigation?.discoveredTimeline ?? []);
  const contradictions = new Set(investigation?.contradictionsFound ?? []);

  return (
    <div className="space-y-4">
      <PanelHeader
        icon={Clock}
        title="Investigation Timeline"
        subtitle="Conflicts are highlighted. Flag contradictions you uncover during interrogation."
      />

      <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {caseData.timeline.map((event) => {
          const known = event.known || discovered.has(event.id);
          const hasConflict = event.conflictWith && event.conflictWith.length > 0;
          const marked = contradictions.has(event.id);

          return (
            <div
              key={event.id}
              className={cn(
                "relative glass-panel p-4",
                hasConflict && known && "border-orange-500/30",
                marked && "border-red-500/40"
              )}
            >
              <div className="absolute -left-5 top-5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#060a12]" />
              {known ? (
                <>
                  <p className="text-xs font-mono text-amber-400 mb-1">{event.timestamp}</p>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                  {hasConflict && (
                    <button
                      onClick={() => markContradiction(caseId, event.id)}
                      className={cn(
                        "mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded",
                        marked ? "bg-red-500/20 text-red-300" : "bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
                      )}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {marked ? "Contradiction logged" : "Flag contradiction"}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => !locked && discoverTimeline(caseId, event.id)}
                  disabled={locked}
                  className="text-sm text-slate-500 hover:text-amber-400 disabled:opacity-50"
                >
                  ??? Unknown event — uncover through investigation
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
