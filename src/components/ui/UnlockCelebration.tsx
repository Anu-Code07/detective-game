"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileCheck, X } from "lucide-react";
import { useGameStore } from "@/store/game-store";

export function UnlockCelebration() {
  const { celebration, dismissCelebration } = useGameStore();

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={dismissCelebration}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="unlock-stamp relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismissCelebration}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400">
                  Exhibit Recovered
                </p>
                <p className="text-lg font-bold text-white leading-tight">{celebration.title}</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">{celebration.subtitle}</p>

            <div className="mt-5 flex justify-center">
              <span className="stamp-badge">LOGGED</span>
            </div>

            <button
              onClick={dismissCelebration}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
            >
              Continue Investigation
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
