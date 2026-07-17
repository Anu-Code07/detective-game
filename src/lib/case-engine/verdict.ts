import type { InvestigationCase, InvestigationState, VerdictResult, VerdictTier } from "@/types/case";

function fieldMatchScore(playerText: string | undefined, solutionText: string): number {
  if (!playerText?.trim()) return 0;
  const player = playerText.toLowerCase();
  const keywords = solutionText
    .toLowerCase()
    .split(/[\s,;.]+/)
    .filter((w) => w.length > 4);
  if (keywords.length === 0) return player.length > 20 ? 50 : 0;
  const hits = keywords.filter((k) => player.includes(k)).length;
  return Math.min(100, Math.round((hits / keywords.length) * 100));
}

function isQuickGuess(
  accusation: NonNullable<InvestigationState["finalAccusation"]>
): boolean {
  const hasEvidence = accusation.evidence.length > 0;
  const hasMotive = (accusation.motive?.trim().length ?? 0) >= 15;
  const hasOpportunity = (accusation.opportunity?.trim().length ?? 0) >= 15;
  const hasMethod = (accusation.method?.trim().length ?? 0) >= 15;
  return accusation.isQuickGuess || (!hasEvidence && !hasMotive && !hasOpportunity && !hasMethod);
}

const TIER_COPY: Record<VerdictTier, { label: string; message: string }> = {
  master_detective: {
    label: "Elite Detective",
    message:
      "Textbook investigation. Correct suspect, solid motive, method, opportunity, and evidence. The kind of case file they teach at the academy.",
  },
  solid_case: {
    label: "By The Book",
    message:
      "Good police work. Your charges hold up in court even if a few details could be tighter.",
  },
  lucky_guess: {
    label: "Lucky Guess",
    message:
      "You named the right person — but nothing in your filing proves you actually solved it. A real detective documents motive, method, and evidence. The court isn't impressed.",
  },
  failed_prosecution: {
    label: "Case Collapses",
    message:
      "Right suspect on paper, but your case falls apart under cross-examination. Not enough proof.",
  },
  wrong_accusation: {
    label: "Wrong Person",
    message:
      "You accused an innocent party. The real killer walks free while you explain yourself to Internal Affairs.",
  },
};

