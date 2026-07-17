import type { InvestigationCase } from "@/types/case";
import { MessageSquare } from "lucide-react";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { DossierCard } from "@/components/ui/DossierCard";
import { cn } from "@/lib/utils";

export function WitnessesPanel({ caseData }: { caseData: InvestigationCase }) {
  return (
    <div className="space-y-4">
      <PanelHeader
        icon={MessageSquare}
        title="Witness Files"
        subtitle="Witnesses are imperfect. Compare testimonies carefully — reliability varies."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {caseData.witnesses.map((w) => (
          <DossierCard
            key={w.id}
            name={w.name}
            subtitle={w.occupation}
            role="witness"
            accent="blue"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase text-slate-500">Reliability</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded overflow-hidden max-w-[120px]">
                <div
                  className={cn(
                    "h-full rounded",
                    w.truthfulness >= 7 ? "bg-emerald-500" : w.truthfulness >= 4 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${w.truthfulness * 10}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">{w.truthfulness}/10</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{w.personality}</p>
            <div className="space-y-2">
              <p className="text-xs font-mono text-slate-500 uppercase">Testimony knowledge</p>
              <ul className="text-sm text-slate-300 space-y-1">
                {w.knowledge.map((k, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-400">—</span> {k}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-slate-500 mt-3 font-mono">{w.speechStyle}</p>
          </DossierCard>
        ))}
      </div>
    </div>
  );
}
