import type { InvestigationCase } from "@/types/case";
import { Users } from "lucide-react";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { DossierCard } from "@/components/ui/DossierCard";
import { cn } from "@/lib/utils";

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-mono text-slate-300">{value}/10</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded overflow-hidden">
        <div className={cn("h-full rounded transition-all", color)} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

export function SuspectsPanel({ caseData }: { caseData: InvestigationCase }) {
  return (
    <div className="space-y-4">
      <PanelHeader
        icon={Users}
        title="Suspect Dossiers"
        subtitle="Review alibis, stress levels, and behavioral profiles. Cross-reference with evidence."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {caseData.suspects.map((s) => (
          <DossierCard key={s.id} name={s.name} subtitle={`${s.occupation} · Age ${s.age}`} role="suspect">
            <p className="text-sm text-slate-400 mb-3">{s.personality}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Meter label="Stress" value={s.stressLevel} color="bg-red-500" />
              <Meter label="Truthfulness" value={s.truthfulness} color="bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500"><strong className="text-slate-400">Alibi:</strong> {s.alibi}</p>
            <p className="text-xs text-slate-500 mt-1"><strong className="text-slate-400">Behavior:</strong> {s.behavior}</p>
          </DossierCard>
        ))}
      </div>
    </div>
  );
}
