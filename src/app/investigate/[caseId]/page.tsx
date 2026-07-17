"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Gavel,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquare,
  Network,
  Scale,
  Search,
  Users,
  ArrowLeft,
  X,
} from "lucide-react";
import { useState } from "react";
import { getCaseById } from "@/lib/cases";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import type { DashboardTab } from "@/types/case";
import { OverviewPanel } from "@/components/investigation/OverviewPanel";
import { EvidencePanel } from "@/components/investigation/EvidencePanel";
import { DocumentsPanel } from "@/components/investigation/DocumentsPanel";
import { SuspectsPanel } from "@/components/investigation/SuspectsPanel";
import { WitnessesPanel } from "@/components/investigation/WitnessesPanel";
import { TimelinePanel } from "@/components/investigation/TimelinePanel";
import { NotebookPanel } from "@/components/investigation/NotebookPanel";
import { InterrogatePanel } from "@/components/investigation/InterrogatePanel";
import { CaseBoardPanel } from "@/components/investigation/CaseBoardPanel";
import { MapPanel } from "@/components/investigation/MapPanel";
import { ChargesheetPanel } from "@/components/investigation/ChargesheetPanel";
import { VerdictPanel } from "@/components/investigation/VerdictPanel";
import { CaseClosedBanner } from "@/components/investigation/CaseClosedBanner";

const NAV: { id: DashboardTab; label: string; short: string; icon: typeof Search }[] = [
  { id: "overview", label: "Briefing", short: "Brief", icon: LayoutDashboard },
  { id: "evidence", label: "Evidence", short: "Evidence", icon: Search },
  { id: "documents", label: "Documents", short: "Docs", icon: FileText },
  { id: "suspects", label: "Suspects", short: "Suspects", icon: Users },
  { id: "witnesses", label: "Witnesses", short: "Witness", icon: MessageSquare },
  { id: "interrogate", label: "Interrogate", short: "Interrogate", icon: ClipboardList },
  { id: "timeline", label: "Timeline", short: "Timeline", icon: BookOpen },
  { id: "board", label: "Case Board", short: "Board", icon: Network },
  { id: "map", label: "Map", short: "Map", icon: Map },
  { id: "notebook", label: "Notebook", short: "Notes", icon: BookOpen },
  { id: "chargesheet", label: "Chargesheet", short: "Charge", icon: Scale },
  { id: "verdict", label: "Verdict", short: "Verdict", icon: Gavel },
];

const MOBILE_PRIMARY: DashboardTab[] = ["overview", "evidence", "interrogate", "chargesheet", "verdict"];

export default function InvestigatePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);
  const { activeTab, setActiveTab, startCase, getInvestigation } = useGameStore();
  const investigation = getInvestigation(caseId);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (caseData) startCase(caseId);
  }, [caseId, caseData, startCase]);

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-400">Case file not found.</p>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activeTab) {
      case "overview": return <OverviewPanel caseData={caseData} investigation={investigation} />;
      case "evidence": return <EvidencePanel caseData={caseData} investigation={investigation} caseId={caseId} />;
      case "documents": return <DocumentsPanel caseData={caseData} investigation={investigation} caseId={caseId} />;
      case "suspects": return <SuspectsPanel caseData={caseData} />;
      case "witnesses": return <WitnessesPanel caseData={caseData} />;
      case "interrogate": return <InterrogatePanel caseData={caseData} investigation={investigation} caseId={caseId} />;
      case "timeline": return <TimelinePanel caseData={caseData} investigation={investigation} caseId={caseId} />;
      case "board": return <CaseBoardPanel caseData={caseData} investigation={investigation} caseId={caseId} />;
      case "map": return <MapPanel caseData={caseData} investigation={investigation} caseId={caseId} />;
      case "notebook": return <NotebookPanel investigation={investigation} caseId={caseId} />;
      case "chargesheet": return <ChargesheetPanel caseData={caseData} investigation={investigation} caseId={caseId} locked={!!investigation?.completed} />;
      case "verdict": return <VerdictPanel caseData={caseData} investigation={investigation} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <header className="border-b border-white/5 bg-[#060a12]/95 backdrop-blur-xl sticky top-0 z-50 safe-top">
        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3">
          <Link href="/cases" className="text-slate-400 hover:text-amber-400 p-2 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={caseData.meta.coverImage} alt="" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-mono text-amber-400/70 uppercase tracking-wider">
              Case #{String(caseData.meta.order).padStart(2, "0")}
            </p>
            <h1 className="font-semibold truncate text-sm sm:text-base">{caseData.meta.title}</h1>
          </div>
          {investigation?.completed && (
            <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex-shrink-0">
              CLOSED
            </span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg glass-panel"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-thin">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200",
                activeTab === item.id
                  ? "bg-amber-500/20 text-amber-300 scale-105"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile expanded menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="grid grid-cols-3 gap-2 p-3">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-medium transition-all",
                      activeTab === item.id ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.short}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <CaseClosedBanner caseId={caseId} investigation={investigation} />

      <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderPanel()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#060a12]/95 backdrop-blur-xl safe-bottom">
        <div className="flex justify-around items-center px-1 py-1">
          {MOBILE_PRIMARY.map((tabId) => {
            const item = NAV.find((n) => n.id === tabId)!;
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg flex-1 max-w-[72px] transition-all",
                  activeTab === tabId ? "text-amber-400" : "text-slate-500"
                )}
              >
                <motion.div animate={activeTab === tabId ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }}>
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-[9px] font-medium truncate w-full text-center">{item.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
