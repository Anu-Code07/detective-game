import type { InvestigationCase, InvestigationState } from "@/types/case";
import { discoverEvidence, unlockDocument } from "./engine";
import { getLeadsForCase } from "./evidence-unlocks";

/** When a document is opened/unlocked, log any exhibits tied to it */
export function discoverEvidenceForDocument(
  caseData: InvestigationCase,
  state: InvestigationState,
  docId: string
): InvestigationState {
  let updated = state;
  for (const ev of caseData.evidence) {
    if (ev.documentId === docId && !updated.discoveredEvidence.includes(ev.id)) {
      updated = discoverEvidence(updated, ev.id);
    }
  }
  return updated;
}

/** Apply document unlock + linked exhibits in one step */
export function applyDocumentUnlock(
  caseData: InvestigationCase,
  state: InvestigationState,
  docId: string
): InvestigationState {
  let updated = unlockDocument(state, docId);
  updated = discoverEvidenceForDocument(caseData, updated, docId);
  return updated;
}

/** Fix drift: backfill exhibits from unlocked docs and searched locations */
export function reconcileInvestigationState(
  caseData: InvestigationCase,
  state: InvestigationState
): InvestigationState {
  let updated = { ...state, solvedLeads: state.solvedLeads ?? [] };
  const leadEvidenceIds = new Set(getLeadsForCase(caseData.meta.id).map((l) => l.evidenceId));

  for (const docId of updated.unlockedDocuments) {
    updated = discoverEvidenceForDocument(caseData, updated, docId);
  }

  for (const locId of updated.searchesCompleted) {
    const loc = caseData.locations.find((l) => l.id === locId);
    for (const eid of loc?.evidenceIds ?? []) {
      const ev = caseData.evidence.find((e) => e.id === eid);
      if (
        ev &&
        !ev.discoveredByDefault &&
        !leadEvidenceIds.has(eid) &&
        !updated.discoveredEvidence.includes(eid)
      ) {
        // Non-lead location exhibits (e.g. CCTV still on map search)
        if (!ev.hidden || updated.unlockedDocuments.includes(ev.documentId ?? "")) {
          updated = discoverEvidence(updated, eid);
        }
      }
    }
  }

  return updated;
}

export interface ReachabilityIssue {
  caseId: string;
  evidenceId: string;
  title: string;
  reason: string;
}

/** Dev/build guard — every non-default exhibit must have an unlock path */
export function auditEvidenceReachability(caseData: InvestigationCase): ReachabilityIssue[] {
  const issues: ReachabilityIssue[] = [];
  const leadIds = new Set(getLeadsForCase(caseData.meta.id).map((l) => l.evidenceId));
  const locationEvidence = new Set(caseData.locations.flatMap((l) => l.evidenceIds));

  for (const ev of caseData.evidence) {
    if (ev.discoveredByDefault) continue;

    const hasLead = leadIds.has(ev.id);
    const hasDocument = !!ev.documentId;
    const onMap = locationEvidence.has(ev.id);
    const doc = ev.documentId ? caseData.documents.find((d) => d.id === ev.documentId) : undefined;
    const docReachable = hasDocument && (!doc?.classified || true); // warrant unlocks all classified

    if (hasLead) continue;
    if (hasDocument && docReachable) continue;
    if (onMap && !ev.hidden) continue;

    issues.push({
      caseId: caseData.meta.id,
      evidenceId: ev.id,
      title: ev.title,
      reason: hasLead
        ? "ok"
        : `No lead, document=${hasDocument}, map=${onMap}, hidden=${ev.hidden}`,
    });
  }

  return issues;
}
