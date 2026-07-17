import type { InvestigationCase, InvestigationState } from "@/types/case";
import { AlertTriangle, Clock, MapPin, Shield } from "lucide-react";
import { formatCaseDate } from "@/lib/utils";

export function OverviewPanel({
  caseData,
  investigation,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
}) {
  const { meta, victim, policeNotes } = caseData;
  const discovered = investigation?.discoveredEvidence.length ?? 0;
  const total = caseData.evidence.length;

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-56 md:h-72 bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.coverImage} alt={meta.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-amber-400 font-mono text-sm mb-1">{meta.crimeType}</p>
          <h2 className="text-3xl font-bold">{meta.title}</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <MapPin className="w-4 h-4 text-amber-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase font-mono">Location</p>
          <p className="text-sm">{meta.location}</p>
        </div>
        <div className="glass-panel p-4">
          <Clock className="w-4 h-4 text-amber-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase font-mono">Date & Time</p>
          <p className="text-sm">{formatCaseDate(meta.date, meta.time)}</p>
        </div>
        <div className="glass-panel p-4">
          <Shield className="w-4 h-4 text-amber-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase font-mono">Progress</p>
          <p className="text-sm">{discovered}/{total} evidence · {investigation?.questionsAsked ?? 0} questions</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-3 text-amber-300">Case Briefing</h3>
        <p className="text-slate-300 leading-relaxed mb-4">{meta.briefing}</p>
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-slate-500 font-mono uppercase mb-2">Victim</p>
          <p className="font-semibold">{victim.name}, {victim.age} — {victim.occupation}</p>
          <p className="text-sm text-slate-400 mt-1">{victim.causeOfDeath}</p>
        </div>
      </div>

      <div className="glass-panel p-6 border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-300 mb-2">Detective Notes</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{policeNotes}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 italic text-center">{meta.inspiredBy}</p>
    </div>
  );
}
