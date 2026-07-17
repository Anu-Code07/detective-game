import type {
  CaseDocument,
  CaseMeta,
  EvidenceItem,
  InvestigationCase,
  PersonProfile,
  TimelineEvent,
  VictimProfile,
} from "@/types/case";

type CaseInput = Omit<InvestigationCase, "meta"> & { meta: Omit<CaseMeta, "order"> };

export function defineCase(order: number, data: CaseInput): InvestigationCase {
  return {
    ...data,
    meta: { ...data.meta, order },
  };
}

export function doc(
  partial: Omit<CaseDocument, "classified"> & { classified?: boolean }
): CaseDocument {
  return { classified: false, ...partial };
}

export function evidence(partial: EvidenceItem): EvidenceItem {
  return partial;
}

export function suspect(partial: Omit<PersonProfile, "role">): PersonProfile {
  return { ...partial, role: "suspect" };
}

export function witness(partial: Omit<PersonProfile, "role">): PersonProfile {
  return { ...partial, role: "witness" };
}

export function timelineEvent(partial: TimelineEvent): TimelineEvent {
  return partial;
}

export function victim(partial: VictimProfile): VictimProfile {
  return partial;
}

export function firContent(
  caseTitle: string,
  ref: string,
  details: {
    complainant: string;
    victim: string;
    location: string;
    datetime: string;
    narrative: string;
  }
): string {
  return `FIRST INFORMATION REPORT
Ref: ${ref}
Case: ${caseTitle}

Date/Time of Report: ${details.datetime}
Reporting Officer: Detective Bureau

COMPLAINANT: ${details.complainant}
VICTIM: ${details.victim}
LOCATION: ${details.location}

NARRATIVE:
${details.narrative}

STATUS: Under Active Investigation
CLASSIFICATION: Homicide — Priority One`;
}

export function autopsyContent(
  victimName: string,
  details: {
    ref: string;
    date: string;
    cause: string;
    timeOfDeath: string;
    findings: string[];
  }
): string {
  return `MEDICAL EXAMINER'S REPORT
Ref: ${details.ref}
Subject: ${victimName}
Exam Date: ${details.date}

CAUSE OF DEATH: ${details.cause}
ESTIMATED TIME OF DEATH: ${details.timeOfDeath}

FINDINGS:
${details.findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Signed: Dr. Elena Marsh, Chief Medical Examiner`;
}
