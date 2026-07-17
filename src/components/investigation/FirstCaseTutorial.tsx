"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Search, LayoutDashboard, X } from "lucide-react";
import type { DashboardTab } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

const STEPS: {
  tab: DashboardTab;
  icon: typeof LayoutDashboard;
  title: string;
  body: string;
}[] = [
  {
    tab: "overview",
    icon: LayoutDashboard,
    title: "Read the Briefing",
    body: "Start here. Understand the victim, crime scene, and what your division already knows.",
  },
  {
    tab: "evidence",
    icon: Search,
    title: "Check the Evidence Locker",
    body: "Review recovered exhibits. Sealed items need deduction or smart interrogation to unlock.",
  },
  {
    tab: "interrogate",
    icon: ClipboardList,
    title: "Interrogate Witnesses",
    body: "Press suspects and witnesses. Ask about CCTV, alibis, and money. The right question breaks the case open.",
  },
];

export function FirstCaseTutorial({ caseId }: { caseId: string }) {
  const { activeTab, setActiveTab, tutorialDismissed, dismissTutorial } = useGameStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (caseId === "case-01-meridian-ledger" && !tutorialDismissed) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [caseId, tutorialDismissed]);

  if (!visible || tutorialDismissed) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      dismissTutorial();
      setVisible(false);
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    setActiveTab(STEPS[nextStep].tab);
  }

  function skip() {
    dismissTutorial();
    setVisible(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] pointer-events-none"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto" onClick={skip} />

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-24 md:bottom-8 left-3 right-3 md:left-auto md:right-8 md:max-w-md pointer-events-auto"
        >
          <div className="glass-panel p-5 border-amber-500/30 shadow-2xl shadow-amber-500/10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <current.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                    Tutorial {step + 1}/{STEPS.length}
                  </p>
                  <h3 className="font-bold text-white">{current.title}</h3>
                </div>
              </div>
              <button onClick={skip} className="p-1 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">{current.body}</p>

            <div className="flex gap-1.5 mb-4">
              {STEPS.map((s, i) => (
                <div
                  key={s.tab}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-amber-500" : "bg-white/10"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={skip} className="flex-1 py-2.5 rounded-xl btn-ghost text-sm">
                Skip
              </button>
              <button
                onClick={next}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm"
              >
                {isLast ? "Start Investigating" : `Go to ${STEPS[step + 1].title.split(" ").slice(-1)[0]}`}
              </button>
            </div>

            {activeTab !== current.tab && step > 0 && (
              <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
                Currently on: {activeTab}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
