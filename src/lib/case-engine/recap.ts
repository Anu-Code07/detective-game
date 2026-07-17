import type { InvestigationCase, VerdictTier } from "@/types/case";

export function generateCaseRecap(
  caseData: InvestigationCase,
  tier: VerdictTier,
  accusedId?: string
): string[] | null {
  const goodTiers: VerdictTier[] = ["master_detective", "solid_case"];
  if (!goodTiers.includes(tier)) return null;

  const guilty = caseData.suspects.find((s) => s.id === caseData.solution.guiltyPartyId);
  const accused = caseData.suspects.find((s) => s.id === accusedId);
  const victim = caseData.victim;
  const { solution } = caseData;

  if (!guilty) return null;

  return [
    `On ${caseData.meta.date}, ${victim.name} was found dead at ${caseData.meta.location}.`,
    `${guilty.name}, ${guilty.occupation}, had motive: ${solution.motive.slice(0, 120)}${solution.motive.length > 120 ? "…" : ""}`,
    `The killer seized their opportunity ${solution.opportunity.slice(0, 100)}${solution.opportunity.length > 100 ? "…" : ""}`,
    `Method: ${solution.method.slice(0, 120)}${solution.method.length > 120 ? "…" : ""}`,
    accused?.id === guilty.id
      ? `You connected the dots. ${guilty.name} was charged and convicted. Case closed.`
      : `The truth: ${guilty.name} committed the crime. Your filing named ${accused?.name ?? "another suspect"}.`,
  ];
}
