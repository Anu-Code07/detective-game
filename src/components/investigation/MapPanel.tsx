"use client";

import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

export function MapPanel({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { searchLocation, unlockLocation } = useGameStore();
  const unlocked = new Set(investigation?.unlockedLocations ?? []);
  const searched = new Set(investigation?.searchesCompleted ?? []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Investigation Map</h2>
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <Image
          src={caseData.meta.coverImage}
          alt="Map"
          width={1200}
          height={600}
          className="w-full h-64 object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[#060a12]/60" />
        {caseData.locations.map((loc) => {
          const isUnlocked = loc.unlocked || unlocked.has(loc.id);
          const isSearched = searched.has(loc.id);
          return (
            <button
              key={loc.id}
              onClick={() => {
                if (isUnlocked) searchLocation(caseId, loc.id);
                else unlockLocation(caseId, loc.id);
              }}
              style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group",
                !isUnlocked && "opacity-50"
              )}
            >
              <span
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110",
                  isSearched ? "bg-emerald-500/30 border-emerald-400" : "bg-amber-500/30 border-amber-400"
                )}
              >
                <MapPin className="w-5 h-5 text-white" />
              </span>
              <span className="text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded whitespace-nowrap">
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {caseData.locations.map((loc) => {
          const isUnlocked = loc.unlocked || unlocked.has(loc.id);
          const isSearched = searched.has(loc.id);
          return (
            <div key={loc.id} className="glass-panel p-4">
              <h3 className="font-semibold">{loc.name}</h3>
              <p className="text-xs text-slate-500 font-mono mb-2">{loc.address}</p>
              <p className="text-sm text-slate-400 mb-3">{loc.description}</p>
              {isUnlocked ? (
                <button
                  onClick={() => searchLocation(caseId, loc.id)}
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg",
                    isSearched ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  )}
                >
                  <Search className="w-3 h-3" />
                  {isSearched ? "Searched — evidence collected" : "Search location"}
                </button>
              ) : (
                <p className="text-xs text-slate-500">Requires warrant to access</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
