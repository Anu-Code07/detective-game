import type { InvestigationCase } from "@/types/case";
import { Eye } from "lucide-react";

export function WitnessesPanel({ caseData }: { caseData: InvestigationCase }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Witnesses</h2>
      <p className="text-sm text-slate-400">Witnesses are imperfect. Compare testimonies carefully.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {caseData.witnesses.map((w) => (
          <div key={w.id} className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold">{w.name}</h3>
              <span className="text-xs text-slate-500">· {w.occupation}</span>
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
            <p className="text-xs text-slate-500 mt-3">
              Truthfulness: {w.truthfulness}/10 · {w.speechStyle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
