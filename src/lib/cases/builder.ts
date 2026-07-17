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

REPORTING OFFICER: Detective Bureau — Homicide Unit
Date/Time of Report: ${details.datetime}
Classification: Homicide — Priority One

COMPLAINANT
${details.complainant}

VICTIM
${details.victim}

LOCATION OF INCIDENT
${details.location}

SCENE CONDITIONS
Area secured upon arrival. Evidence preservation protocol initiated. Medical examiner notified. Photography and measurements completed. Witness canvass assigned.

NARRATIVE OF EVENTS
${details.narrative}

INITIAL EVIDENCE SEIZED
Items logged and tagged at scene. Chain of custody initiated. Forensic services requested for latent prints, biological samples, and digital media where applicable.

WITNESS STATUS
Canvass in progress. Statements to be recorded under case file reference.

INVESTIGATIVE STATUS
Case assigned to Detective Bureau. Autopsy ordered. Subpoenas pending for records and surveillance.

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
Examiner: Dr. Elena Marsh, Chief Medical Examiner

CAUSE OF DEATH
${details.cause}

MANNER OF DEATH
Homicide

ESTIMATED TIME OF DEATH
${details.timeOfDeath}

EXTERNAL EXAMINATION
Full body examination performed. Injuries documented photographically. Clothing preserved as evidence. Trace evidence collected per protocol.

INTERNAL EXAMINATION
Complete autopsy performed. Organ weights recorded. Tissue samples retained for histology and toxicology.

TOXICOLOGY
Standard drug and poison screen submitted. Results noted in findings below.

PATHOLOGICAL FINDINGS
${details.findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

CONCLUSION
Death resulted from injuries consistent with findings above. Manner of death certified as homicide pending law enforcement investigation.

SPECIMENS RETAINED
Toxicology aliquots, histology slides, and reference samples archived per office policy.

Signed: Dr. Elena Marsh, Chief Medical Examiner
Date: ${details.date}`;
}
