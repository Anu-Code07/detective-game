import type {
  InvestigationCase,
  InvestigationState,
  PersonProfile,
  VerdictResult,
} from "@/types/case";

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

export function evaluateVerdict(
  caseData: InvestigationCase,
  state: InvestigationState
): VerdictResult {
  const { solution } = caseData;
  const accusation = state.finalAccusation;

  if (!accusation) {
    return {
      success: false,
      score: 0,
      grades: { logic: 0, evidenceQuality: 0, efficiency: 0, accuracy: 0, courtSuccess: 0 },
      feedback: ["No accusation submitted."],
      rejectedEvidence: [],
      defenseChallenges: [],
    };
  }

  const correctAccused = accusation.accusedId === solution.guiltyPartyId;
  const presentedEvidence = accusation.evidence;
  const requiredHits = solution.requiredEvidence.filter((id) => presentedEvidence.includes(id));
  const evidenceQuality = Math.round(
    (requiredHits.length / solution.requiredEvidence.length) * 100
  );

  const rejectedEvidence = presentedEvidence.filter(
    (id) => {
      const item = caseData.evidence.find((e) => e.id === id);
      return item?.significance === "red_herring";
    }
  );

  const hasCriticalEvidence = solution.requiredEvidence.every((id) =>
    presentedEvidence.includes(id)
  );

  const contradictionBonus = state.contradictionsFound.filter((c) =>
    solution.criticalContradictions.includes(c)
  ).length;

  const hiddenFound = caseData.hiddenClues.filter((id) =>
    state.discoveredEvidence.includes(id)
  ).length;

  const timeMs = Date.now() - new Date(state.startedAt).getTime();
  const hours = timeMs / (1000 * 60 * 60);
  const efficiency = Math.max(0, Math.min(100, Math.round(100 - hours * 8)));

  const accuracy = correctAccused ? (hasCriticalEvidence ? 95 : 70) : 15;
  const logic = Math.min(
    100,
    Math.round(evidenceQuality * 0.5 + contradictionBonus * 15 + (correctAccused ? 25 : 0))
  );

  const courtSuccess = correctAccused && hasCriticalEvidence && rejectedEvidence.length === 0 ? 95 : correctAccused ? 60 : 10;

  const success = correctAccused && hasCriticalEvidence && evidenceQuality >= 70;

  const score = Math.round(
    logic * 0.25 +
      evidenceQuality * 0.25 +
      efficiency * 0.1 +
      accuracy * 0.2 +
      courtSuccess * 0.2 -
      state.wrongAccusations * 10 -
      rejectedEvidence.length * 5
  );

  const feedback: string[] = [];
  const defenseChallenges: string[] = [];

  if (!correctAccused) {
    feedback.push("You accused the wrong person. The real perpetrator's timeline remains unchallenged.");
    defenseChallenges.push("Defense: Your theory fails to account for the accused's verified alibi.");
  } else {
    feedback.push("Correct suspect identified.");
  }

  if (!hasCriticalEvidence) {
    feedback.push("Insufficient critical evidence presented. The judge cannot proceed beyond reasonable doubt.");
    defenseChallenges.push("Defense: Circumstantial evidence only — no direct link to the crime.");
  }

  if (rejectedEvidence.length > 0) {
    feedback.push(`${rejectedEvidence.length} piece(s) of evidence were ruled inadmissible or misleading.`);
    defenseChallenges.push("Defense: Key exhibits are compromised or irrelevant.");
  }

  if (contradictionBonus > 0) {
    feedback.push(`You exposed ${contradictionBonus} critical contradiction(s) in testimony.`);
  }

  if (hiddenFound > 0) {
    feedback.push(`You uncovered ${hiddenFound} hidden clue(s) others might have missed.`);
  }

  if (success) {
    feedback.push("CASE CLOSED — Guilt proven beyond reasonable doubt.");
  } else if (correctAccused) {
    feedback.push("Partial success — charges may not hold up in court.");
  } else {
    feedback.push("CASE UNSOLVED — The perpetrator walks free.");
  }

  return {
    success,
    score: Math.max(0, Math.min(100, score)),
    grades: {
      logic,
      evidenceQuality,
      efficiency,
      accuracy,
      courtSuccess,
    },
    feedback,
    rejectedEvidence,
    defenseChallenges,
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
