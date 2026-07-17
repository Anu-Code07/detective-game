"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";
import type { InvestigationState, NotebookEntry } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

const CATEGORIES: NotebookEntry["category"][] = [
  "fact", "question", "contradiction", "motive", "unverified", "missing",
];

const CAT_COLORS: Record<string, string> = {
  fact: "text-blue-300 bg-blue-500/10",
  question: "text-purple-300 bg-purple-500/10",
  contradiction: "text-red-300 bg-red-500/10",
  motive: "text-orange-300 bg-orange-500/10",
  unverified: "text-slate-300 bg-slate-500/10",
  missing: "text-amber-300 bg-amber-500/10",
};

export function NotebookPanel({
  investigation,
  caseId,
  locked = false,
}: {
  investigation: InvestigationState | null;
  caseId: string;
  locked?: boolean;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { addNotebookEntry } = useGameStore();
  const entries = investigation?.notebook ?? [];

  async function saveNote() {
    if (!note.trim() || loading) return;
    setLoading(true);
    let category: NotebookEntry["category"] = "fact";
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.trim() }),
      });
      const data = await res.json();
      category = data.category ?? "fact";
    } catch {
      // use default
    }
    addNotebookEntry(caseId, note.trim(), category);
    setNote("");
    setLoading(false);
  }

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: entries.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      <PanelHeader
        icon={StickyNote}
        title="Detective Notebook"
        subtitle="AI auto-categorizes your notes into facts, questions, and contradictions."
      />

      <div className="flex gap-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={locked ? "Case closed — notes locked" : "Write observations, theories, questions..."}
          disabled={locked}
          className="flex-1 input-field min-h-[80px] resize-none disabled:opacity-50"
        />
        {!locked && (
        <button
          onClick={saveNote}
          disabled={loading || !note.trim()}
          className="px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-sm self-end disabled:opacity-50"
        >
          Save
        </button>
        )}
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Document theories, contradictions, and questions as you investigate."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <h3 className={cn("text-xs font-mono uppercase px-2 py-1 rounded inline-block mb-3", CAT_COLORS[cat])}>
                {cat}
              </h3>
              <ul className="space-y-2">
                {items.map((e) => (
                  <li key={e.id} className="glass-panel p-3 text-sm text-slate-300">
                    {e.content}
                    <p className="text-[10px] text-slate-600 font-mono mt-1">
                      {new Date(e.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
