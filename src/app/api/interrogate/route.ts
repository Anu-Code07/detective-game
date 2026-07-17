import { NextRequest, NextResponse } from "next/server";
import { generateSuspectReply } from "@/lib/ai/interrogation";
import {
  calculatePolicePressure,
  getKnownFacts,
  isAggressiveQuestion,
} from "@/lib/case-engine/engine";
import { getCaseById } from "@/lib/cases";
import type { InvestigationState } from "@/types/case";

interface InvestigationSnapshot {
  discoveredEvidence?: string[];
  unlockedDocuments?: string[];
  unlockedLocations?: string[];
  discoveredTimeline?: string[];
  contradictionsFound?: string[];
  questionsAsked?: number;
}

function buildInvestigationState(
  caseId: string,
  caseData: ReturnType<typeof getCaseById>,
  snapshot?: InvestigationSnapshot
): InvestigationState {
  const defaultEvidence = caseData?.evidence.filter((e) => e.discoveredByDefault).map((e) => e.id) ?? [];
  const defaultTimeline = caseData?.timeline.filter((t) => t.known).map((t) => t.id) ?? [];

  return {
    caseId,
    startedAt: new Date().toISOString(),
    discoveredEvidence: snapshot?.discoveredEvidence ?? defaultEvidence,
    unlockedDocuments: snapshot?.unlockedDocuments ?? [],
    unlockedLocations: snapshot?.unlockedLocations ?? [],
    discoveredTimeline: snapshot?.discoveredTimeline ?? defaultTimeline,
    notebook: [],
    boardConnections: [],
    interrogations: {},
    questionsAsked: snapshot?.questionsAsked ?? 0,
    wrongAccusations: 0,
    contradictionsFound: snapshot?.contradictionsFound ?? [],
    warrantsRequested: [],
    searchesCompleted: [],
    theoryNotes: "",
    chargesheetSubmitted: false,
    completed: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      caseId,
      suspectId,
      question,
      history = [],
      presentedEvidenceId,
      investigationSnapshot,
    } = body;

    if (!caseId || !suspectId || !question?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const caseData = getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const suspect = caseData.suspects.find((s) => s.id === suspectId);
    if (!suspect) {
      return NextResponse.json({ error: "Suspect not found" }, { status: 404 });
    }

    const presentedEvidence = presentedEvidenceId
      ? caseData.evidence.find((e) => e.id === presentedEvidenceId)
      : undefined;

    const investigationState = buildInvestigationState(caseId, caseData, investigationSnapshot);

    const pressure = calculatePolicePressure(
      history.length,
      !!presentedEvidence,
      isAggressiveQuestion(question)
    );

    const { reply, emotionalState } = await generateSuspectReply({
      suspect,
      question: question.trim(),
      history,
      presentedEvidence,
      caseContext: {
        caseTitle: caseData.meta.title,
        victimName: caseData.victim.name,
        crimeDate: caseData.meta.date,
        crimeLocation: caseData.meta.location,
        knownFacts: getKnownFacts(caseData, investigationState),
        policePressure: pressure,
      },
    });

    return NextResponse.json({ reply, emotionalState, pressure });
  } catch (err) {
    console.error("Interrogation error:", err);
    return NextResponse.json(
      { error: "Suspect refuses to continue. Try again." },
      { status: 500 }
    );
  }
}
