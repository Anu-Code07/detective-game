import type { DashboardTab, InvestigationCase, InvestigationState } from "@/types/case";
import {
  getAvailableLeads,
  getLeadsForCase,
  getUnlockDestination,
} from "@/lib/case-engine/evidence-unlocks";

export interface GameObjective {
  hint: string;
  tab: DashboardTab;
  actionLabel: string;
  leadId?: string;
  suspectId?: string;
  locationId?: string;
}

export function getInvestigationProgress(
  caseData: InvestigationCase,
  investigation: InvestigationState | null
) {
  if (!investigation) {
    const defaultCount = caseData.evidence.filter((e) => e.discoveredByDefault).length;
    return { exhibits: 0, total: caseData.evidence.length, leadsSolved: 0, totalLeads: 0, pct: 0, defaultCount };
  }
  const discovered = investigation.discoveredEvidence.length;
  const defaultCount = caseData.evidence.filter((e) => e.discoveredByDefault).length;
  const total = caseData.evidence.length;
  const leads = getLeadsForCase(caseData.meta.id);
  const leadsSolved = (investigation.solvedLeads ?? []).length;
  const pct = Math.round((discovered / Math.max(total, 1)) * 100);

  return { exhibits: discovered, total, leadsSolved, totalLeads: leads.length, pct, defaultCount };
}

export function getCurrentObjective(
  caseData: InvestigationCase,
  investigation: InvestigationState | null,
  navigationHint?: string | null
): GameObjective | null {
  if (!investigation || investigation.completed) return null;

  if (navigationHint) {
    return {
      hint: navigationHint,
      tab: "evidence",
      actionLabel: "Continue",
    };
  }

  const progress = getInvestigationProgress(caseData, investigation);
  const state = { ...investigation, solvedLeads: investigation.solvedLeads ?? [] };

  // First-time flow: briefing → evidence → interrogate guard/witness
  if (progress.exhibits <= progress.defaultCount && investigation.questionsAsked === 0) {
    if (progress.exhibits < progress.defaultCount) {
      return {
        hint: "Review the case briefing, then check the evidence locker for initial exhibits.",
        tab: "overview",
        actionLabel: "Read Briefing",
      };
    }
    const firstWitness =
      caseData.witnesses[0] ?? caseData.suspects.find((s) => !s.isGuilty) ?? caseData.suspects[0];
    return {
      hint: `Examine recovered exhibits, then interrogate ${firstWitness?.name ?? "a witness"} about the night of the crime.`,
      tab: "evidence",
      actionLabel: "Evidence Locker",
      suspectId: firstWitness?.id,
    };
  }

  if (investigation.questionsAsked === 0 && progress.exhibits > 0) {
    const guard =
      caseData.witnesses.find((w) => /guard|security|patrol/i.test(w.occupation)) ??
      caseData.witnesses[0];
    return {
      hint: `Someone at the scene knows more. Interrogate ${guard?.name ?? "a witness"} about what they saw.`,
      tab: "interrogate",
      actionLabel: `Interrogate ${guard?.name ?? "Witness"}`,
      suspectId: guard?.id,
    };
  }

  const available = getAvailableLeads(caseData, state);
  if (available.length > 0) {
    const lead = available[0];
    const dest = getUnlockDestination(caseData, state, lead.evidenceId);
    return {
      hint: dest.hint,
      tab: dest.tab,
      actionLabel: dest.actionLabel,
      leadId: lead.id,
      suspectId: dest.suspectId,
      locationId: dest.locationId,
    };
  }

  const sealed = caseData.evidence.filter(
    (e) => !investigation.discoveredEvidence.includes(e.id)
  );
  if (sealed.length > 0) {
    const dest = getUnlockDestination(caseData, state, sealed[0].id);
    return {
      hint: `Outstanding exhibit: ${sealed[0].title}. ${dest.hint}`,
      tab: dest.tab,
      actionLabel: dest.actionLabel,
      leadId: dest.leadId,
      suspectId: dest.suspectId,
      locationId: dest.locationId,
    };
  }

  if (progress.pct >= 60 && !investigation.chargesheetSubmitted) {
    return {
      hint: "You have enough evidence to build a theory. File your chargesheet when ready.",
      tab: "chargesheet",
      actionLabel: "File Chargesheet",
    };
  }

  if (investigation.boardConnections.length < 2) {
    return {
      hint: "Connect suspects, evidence, and timeline events on the case board to sharpen your theory.",
      tab: "board",
      actionLabel: "Open Case Board",
    };
  }

  return {
    hint: "Cross-check documents, timeline, and interrogation notes. Something doesn't add up.",
    tab: "documents",
    actionLabel: "Review Documents",
  };
}
