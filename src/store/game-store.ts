"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BoardConnection,
  DashboardTab,
  InvestigationState,
  NotebookEntry,
  PlayerProgress,
} from "@/types/case";
import { createInitialState, discoverEvidence, evaluateVerdict } from "@/lib/case-engine/engine";
import { getCaseById } from "@/lib/cases";
import { generateId } from "@/lib/utils";

interface GameStore extends PlayerProgress {
  activeCaseId: string | null;
  activeTab: DashboardTab;
  guestId: string;
  setActiveCase: (caseId: string) => void;
  setActiveTab: (tab: DashboardTab) => void;
  getInvestigation: (caseId: string) => InvestigationState | null;
  startCase: (caseId: string) => void;
  discoverItem: (caseId: string, evidenceId: string) => void;
  unlockDocument: (caseId: string, docId: string) => void;
  unlockLocation: (caseId: string, locId: string) => void;
  discoverTimeline: (caseId: string, eventId: string) => void;
  addNotebookEntry: (caseId: string, content: string, category?: NotebookEntry["category"]) => void;
  addBoardConnection: (caseId: string, source: string, target: string, label: string) => void;
  addInterrogationMessage: (
    caseId: string,
    suspectId: string,
    role: "player" | "suspect",
    content: string,
    meta?: { presentedEvidence?: string; emotionalState?: string }
  ) => void;
  incrementQuestions: (caseId: string) => void;
  markContradiction: (caseId: string, eventId: string) => void;
  setTheoryNotes: (caseId: string, notes: string) => void;
  submitAccusation: (
    caseId: string,
    data: { accusedId: string; charges: string[]; evidence: string[]; summary: string }
  ) => void;
  searchLocation: (caseId: string, locationId: string) => void;
  requestWarrant: (caseId: string, target: string) => void;
}

