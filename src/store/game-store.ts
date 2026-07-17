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
import { createInitialState, discoverEvidence, evaluateVerdict, unlockDocument } from "@/lib/case-engine/engine";
import { getContradictionUnlockEvidence } from "@/lib/case-engine/contradictions";
import {
  getLeadsForCase,
  getUnlockDestination,
  matchInterrogationUnlock,
  validateLeadAnswer,
  type EvidenceUnlockLead,
} from "@/lib/case-engine/evidence-unlocks";
import { getCaseById } from "@/lib/cases";
import { generateId } from "@/lib/utils";

interface Celebration {
  title: string;
  subtitle: string;
}

interface GameStore extends PlayerProgress {
  activeCaseId: string | null;
  activeTab: DashboardTab;
  guestId: string;
  focusLeadId: string | null;
  focusSuspectId: string | null;
  focusLocationId: string | null;
  navigationHint: string | null;
  celebration: Celebration | null;
  pendingContradiction: {
    timelineEventId: string;
    title: string;
    message: string;
    personId: string;
  } | null;
  setActiveCase: (caseId: string) => void;
  setActiveTab: (tab: DashboardTab) => void;
  clearNavigationFocus: () => void;
  navigateToUnlock: (caseId: string, evidenceId: string) => void;
  getInvestigation: (caseId: string) => InvestigationState | null;
  startCase: (caseId: string) => void;
  discoverItem: (caseId: string, evidenceId: string) => void;
  solveLeadAnswer: (caseId: string, leadId: string, optionIndex: number) => { correct: boolean; evidenceTitle?: string };
  tryInterrogationUnlock: (caseId: string, suspectId: string, question: string) => string | null;
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
    data: {
      accusedId: string;
      charges: string[];
      evidence: string[];
      motive?: string;
      opportunity?: string;
      method?: string;
      summary?: string;
      isQuickGuess?: boolean;
    }
  ) => void;
  searchLocation: (caseId: string, locationId: string) => void;
  requestWarrant: (caseId: string, target: string) => void;
  resetCase: (caseId: string) => void;
  showCelebration: (title: string, subtitle?: string) => void;
  dismissCelebration: () => void;
  dismissTutorial: () => void;
  setTheorySuspect: (caseId: string, suspectId: string) => void;
  requestHint: (caseId: string, prideCost: number) => void;
  setPendingContradiction: (data: GameStore["pendingContradiction"]) => void;
  presentContradiction: (caseId: string, timelineEventId: string) => void;
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

