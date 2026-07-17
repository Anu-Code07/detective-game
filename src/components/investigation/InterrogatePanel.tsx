"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, Loader2, Send, Shield, User } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { getEvidenceImage } from "@/lib/evidence-images";
import { EvidenceThumbnail } from "./EvidenceThumbnail";
import { cn } from "@/lib/utils";

const EMOTION_COLORS: Record<string, string> = {
  calm: "text-slate-400",
  nervous: "text-yellow-400",
  defensive: "text-orange-400",
  hostile: "text-red-400",
  distressed: "text-purple-400",
  cornered: "text-red-500",
  anxious: "text-amber-400",
};

const EMOTION_BG: Record<string, string> = {
  calm: "bg-white/5",
  nervous: "bg-yellow-500/10 border-yellow-500/20",
  defensive: "bg-orange-500/10 border-orange-500/20",
  hostile: "bg-red-500/10 border-red-500/20",
  distressed: "bg-purple-500/10 border-purple-500/20",
  cornered: "bg-red-600/15 border-red-500/30",
  anxious: "bg-amber-500/10 border-amber-500/20",
};

function buildSuggestedQuestions(
  caseData: InvestigationCase,
  personId: string,
  evidenceTitle?: string
): string[] {
  const person =
    caseData.suspects.find((s) => s.id === personId) ??
    caseData.witnesses.find((w) => w.id === personId);
  const victim = caseData.victim.name;
  const suggestions = [
    `Where were you when ${victim} died?`,
    "Walk me through your alibi that night.",
    `What was your relationship with ${victim}?`,
    "Did you have any reason to want them dead?",
    "Who else had access to the scene?",
  ];

  if (evidenceTitle) {
    suggestions.unshift(`Explain this — "${evidenceTitle}".`);
    suggestions.unshift(`What do you know about ${evidenceTitle}?`);
  }

  if (person?.relationships[victim]) {
    suggestions.push(`You knew ${victim} well. What weren't you telling us?`);
  }

  if (person?.role === "witness") {
    return [
      "What did you see or hear that night?",
      "Who else was near the scene?",
      "Did you notice anything unusual with security or access?",
      "Walk me through your shift step by step.",
      ...(evidenceTitle ? [`What can you tell me about ${evidenceTitle}?`] : []),
    ].slice(0, 6);
  }

  return suggestions.slice(0, 6);
}

