"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
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
  const [suspectId, setSuspectId] = useState(caseData.suspects[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const { addInterrogationMessage, incrementQuestions } = useGameStore();

  const suspect = caseData.suspects.find((s) => s.id === suspectId);
  const history = investigation?.interrogations[suspectId] ?? [];
  const discovered = new Set(investigation?.discoveredEvidence ?? []);
  const evidenceOptions = caseData.evidence.filter((e) => discovered.has(e.id));

  async function ask() {
    if (!question.trim() || !suspect || loading) return;
    setLoading(true);
    const q = question.trim();
    setQuestion("");
    addInterrogationMessage(caseId, suspectId, "player", q, {
      presentedEvidence: evidenceId || undefined,
    });
    incrementQuestions(caseId);

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
        }),
      });
      const data = await res.json();
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Interrogation Room</h2>
      <p className="text-sm text-slate-400">
        Ask anything. Present evidence to pressure suspects. The AI will never reveal the solution.
      </p>

      <div className="flex flex-wrap gap-2">
        {caseData.suspects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSuspectId(s.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              suspectId === s.id ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "glass-panel"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="glass-panel p-4 min-h-[320px] max-h-[50vh] overflow-y-auto scrollbar-thin space-y-3">
        {history.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            Begin interrogation of {suspect?.name}. Try: &quot;Where were you at the time of death?&quot;
          </p>
        )}
        {history.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[85%] rounded-xl px-4 py-2 text-sm",
              msg.role === "player"
                ? "ml-auto bg-amber-500/20 text-amber-100"
                : "bg-white/5 text-slate-300"
            )}
          >
            {msg.role === "suspect" && msg.emotionalState && (
              <span className={cn("text-[10px] font-mono uppercase block mb-1", EMOTION_COLORS[msg.emotionalState])}>
                [{msg.emotionalState}]
              </span>
            )}
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Suspect is responding...
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {!locked ? (
          <>
            <select
          value={evidenceId}
          onChange={(e) => setEvidenceId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300"
        >
          <option value="">Present evidence (optional)</option>
          {evidenceOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <div className="flex flex-1 gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Ask your question..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={ask}
            disabled={loading || !question.trim()}
            className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 text-center py-2 font-mono">Case closed — interrogation locked</p>
        )}
      </div>
    </div>
  );
}
