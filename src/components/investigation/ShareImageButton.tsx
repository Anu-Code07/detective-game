"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ImageIcon, Loader2, Share2 } from "lucide-react";
import type { InvestigationCase, InvestigationState, VerdictResult } from "@/types/case";
import { ShareResultCard } from "./ShareResultCard";
import { cn } from "@/lib/utils";

export function ShareImageButton({
  caseData,
  investigation,
  verdict,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState;
  verdict: VerdictResult;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const caseNum = String(caseData.meta.order).padStart(2, "0");
  const filename = `case-files-${caseNum}-${verdict.score}pct.png`;
  const shareText = `Case Files #${caseNum} — ${verdict.tierLabel} — ${verdict.score}% — ${investigation.questionsAsked} questions`;

  async function generateImage(): Promise<Blob> {
    const node = cardRef.current;
    if (!node) throw new Error("Card not ready");

    const dataUrl = await toPng(node, {
      width: 1200,
      height: 630,
      pixelRatio: 2,
      cacheBust: true,
      style: { transform: "none" },
    });

    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const blob = await generateImage();
      const url = URL.createObjectURL(blob);
      setPreview(url);

      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
    } catch {
      setError("Could not generate image. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    setLoading(true);
    setError(null);
    try {
      const blob = await generateImage();
      const file = new File([blob], filename, { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setPreview(url);

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Case Files #${caseNum}`,
            text: shareText,
            files: [file],
          });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          // fall through to clipboard + download
        }
      }

      await navigator.clipboard?.writeText(shareText);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
    } catch {
      setError("Share failed. Use download instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Off-screen render target for capture */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <ShareResultCard
          ref={cardRef}
          caseData={caseData}
          investigation={investigation}
          verdict={verdict}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Share card preview"
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleShare}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          Share Card
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-ghost text-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
        <button
          onClick={() => navigator.clipboard?.writeText(shareText)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-ghost text-sm"
        >
          <ImageIcon className="w-4 h-4" />
          Copy text
        </button>
      </div>

      {error && <p className={cn("text-xs text-red-400 text-center")}>{error}</p>}

      <p className="text-[10px] text-slate-600 text-center font-mono">
        1200×630 · Optimized for Twitter, Discord &amp; Reddit
      </p>
    </div>
  );
}
