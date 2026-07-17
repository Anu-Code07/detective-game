import type { ReactNode } from "react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { AlertTriangle, Clock, MapPin, Shield, User } from "lucide-react";
import { formatCaseDate, cn } from "@/lib/utils";

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
  const progressPct = Math.round((discovered / Math.max(total, 1)) * 100);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[240px] bg-[#0a1018]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.coverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/85 to-[#060a12]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a12]/90 via-transparent to-transparent" />

        <div className="relative p-5 sm:p-8 flex flex-col justify-end min-h-[200px] sm:min-h-[240px]">
          <p className="text-[10px] sm:text-xs font-mono text-amber-400/90 uppercase tracking-[0.2em] mb-2">
            Case #{String(meta.order).padStart(2, "0")} · {meta.difficulty}
          </p>
          <p className="text-sm sm:text-base text-amber-200/90 font-medium mb-1">{meta.crimeType}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
            {meta.title}
          </h2>
        </div>
      </div>

      {/* Quick facts — compact strip */}
      <div className="grid sm:grid-cols-3 gap-3">
        <FactCard icon={MapPin} label="Location" value={meta.location} />
        <FactCard icon={Clock} label="Date & Time" value={formatCaseDate(meta.date, meta.time)} />
        <FactCard
          icon={Shield}
          label="Investigation"
          value={`${discovered} of ${total} exhibits`}
          extra={
            <div className="mt-2.5">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {investigation?.questionsAsked ?? 0} questions asked
              </p>
            </div>
          }
        />
      </div>

      {/* Main briefing + sidebar */}
      <div className="grid lg:grid-cols-5 gap-5">
        <article className="lg:col-span-3 glass-panel p-5 sm:p-7">
          <header className="mb-5 pb-4 border-b border-white/8">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Case Briefing</h3>
            <p className="text-sm text-slate-400 mt-1">Official detective division summary</p>
          </header>
          <p className="text-[15px] sm:text-base text-slate-200 leading-[1.75] tracking-[0.01em]">
            {meta.briefing}
          </p>
        </article>

        <aside className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Victim</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-0.5">Name</dt>
                <dd className="text-slate-100 font-medium leading-snug">
                  {victim.name}, {victim.age}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-0.5">Occupation</dt>
                <dd className="text-slate-300 leading-snug">{victim.occupation}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-0.5">Cause of Death</dt>
                <dd className="text-slate-300 leading-snug">{victim.causeOfDeath}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-0.5">Last Seen</dt>
                <dd className="text-slate-400 leading-snug text-[13px]">{victim.lastSeen}</dd>
              </div>
            </dl>
          </div>

          <div className="glass-panel p-5 border-amber-500/15 bg-amber-500/[0.03]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-200 mb-2">Detective Notes</h3>
                <p className="text-[14px] sm:text-[15px] text-slate-300 leading-[1.7]">{policeNotes}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed text-center px-4 pb-2">
        {meta.inspiredBy}
      </p>
    </div>
  );
}

function FactCard({
  icon: Icon,
  label,
  value,
  extra,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  extra?: ReactNode;
}) {
  return (
    <div className="glass-panel p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">{label}</p>
          <p className={cn("text-sm sm:text-[15px] text-slate-100 leading-snug font-medium")}>{value}</p>
          {extra}
        </div>
      </div>
    </div>
  );
}
