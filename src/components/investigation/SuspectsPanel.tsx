import type { InvestigationCase } from "@/types/case";
import { User } from "lucide-react";

export function SuspectsPanel({ caseData }: { caseData: InvestigationCase }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Suspects</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {caseData.suspects.map((s) => (
          <div key={s.id} className="glass-panel p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <p className="text-sm text-amber-400/80">{s.occupation} · Age {s.age}</p>
                <p className="text-sm text-slate-400 mt-2">{s.personality}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-slate-500">Stress</span>
                    <div className="h-1.5 bg-slate-700 rounded mt-1">
                      <div className="h-full bg-red-500 rounded" style={{ width: `${s.stressLevel * 10}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-slate-500">Truthfulness</span>
                    <div className="h-1.5 bg-slate-700 rounded mt-1">
                      <div className="h-full bg-emerald-500 rounded" style={{ width: `${s.truthfulness * 10}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3"><strong>Alibi:</strong> {s.alibi}</p>
                <p className="text-xs text-slate-500 mt-1"><strong>Behavior:</strong> {s.behavior}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