function applyLeadUnlock(
  state: InvestigationState,
  lead: EvidenceUnlockLead,
  caseData: ReturnType<typeof getCaseById>
): InvestigationState {
  if (!caseData) return state;

  let updated = discoverEvidence(state, lead.evidenceId);
  const solvedLeads = updated.solvedLeads ?? [];
  if (!solvedLeads.includes(lead.id)) {
    updated = { ...updated, solvedLeads: [...solvedLeads, lead.id] };
  }

  const ev = caseData.evidence.find((e) => e.id === lead.evidenceId);
  if (ev?.documentId) {
    updated = unlockDocument(updated, ev.documentId);
  }

  for (const tl of caseData.timeline) {
    if (tl.evidence.includes(lead.evidenceId) && !updated.discoveredTimeline.includes(tl.id)) {
      updated = { ...updated, discoveredTimeline: [...updated.discoveredTimeline, tl.id] };
    }
  }

  return updated;
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
      focusLeadId: null,
      focusSuspectId: null,
      focusLocationId: null,
      navigationHint: null,
      celebration: null,
      pendingContradiction: null,
      tutorialDismissed: false,
      theorySuspects: {},
      hintsUsed: {},
      detectivePride: 100,

      showCelebration: (title, subtitle = "Logged in evidence locker and chain of custody.") =>
        set({ celebration: { title, subtitle } }),
      dismissCelebration: () => set({ celebration: null }),
      dismissTutorial: () => set({ tutorialDismissed: true }),
      setTheorySuspect: (caseId, suspectId) =>
        set((s) => ({
          theorySuspects: { ...s.theorySuspects, [caseId]: suspectId },
        })),
      requestHint: (caseId, prideCost) =>
        set((s) => ({
          hintsUsed: { ...(s.hintsUsed ?? {}), [caseId]: (s.hintsUsed?.[caseId] ?? 0) + 1 },
          detectivePride: Math.max(0, (s.detectivePride ?? 100) - prideCost),
        })),
      setPendingContradiction: (data) => set({ pendingContradiction: data }),
      presentContradiction: (caseId, timelineEventId) => {
        const caseData = getCaseById(caseId);
        const inv = get().investigations[caseId];
        if (!inv || inv.contradictionsFound.includes(timelineEventId)) {
          set({ pendingContradiction: null });
          return;
        }
        let updated = {
          ...inv,
          contradictionsFound: [...inv.contradictionsFound, timelineEventId],
        };
        let celebrationTitle: string | null = null;
        if (caseData) {
          const evidenceId = getContradictionUnlockEvidence(caseData, timelineEventId);
          if (evidenceId && !updated.discoveredEvidence.includes(evidenceId)) {
            updated = discoverEvidence(updated, evidenceId);
            celebrationTitle = caseData.evidence.find((e) => e.id === evidenceId)?.title ?? null;
          }
        }
        set({
          investigations: { ...get().investigations, [caseId]: updated },
          pendingContradiction: null,
        });
        if (celebrationTitle) {
          get().showCelebration(celebrationTitle, "Contradiction exposed — new exhibit recovered.");
        } else {
          get().showCelebration("Contradiction Logged", "Timeline conflict added to your case file.");
        }
      },

      setActiveCase: (caseId) => set({ activeCaseId: caseId }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      clearNavigationFocus: () =>
        set({
          focusLeadId: null,
          focusSuspectId: null,
          focusLocationId: null,
          navigationHint: null,
        }),

      navigateToUnlock: (caseId, evidenceId) => {
        const caseData = getCaseById(caseId);
        const inv = get().investigations[caseId];
        if (!caseData || !inv) return;

        const dest = getUnlockDestination(caseData, inv, evidenceId);
        set({
          activeTab: dest.tab,
          focusLeadId: dest.leadId ?? null,
          focusSuspectId: dest.suspectId ?? null,
          focusLocationId: dest.locationId ?? null,
          navigationHint: dest.hint,
        });
      },

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

      solveLeadAnswer: (caseId, leadId, optionIndex) => {
        const caseData = getCaseById(caseId);
        if (!caseData) return { correct: false };

        const inv = get().investigations[caseId];
        if (!inv) return { correct: false };

        const lead = getLeadsForCase(caseId).find((l) => l.id === leadId);
        if (!lead) return { correct: false };

        const correct = validateLeadAnswer(lead, optionIndex);
        if (!correct) return { correct: false };

        const evidenceTitle = caseData.evidence.find((e) => e.id === lead.evidenceId)?.title;

        set((s) => {
          const current = s.investigations[caseId];
          if (!current) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: applyLeadUnlock(current, lead, caseData),
            },
          };
        });

        if (evidenceTitle) {
          get().showCelebration(evidenceTitle, "Deduction confirmed — exhibit added to case file.");
        }

        return { correct: true, evidenceTitle };
      },

      tryInterrogationUnlock: (caseId, suspectId, question) => {
        const caseData = getCaseById(caseId);
        const inv = get().investigations[caseId];
        if (!caseData || !inv) return null;

        const state = { ...inv, solvedLeads: inv.solvedLeads ?? [] };
        const lead = matchInterrogationUnlock(caseData, state, suspectId, question);
        if (!lead) return null;

        const evidenceTitle = caseData.evidence.find((e) => e.id === lead.evidenceId)?.title ?? null;

        set((s) => {
          const current = s.investigations[caseId];
          if (!current) return s;
          return {
            investigations: {
              ...s.investigations,
              [caseId]: applyLeadUnlock(current, lead, caseData),
            },
          };
        });

        if (evidenceTitle) {
          get().showCelebration(evidenceTitle, "They cracked under pressure — new evidence recovered.");
        }

        return evidenceTitle;
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
            if (ev && (ev.discoveredByDefault || (!ev.hidden && !getLeadsForCase(caseId).some((l) => l.evidenceId === eid)))) {
              updated = discoverEvidence(updated, eid);
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
            const state = updated;
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
          if (!inv || inv.completed) return s;
          const withAccusation = {
            ...inv,
            chargesheetSubmitted: true,
            completed: true,
            finalAccusation: { ...data, submittedAt: new Date().toISOString() },
          };
          const verdict = evaluateVerdict(
            caseData,
            withAccusation,
            get().theorySuspects?.[caseId]
          );
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

      resetCase: (caseId) => {
        const caseData = getCaseById(caseId);
        if (!caseData) return;
        const state = createInitialState(caseId, caseData);
        set((s) => ({
          completedCases: s.completedCases.filter((id) => id !== caseId),
          caseScores: Object.fromEntries(
            Object.entries(s.caseScores).filter(([id]) => id !== caseId)
          ),
          investigations: { ...s.investigations, [caseId]: state },
          activeCaseId: caseId,
          activeTab: "overview",
        }));
      },
    }),
    {
      name: "case-files-save",
      partialize: (state) => ({
        completedCases: state.completedCases,
        caseScores: state.caseScores,
        investigations: state.investigations,
        guestId: state.guestId,
        tutorialDismissed: state.tutorialDismissed,
        theorySuspects: state.theorySuspects,
        hintsUsed: state.hintsUsed,
        detectivePride: state.detectivePride,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.guestId) {
          state.guestId = ensureGuestId();
        }
        if (state?.investigations) {
          for (const caseId of Object.keys(state.investigations)) {
            const inv = state.investigations[caseId];
            if (inv && !inv.solvedLeads) {
              inv.solvedLeads = [];
            }
          }
        }
        if (state && state.tutorialDismissed === undefined) state.tutorialDismissed = false;
        if (state && !state.theorySuspects) state.theorySuspects = {};
        if (state && !state.hintsUsed) state.hintsUsed = {};
        if (state && state.detectivePride === undefined) state.detectivePride = 100;
      },
    }
  )
);
