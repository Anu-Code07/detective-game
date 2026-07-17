import Image from "next/image";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { scoreColor, cn } from "@/lib/utils";
import { Gavel, Scale, XCircle, CheckCircle2 } from "lucide-react";

export function VerdictPanel({
  caseData,
  investigation,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
}) {
  const verdict = investigation?.verdict;

  if (!verdict) {
    return (
      <div className="glass-panel p-12 text-center">
        <Scale className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Submit your chargesheet to receive a court verdict.</p>
      </div>
    );
  }

  const accused = caseData.suspects.find(
    (s) => s.id === investigation?.finalAccusation?.accusedId
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden">
        <Image
          src={caseData.meta.coverImage}
          alt=""
          width={800}
          height={300}
          className="w-full h-40 object-cover opacity-30"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060a12]/70">
          {verdict.success ? (
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 mb-2" />
          )}
          <h2 className="text-3xl font-bold">
            {verdict.success ? "CASE CLOSED" : "CASE UNSOLVED"}
          </h2>
          <p className={cn("text-4xl font-mono font-bold mt-2", scoreColor(verdict.score))}>
            {verdict.score}%
          </p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold">Court Ruling</h3>
        </div>
        <p className="text-sm text-slate-400 mb-2">
          Accused: <strong className="text-slate-200">{accused?.name ?? "Unknown"}</strong>
        </p>
        <ul className="space-y-2">
          {verdict.feedback.map((f, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-amber-400">•</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(verdict.grades).map(([key, val]) => (
          <div key={key} className="glass-panel p-3 text-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase">{key}</p>
            <p className={cn("text-xl font-bold font-mono", scoreColor(val))}>{val}</p>
          </div>
        ))}
      </div>

      {verdict.defenseChallenges.length > 0 && (
        <div className="glass-panel p-4 border-red-500/20">
          <p className="text-xs font-mono text-red-400 uppercase mb-2">Defense Challenges</p>
          {verdict.defenseChallenges.map((c, i) => (
            <p key={i} className="text-sm text-slate-400">{c}</p>
          ))}
        </div>
      )}
    </div>
  );
}
