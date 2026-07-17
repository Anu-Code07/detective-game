"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { EvidenceItem, InvestigationCase } from "@/types/case";
import { buildEvidenceDetail } from "@/lib/case-engine/evidence-detail";
import { getEvidenceImage } from "@/lib/evidence-images";
import { evidenceToReport } from "@/lib/reports/evidence-report";
import { PoliceReport } from "@/components/reports/PoliceReport";
import { EvidenceThumbnail } from "./EvidenceThumbnail";
import { cn } from "@/lib/utils";

const sigColors = {
  critical: "text-red-300 bg-red-500/15 border-red-500/30",
  important: "text-amber-300 bg-amber-500/15 border-amber-500/30",
  supporting: "text-blue-300 bg-blue-500/15 border-blue-500/30",
  red_herring: "text-slate-400 bg-slate-500/15 border-slate-500/30",
};

export function EvidenceDetailSheet({
  item,
  caseData,
  open,
  onClose,
}: {
  item: EvidenceItem | null;
  caseData: InvestigationCase;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;

  const detail = buildEvidenceDetail(item, caseData);
  const reportData = evidenceToReport(detail, item.title, caseData.meta.title);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-[70] max-h-[92vh] md:max-h-[88vh] flex flex-col rounded-t-2xl md:rounded-2xl bg-[#0c1220] border border-white/10 shadow-2xl safe-bottom"
          >
            <div className="flex items-start justify-between gap-3 p-4 border-b border-white/10 flex-shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest mb-1">
                  Evidence Property Report
                </p>
                <h3 className="font-bold text-lg leading-tight text-slate-100">{item.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase", sigColors[item.significance])}>
                    {item.significance.replace("_", " ")}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 font-mono text-slate-400 uppercase">
                    {item.type}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 flex-shrink-0" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 sm:p-4 scrollbar-thin space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video max-h-48 sm:max-h-56 bg-black/40">
                <EvidenceThumbnail
                  src={getEvidenceImage(item, caseData.meta)}
                  alt={item.title}
                  className="w-full h-full !rounded-none !border-0 object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <p className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider">
                    Exhibit Photo — {detail.referenceNumber}
                  </p>
                </div>
              </div>
              <PoliceReport data={reportData} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
