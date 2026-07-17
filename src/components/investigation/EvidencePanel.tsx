"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Search } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

const sigColors = {
  critical: "border-red-500/40 bg-red-500/10 text-red-300",
  important: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  supporting: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  red_herring: "border-slate-500/40 bg-slate-500/10 text-slate-400",
};

export function EvidencePanel({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { discoverItem } = useGameStore();
  const discovered = new Set(investigation?.discoveredEvidence ?? []);

  const items = caseData.evidence.map((e) => ({
    ...e,
    found: discovered.has(e.id) || e.discoveredByDefault,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Evidence Locker</h2>
        <span className="text-sm font-mono text-slate-500">
          {items.filter((i) => i.found).length}/{items.length} collected
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("glass-panel overflow-hidden", !item.found && "opacity-60")}
          >
            {item.found && item.image && (
              <div className="relative h-40">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] to-transparent" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold">{item.found ? item.title : "??? Unknown Item"}</h3>
                {item.found ? (
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase", sigColors[item.significance])}>
                    {item.significance.replace("_", " ")}
                  </span>
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              {item.found ? (
                <>
                  <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                  <p className="text-xs font-mono text-slate-500">Found: {item.locationFound}</p>
                  {item.unlockCondition && (
                    <p className="text-xs text-amber-400/70 mt-2">Hint: {item.unlockCondition}</p>
                  )}
                </>
              ) : (
                <div className="text-sm text-slate-500">
                  <p>Not yet discovered.</p>
                  {item.unlockCondition && (
                    <p className="text-amber-400/60 mt-1 text-xs">{item.unlockCondition}</p>
                  )}
                  <button
                    onClick={() => discoverItem(caseId, item.id)}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                  >
                    <Search className="w-3 h-3" /> Attempt recovery
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