function ensureGuestId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("casefiles_guest");
  if (!id) {
    id = generateId("guest");
    localStorage.setItem("casefiles_guest", id);
  }
  return id;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      completedCases: [],
      caseScores: {},
      investigations: {},
      activeCaseId: null,
      activeTab: "overview",
      guestId: "",

      setActiveCase: (caseId) => set({ activeCaseId: caseId }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      getInvestigation: (caseId) => get().investigations[caseId] ?? null,

      startCase: (caseId) => {
        const caseData = getCaseById(caseId);
        if (!caseData) return;
        const existing = get().investigations[caseId];
        if (existing) {
          set({ activeCaseId: caseId, activeTab: "overview" });
          return;
        }
        const state = createInitialState(caseId, caseData);
        set((s) => ({
          activeCaseId: caseId,
          activeTab: "overview",
          investigations: { ...s.investigations, [caseId]: state },
        }));
      },

      discoverItem: (caseId, evidenceId) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: discoverEvidence(inv, evidenceId),
            },
          };
        });
      },

      unlockDocument: (caseId, docId) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv || inv.unlockedDocuments.includes(docId)) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, unlockedDocuments: [...inv.unlockedDocuments, docId] },
            },
          };
        });
      },

      unlockLocation: (caseId, locId) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv || inv.unlockedLocations.includes(locId)) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, unlockedLocations: [...inv.unlockedLocations, locId] },
            },
          };
        });
      },

      discoverTimeline: (caseId, eventId) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv || inv.discoveredTimeline.includes(eventId)) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, discoveredTimeline: [...inv.discoveredTimeline, eventId] },
            },
          };
        });
      },

      addNotebookEntry: (caseId, content, category = "fact") => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          const entry: NotebookEntry = {
            id: generateId("note"),
            content,
            category,
            createdAt: new Date().toISOString(),
          };
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, notebook: [...inv.notebook, entry] },
            },
          };
        });
      },

      addBoardConnection: (caseId, source, target, label) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          const conn: BoardConnection = {
            id: generateId("conn"),
            source,
            target,
            label,
            createdAt: new Date().toISOString(),
          };
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, boardConnections: [...inv.boardConnections, conn] },
            },
          };
        });
      },

      addInterrogationMessage: (caseId, suspectId, role, content, meta) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          const history = inv.interrogations[suspectId] ?? [];
          const msg = {
            id: generateId("msg"),
            role,
            content,
            timestamp: new Date().toISOString(),
            ...meta,
          };
          return {
            investigations: {
              ...s.investigations,
              [caseId]: {
                ...inv,
                interrogations: {
                  ...inv.interrogations,
                  [suspectId]: [...history, msg],
                },
              },
            },
          };
        });
      },

      incrementQuestions: (caseId) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, questionsAsked: inv.questionsAsked + 1 },
            },
          };
        });
      },

      markContradiction: (caseId, eventId) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv || inv.contradictionsFound.includes(eventId)) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: {
                ...inv,
                contradictionsFound: [...inv.contradictionsFound, eventId],
              },
            },
          };
        });
      },

      setTheoryNotes: (caseId, notes) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: { ...inv, theoryNotes: notes },
            },
          };
        });
      },

      searchLocation: (caseId, locationId) => {
        const caseData = getCaseById(caseId);
        if (!caseData) return;
        const loc = caseData.locations.find((l) => l.id === locationId);
        if (!loc) return;

        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          let updated = { ...inv };
          if (!updated.searchesCompleted.includes(locationId)) {
            updated.searchesCompleted = [...updated.searchesCompleted, locationId];
          }
          if (!updated.unlockedLocations.includes(locationId)) {
            updated.unlockedLocations = [...updated.unlockedLocations, locationId];
          }
          for (const eid of loc.evidenceIds) {
            const ev = caseData.evidence.find((e) => e.id === eid);
            if (ev && (ev.discoveredByDefault || !ev.hidden)) {
              updated = discoverEvidence(updated, eid);
            } else if (ev?.hidden && updated.searchesCompleted.includes(locationId)) {
              updated = discoverEvidence(updated, eid);
            }
          }
          for (const ev of caseData.evidence) {
            if (ev.hidden && ev.unlockCondition?.toLowerCase().includes("search")) {
              updated = discoverEvidence(updated, ev.id);
            }
          }
          for (const doc of caseData.documents) {
            if (doc.classified && !updated.unlockedDocuments.includes(doc.id)) {
              updated.unlockedDocuments = [...updated.unlockedDocuments, doc.id];
            }
          }
          return { investigations: { ...s.investigations, [caseId]: updated } };
        });
      },

      requestWarrant: (caseId, target) => {
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          const updated = {
            ...inv,
            warrantsRequested: [...inv.warrantsRequested, target],
          };
          const caseData = getCaseById(caseId);
          if (caseData) {
            let state = updated;
            for (const ev of caseData.evidence) {
              if (
                ev.hidden &&
                ev.unlockCondition &&
                (ev.unlockCondition.toLowerCase().includes("warrant") ||
                  ev.unlockCondition.toLowerCase().includes(target.toLowerCase()))
              ) {
                state = discoverEvidence(state, ev.id);
              }
            }
            for (const doc of caseData.documents) {
              if (doc.classified) {
                state.unlockedDocuments = [...state.unlockedDocuments, doc.id];
              }
            }
            for (const tl of caseData.timeline) {
              if (!tl.known) {
                state.discoveredTimeline = [...state.discoveredTimeline, tl.id];
              }
            }
            return { investigations: { ...s.investigations, [caseId]: state } };
          }
          return { investigations: { ...s.investigations, [caseId]: updated } };
        });
      },

      submitAccusation: (caseId, data) => {
        const caseData = getCaseById(caseId);
        if (!caseData) return;
        set((s) => {
          const inv = s.investigations[caseId];
          if (!inv) return s;
          const withAccusation = {
            ...inv,
            chargesheetSubmitted: true,
            completed: true,
            finalAccusation: { ...data, submittedAt: new Date().toISOString() },
          };
          const verdict = evaluateVerdict(caseData, withAccusation);
          const completed = verdict.success
            ? [...new Set([...s.completedCases, caseId])]
            : s.completedCases;
          return {
            completedCases: completed,
            caseScores: { ...s.caseScores, [caseId]: verdict.score },
            investigations: {
              ...s.investigations,
              [caseId]: { ...withAccusation, verdict },
            },
            activeTab: "verdict" as DashboardTab,
          };
        });
      },
    }),
    {
      name: "case-files-save",
      partialize: (state) => ({
        completedCases: state.completedCases,
        caseScores: state.caseScores,
        investigations: state.investigations,
        guestId: state.guestId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.guestId) {
          state.guestId = ensureGuestId();
        }
      },
    }
  )
);