export function evaluateVerdict(
  caseData: InvestigationCase,
  state: InvestigationState
): VerdictResult {
  const { solution } = caseData;
  const accusation = state.finalAccusation;

  if (!accusation) {
    return emptyVerdict("No accusation submitted.");
  }

  const correctAccused = accusation.accusedId === solution.guiltyPartyId;
  const presentedEvidence = accusation.evidence;
  const requiredHits = solution.requiredEvidence.filter((id) => presentedEvidence.includes(id));
  const evidenceQuality = Math.round(
    (requiredHits.length / Math.max(solution.requiredEvidence.length, 1)) * 100
  );

  const rejectedEvidence = presentedEvidence.filter((id) => {
    const item = caseData.evidence.find((e) => e.id === id);
    return item?.significance === "red_herring";
  });

  const hasCriticalEvidence = solution.requiredEvidence.every((id) =>
    presentedEvidence.includes(id)
  );

  const motiveScore = fieldMatchScore(accusation.motive, solution.motive);
  const opportunityScore = fieldMatchScore(accusation.opportunity, solution.opportunity);
  const methodScore = fieldMatchScore(accusation.method, solution.method);
  const theoryScore = Math.round((motiveScore + opportunityScore + methodScore) / 3);

  const contradictionBonus = state.contradictionsFound.filter((c) =>
    solution.criticalContradictions.includes(c)
  ).length;

  const hiddenFound = caseData.hiddenClues.filter((id) =>
    state.discoveredEvidence.includes(id)
  ).length;

  const timeMs = Date.now() - new Date(state.startedAt).getTime();
  const hours = timeMs / (1000 * 60 * 60);
  const efficiency = Math.max(0, Math.min(100, Math.round(100 - hours * 8)));

  const quickGuess = isQuickGuess(accusation);

  let tier: VerdictTier;
  if (!correctAccused) {
    tier = "wrong_accusation";
  } else if (quickGuess) {
    tier = "lucky_guess";
  } else if (hasCriticalEvidence && theoryScore >= 40 && evidenceQuality >= 70) {
    tier = "master_detective";
  } else if (correctAccused && (evidenceQuality >= 50 || theoryScore >= 35)) {
    tier = "solid_case";
  } else {
    tier = "failed_prosecution";
  }

  const success = tier === "master_detective" || tier === "solid_case";

  const logic = Math.min(
    100,
    Math.round(
      theoryScore * 0.35 +
        evidenceQuality * 0.35 +
        contradictionBonus * 10 +
        (correctAccused ? 20 : 0) -
        (quickGuess ? 30 : 0)
    )
  );

  const accuracy = correctAccused
    ? quickGuess
      ? 45
      : hasCriticalEvidence
        ? 95
        : 70
    : 10;

  const courtSuccess =
    tier === "master_detective"
      ? 98
      : tier === "solid_case"
        ? 82
        : tier === "lucky_guess"
          ? 25
          : tier === "failed_prosecution"
            ? 40
            : 5;

  let score = Math.round(
    logic * 0.25 +
      evidenceQuality * 0.25 +
      theoryScore * 0.15 +
      efficiency * 0.1 +
      accuracy * 0.15 +
      courtSuccess * 0.1 -
      state.wrongAccusations * 8 -
      rejectedEvidence.length * 5
  );

  if (tier === "lucky_guess") score = Math.min(score, 42);
  if (tier === "master_detective") score = Math.max(score, 78);

  const feedback: string[] = [];
  const defenseChallenges: string[] = [];
  const copy = TIER_COPY[tier];

  feedback.push(copy.message);

  if (!correctAccused) {
    feedback.push("The accused had a verified alibi or lacked motive you could prove.");
    defenseChallenges.push("Defense: My client wasn't at the scene. Your theory is speculation.");
  } else if (quickGuess) {
    feedback.push("You pointed at the killer without building a case. That's instinct — not investigation.");
    defenseChallenges.push("Defense: The prosecution has no chain of evidence — only a hunch.");
  } else {
    if (motiveScore >= 50) feedback.push("Motive established convincingly.");
    else if (accusation.motive?.trim()) feedback.push("Motive stated but weak — doesn't fully match the evidence.");
    else feedback.push("Motive not articulated in your chargesheet.");

    if (methodScore >= 50) feedback.push("Method of crime correctly described.");
    if (opportunityScore >= 50) feedback.push("Opportunity and timeline align with evidence.");

    if (hasCriticalEvidence) feedback.push("Critical exhibits submitted — chain of custody intact.");
    else feedback.push("Missing key exhibits. The judge needs more than circumstantial links.");
  }

  if (rejectedEvidence.length > 0) {
    feedback.push(`${rejectedEvidence.length} exhibit(s) ruled inadmissible or misleading.`);
    defenseChallenges.push("Defense: Several exhibits are compromised or irrelevant.");
  }

  if (contradictionBonus > 0) {
    feedback.push(`You exposed ${contradictionBonus} critical contradiction(s) — strong detective work.`);
  }

  if (hiddenFound > 0 && !quickGuess) {
    feedback.push(`You uncovered ${hiddenFound} hidden clue(s) that strengthened your case.`);
  }

  if (tier === "master_detective") {
    feedback.push("CASE CLOSED — Guilt proven beyond reasonable doubt. Outstanding work, Detective.");
  } else if (tier === "solid_case") {
    feedback.push("CASE CLOSED — Conviction secured.");
  } else if (tier === "lucky_guess") {
    feedback.push("The killer was right — but you won't get a conviction like this. Rebuild your case and try again.");
  } else if (tier === "failed_prosecution") {
    feedback.push("CASE DISMISSED — Insufficient proof despite naming a suspect.");
  } else {
    feedback.push("CASE UNSOLVED — The perpetrator walks free.");
  }

  return {
    success,
    score: Math.max(0, Math.min(100, score)),
    tier,
    tierLabel: copy.label,
    tierMessage: copy.message,
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

function emptyVerdict(msg: string): VerdictResult {
  return {
    success: false,
    score: 0,
    tier: "wrong_accusation",
    tierLabel: "No Filing",
    tierMessage: msg,
    grades: { logic: 0, evidenceQuality: 0, efficiency: 0, accuracy: 0, courtSuccess: 0 },
    feedback: [msg],
    rejectedEvidence: [],
    defenseChallenges: [],
  };
}