export function InterrogatePanel({
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
  const interviewees = useMemo(
    () => [
      ...caseData.suspects.map((s) => ({ ...s, roleLabel: "Suspect" as const })),
      ...caseData.witnesses.map((w) => ({ ...w, roleLabel: "Witness" as const })),
    ],
    [caseData]
  );

  const [suspectId, setSuspectId] = useState(interviewees[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
  const [showEvidencePicker, setShowEvidencePicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const {
    addInterrogationMessage,
    incrementQuestions,
    tryInterrogationUnlock,
    focusSuspectId,
    navigationHint,
  } = useGameStore();

  const suspect =
    caseData.suspects.find((s) => s.id === suspectId) ??
    caseData.witnesses.find((w) => w.id === suspectId);
  const suspectRole = interviewees.find((p) => p.id === suspectId)?.roleLabel ?? "Suspect";
  const history = investigation?.interrogations[suspectId] ?? [];
  const discovered = new Set(investigation?.discoveredEvidence ?? []);
  const evidenceOptions = caseData.evidence.filter(
    (e) => discovered.has(e.id) || e.discoveredByDefault
  );
  const selectedEvidence = evidenceOptions.find((e) => e.id === evidenceId);

  const pressure = Math.min(
    10,
    2 +
      Math.floor(history.length / 3) +
      (evidenceId ? 2 : 0) +
      (/why did you lie|confess|guilty|killer|murderer|lying|liar/i.test(question) ? 1 : 0)
  );

  const suggestedQuestions = useMemo(
    () => buildSuggestedQuestions(caseData, suspectId, selectedEvidence?.title),
    [caseData, suspectId, selectedEvidence?.title]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, loading]);

  useEffect(() => {
    if (focusSuspectId && interviewees.some((p) => p.id === focusSuspectId)) {
      setSuspectId(focusSuspectId);
    }
  }, [focusSuspectId, interviewees]);

  async function ask(overrideQuestion?: string) {
    const q = (overrideQuestion ?? question).trim();
    if (!q || !suspect || loading || locked) return;

    setLoading(true);
    setQuestion("");
    setShowEvidencePicker(false);

    addInterrogationMessage(caseId, suspectId, "player", q, {
      presentedEvidence: evidenceId || undefined,
    });
    incrementQuestions(caseId);

    const unlockedTitle = tryInterrogationUnlock(caseId, suspectId, q);
    if (unlockedTitle) {
      setUnlockToast(`Evidence recovered: ${unlockedTitle}`);
      setTimeout(() => setUnlockToast(null), 4000);
    }

    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          suspectId,
          question: q,
          history,
          presentedEvidenceId: evidenceId || undefined,
          investigationSnapshot: investigation
            ? {
                discoveredEvidence: investigation.discoveredEvidence,
                unlockedDocuments: investigation.unlockedDocuments,
                unlockedLocations: investigation.unlockedLocations,
                discoveredTimeline: investigation.discoveredTimeline,
                contradictionsFound: investigation.contradictionsFound,
                questionsAsked: investigation.questionsAsked,
                solvedLeads: investigation.solvedLeads ?? [],
              }
            : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        addInterrogationMessage(
          caseId,
          suspectId,
          "suspect",
          data.error ?? "The suspect refuses to continue. Try again."
        );
        return;
      }

      if (data.reply) {
        addInterrogationMessage(caseId, suspectId, "suspect", data.reply, {
          emotionalState: data.emotionalState,
        });
      }
    } catch {
      addInterrogationMessage(
        caseId,
        suspectId,
        "suspect",
        `${suspect.name} stares silently. (Connection error — try again.)`
      );
    } finally {
      setLoading(false);
      setEvidenceId("");
    }
  }

  function getEvidenceTitle(id: string) {
    return caseData.evidence.find((e) => e.id === id)?.title ?? "Unknown exhibit";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Interrogation Room</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Press suspects with questions. Slam evidence on the table to break their story.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>{investigation?.questionsAsked ?? 0} questions asked</span>
        </div>
      </div>

      {/* Suspect tabs */}
      {unlockToast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 font-medium text-center"
        >
          {unlockToast}
        </motion.div>
      )}

      {navigationHint && focusSuspectId === suspectId && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          <span className="font-mono uppercase text-[10px] text-amber-400 block mb-1">Objective</span>
          {navigationHint}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {interviewees.map((s) => (
          <button
            key={s.id}
            onClick={() => setSuspectId(s.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              suspectId === s.id
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "glass-panel",
              focusSuspectId === s.id && suspectId !== s.id && "border-amber-500/20"
            )}
          >
            <span className="block">{s.name}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">{s.roleLabel}</span>
          </button>
        ))}
      </div>

      {/* Suspect profile card */}
      {suspect && (
        <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-100">{suspect.name}</p>
              <p className="text-xs text-slate-400">{suspect.age} · {suspect.occupation} · {suspectRole}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{suspect.personality}</p>
            </div>
          </div>
          <div className="sm:w-44 flex-shrink-0 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                <span>Stress</span>
                <span>{suspect.stressLevel}/10</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-500/80 rounded-full transition-all"
                  style={{ width: `${suspect.stressLevel * 10}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                <span>Pressure</span>
                <span>{pressure}/10</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    pressure >= 7 ? "bg-red-500/80" : pressure >= 4 ? "bg-amber-500/80" : "bg-blue-500/60"
                  )}
                  style={{ width: `${pressure * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="glass-panel p-4 min-h-[280px] max-h-[50vh] overflow-y-auto scrollbar-thin space-y-3">
        {history.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <Shield className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-500 text-sm">
              {suspect?.name} is waiting. Pick a suggested question or write your own.
            </p>
          </div>
        )}
        {history.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[90%] rounded-xl px-4 py-2.5 text-sm border",
              msg.role === "player"
                ? "ml-auto bg-amber-500/15 text-amber-100 border-amber-500/20"
                : cn("bg-white/5 text-slate-300 border-white/5", msg.emotionalState && EMOTION_BG[msg.emotionalState])
            )}
          >
            {msg.role === "player" && msg.presentedEvidence && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-300/80 mb-1.5 pb-1.5 border-b border-amber-500/20">
                <FileSearch className="w-3 h-3" />
                Presented: {getEvidenceTitle(msg.presentedEvidence)}
              </div>
            )}
            {msg.role === "suspect" && msg.emotionalState && (
              <span className={cn("text-[10px] font-mono uppercase block mb-1", EMOTION_COLORS[msg.emotionalState])}>
                [{msg.emotionalState}]
              </span>
            )}
            <p className="leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {suspect?.name} is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested questions */}
      {!locked && history.length < 8 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      {!locked ? (
        <div className="space-y-3">
          {/* Evidence confrontation */}
          <div>
            <button
              onClick={() => setShowEvidencePicker((v) => !v)}
              className={cn(
                "text-xs font-mono uppercase tracking-wider flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                evidenceId
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
              )}
            >
              <FileSearch className="w-3.5 h-3.5" />
              {selectedEvidence ? `Presenting: ${selectedEvidence.title}` : "Present evidence (optional)"}
            </button>

            {showEvidencePicker && (
              <div className="mt-2 p-3 rounded-xl border border-white/10 bg-black/20">
                {evidenceOptions.length === 0 ? (
                  <p className="text-xs text-slate-500">Collect evidence first to confront suspects.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                    <button
                      onClick={() => setEvidenceId("")}
                      className={cn(
                        "flex-shrink-0 w-20 p-2 rounded-lg border text-[10px] font-mono text-center transition-colors",
                        !evidenceId ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-white/10 text-slate-500"
                      )}
                    >
                      None
                    </button>
                    {evidenceOptions.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setEvidenceId(e.id)}
                        className={cn(
                          "flex-shrink-0 w-24 p-1.5 rounded-lg border transition-colors",
                          evidenceId === e.id
                            ? "border-amber-500/40 bg-amber-500/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <EvidenceThumbnail
                          src={getEvidenceImage(e, caseData.meta)}
                          alt={e.title}
                          className="w-full h-14 mb-1"
                        />
                        <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">{e.title}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
              placeholder={`Ask ${suspect?.name ?? "suspect"} something...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
            />
            <button
              onClick={() => ask()}
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 rounded-lg bg-amber-500 text-black font-semibold disabled:opacity-50 hover:bg-amber-400 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-2 font-mono">Case closed — interrogation locked</p>
      )}
    </div>
  );
}
