"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, MapPin, RotateCcw } from "lucide-react";
import { getCaseListSummary } from "@/lib/cases";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

const cases = getCaseListSummary();
const difficultyColors: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-orange-400 bg-orange-400/10",
  expert: "text-red-400 bg-red-400/10",
};

export default function CasesPage() {
  const { completedCases, caseScores, startCase, resetCase } = useGameStore();

  function handlePlay(caseId: string, isCompleted: boolean) {
    if (isCompleted) {
      resetCase(caseId);
    } else {
      startCase(caseId);
    }
  }

  return (
    <main className="min-h-screen relative">
      <Image
        src="/images/dashboard-bg.png"
        alt=""
        fill
        className="object-cover opacity-30 fixed inset-0 pointer-events-none"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to HQ
        </Link>

        <h1 className="text-4xl font-bold mb-2 detective-gradient-text">Case File Archive</h1>
        <p className="text-slate-400 mb-10 max-w-2xl">
          Five standalone investigations. Each case has its own suspects, evidence, and solution.
          Progress saves automatically.
        </p>

        <div className="space-y-6">
          {cases.map((c, i) => {
            const done = completedCases.includes(c.id);
            const score = caseScores[c.id];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0">
                    <Image src={c.coverImage} alt={c.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c1220]/80 hidden md:block" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500">CASE #{String(c.order).padStart(2, "0")}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-mono uppercase", difficultyColors[c.difficulty])}>
                          {c.difficulty}
                        </span>
                        {done && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Solved · {score}%
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{c.title}</h2>
                      <p className="text-slate-300 mb-3">{c.synopsis}</p>
                      <p className="text-xs text-slate-500 italic mb-4">{c.inspiredBy}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{c.estimatedMinutes} min</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/investigate/${c.id}`}
                        onClick={() => handlePlay(c.id, done)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm"
                      >
                        {done ? (
                          <><RotateCcw className="w-3.5 h-3.5" /> Replay Case</>
                        ) : (
                          "Begin Investigation"
                        )}
                      </Link>
                      {done && (
                        <Link
                          href={`/investigate/${c.id}`}
                          onClick={() => startCase(c.id)}
                          className="inline-flex px-5 py-2.5 rounded-xl btn-ghost text-sm"
                        >
                          Review ({score}%)
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
