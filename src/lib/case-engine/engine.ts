import type {
  InvestigationCase,
  InvestigationState,
  PersonProfile,
} from "@/types/case";

export { evaluateVerdict } from "./verdict";

export function getCaseById(cases: InvestigationCase[], id: string) {
  return cases.find((c) => c.meta.id === id);
}

export function getPersonById(caseData: InvestigationCase, id: string) {
  return [...caseData.suspects, ...caseData.witnesses, caseData.victim as unknown as PersonProfile].find(
    (p) => p?.id === id
  );
}

export function getDiscoveredEvidence(caseData: InvestigationCase, state: InvestigationState) {
  return caseData.evidence.filter(
    (e) => e.discoveredByDefault || state.discoveredEvidence.includes(e.id)
  );
}

export function getUnlockedDocuments(caseData: InvestigationCase, state: InvestigationState) {
  return caseData.documents.filter(
    (d) => !d.classified || state.unlockedDocuments.includes(d.id)
  );
}

export function discoverEvidence(state: InvestigationState, evidenceId: string): InvestigationState {
  if (state.discoveredEvidence.includes(evidenceId)) return state;
  return {
    ...state,
    discoveredEvidence: [...state.discoveredEvidence, evidenceId],
  };
}

export function unlockDocument(state: InvestigationState, docId: string): InvestigationState {
  if (state.unlockedDocuments.includes(docId)) return state;
  return {
    ...state,
    unlockedDocuments: [...state.unlockedDocuments, docId],
  };
}

export function createInitialState(caseId: string, caseData: InvestigationCase): InvestigationState {
  const defaultEvidence = caseData.evidence.filter((e) => e.discoveredByDefault).map((e) => e.id);
  const defaultDocs = caseData.documents.filter((d) => !d.classified).map((d) => d.id);
  const knownTimeline = caseData.timeline.filter((t) => t.known).map((t) => t.id);
  const defaultLocations = caseData.locations.filter((l) => l.unlocked).map((l) => l.id);

  return {
    caseId,
    startedAt: new Date().toISOString(),
    discoveredEvidence: defaultEvidence,
    unlockedDocuments: defaultDocs,
    unlockedLocations: defaultLocations,
    discoveredTimeline: knownTimeline,
    notebook: [],
    boardConnections: [],
    interrogations: {},
    questionsAsked: 0,
    wrongAccusations: 0,
    contradictionsFound: [],
    warrantsRequested: [],
    searchesCompleted: [],
    theoryNotes: "",
    chargesheetSubmitted: false,
    completed: false,
  };
}

export function getKnownFacts(caseData: InvestigationCase, state: InvestigationState): string[] {
  const evidence = getDiscoveredEvidence(caseData, state);
  const timeline = caseData.timeline.filter((t) => state.discoveredTimeline.includes(t.id));

  return [
    `Victim: ${caseData.victim.name}, ${caseData.victim.occupation}`,
    `Crime: ${caseData.meta.crimeType} at ${caseData.meta.location}`,
    ...evidence.slice(0, 8).map((e) => `${e.title}: ${e.description.slice(0, 120)}`),
    ...timeline.slice(0, 5).map((t) => `${t.timestamp}: ${t.title}`),
  ];
}

export function calculatePolicePressure(
  historyLength: number,
  presentedEvidence: boolean,
  aggressiveQuestion: boolean
): number {
  let pressure = Math.min(10, 2 + Math.floor(historyLength / 3));
  if (presentedEvidence) pressure += 2;
  if (aggressiveQuestion) pressure += 1;
  return Math.min(10, pressure);
}

export function isAggressiveQuestion(question: string): boolean {
  return /why did you lie|confess|guilty|killer|murderer|prove it|lying|liar/i.test(question);
}
