"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Fingerprint, FileText } from "lucide-react";
import type { EvidenceItem, InvestigationCase } from "@/types/case";
import { getEvidenceImage } from "@/lib/evidence-images";
import { buildEvidenceDetail, formatEvidenceReport } from "@/lib/case-engine/evidence-detail";
import { cn } from "@/lib/utils";
import { EvidenceThumbnail } from "./EvidenceThumbnail";

const sigColors = {
  critical: "text-red-300 bg-red-500/15 border-red-500/30",
  important: "text-amber-300 bg-amber-500/15 border-amber-500/30",
  supporting: "text-blue-300 bg-blue-500/15 border-blue-500/30",
  red_herring: "text-slate-400 bg-slate-500/15 border-slate-500/30",
};

export function EvidenceDetailSheet({
  item,
  caseData,
  imageSrc,
  open,
  onClose,
}: {
  item: EvidenceItem | null;
  caseData: InvestigationCase;
  imageSrc?: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;

  const detail = buildEvidenceDetail(item, caseData);
  const report = formatEvidenceReport(detail, item.title);
  const src = imageSrc ?? getEvidenceImage(item, caseData.meta);

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
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-[70] max-h-[92vh] md:max-h-[85vh] flex flex-col rounded-t-2xl md:rounded-2xl bg-[#0c1220] border border-white/10 shadow-2xl safe-bottom"
          >
            <div className="flex items-start justify-between gap-3 p-4 border-b border-white/10 flex-shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest mb-1">
                  Property Evidence Report
                </p>
                <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">{detail.referenceNumber}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 flex-shrink-0" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <div className="relative w-full h-44 sm:h-52 border-b border-white/5 bg-black/40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = caseData.meta.coverImage;
                  }}
                />
                <span className="absolute bottom-3 left-4 text-[10px] font-mono bg-black/70 px-2 py-1 rounded text-slate-300">
                  EXHIBIT PHOTO
                </span>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={cn("text-[10px] px-2 py-1 rounded-full border font-mono uppercase", sigColors[item.significance])}>
                    {item.significance.replace("_", " ")}
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full border border-white/10 font-mono text-slate-400 uppercase">
                    {item.type}
                  </span>
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-white/5 font-mono text-slate-500">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="doc-paper whitespace-pre-wrap text-xs leading-relaxed max-h-none">
                  {report}
                </div>

                {detail.detectiveNotes && (
                  <div className="glass-panel p-4 border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      <p className="text-xs font-mono text-amber-400 uppercase">Detective Insight</p>
                    </div>
                    <p className="text-sm text-slate-300">{detail.detectiveNotes}</p>
                  </div>
                )}

                {item.documentId && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Linked document available in Documents tab
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
