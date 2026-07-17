import type { EvidenceItem, InvestigationCase } from "@/types/case";
import {
  generateChainOfCustody,
  generateDetailedFindings,
  generateExaminerNotes,
  generateLabResults,
} from "@/lib/reports/detail-generators";

export interface EvidenceDetail {
  referenceNumber: string;
  collectedAt: string;
  collectedBy: string;
  classification: string;
  summary: string;
  findings: string[];
  chainOfCustody: string[];
  examinerNotes: string;
  relatedSubjects: string[];
  labResults?: string[];
  detectiveNotes?: string;
  exhibitSpecs: Array<{ label: string; value: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  physical: "PHYSICAL EVIDENCE",
  digital: "DIGITAL FORENSICS",
  document: "DOCUMENTARY",
  forensic: "FORENSIC ANALYSIS",
  testimony: "TESTIMONIAL",
  media: "AUDIO / VIDEO",
  financial: "FINANCIAL RECORDS",
};

/** Build a full evidence property report from case data */
export function buildEvidenceDetail(
  item: EvidenceItem,
  caseData: InvestigationCase
): EvidenceDetail {
  const caseRef = `CF-${caseData.meta.order.toString().padStart(2, "0")}`;
  const refNum = `${caseRef}-EV-${item.id.replace(/^ev-?/, "").toUpperCase().slice(0, 8)}`;

  const people = [...caseData.suspects, ...caseData.witnesses, caseData.victim as { id: string; name: string }]
    .filter((p) => item.relatedPeople.includes(p.id))
    .map((p) => {
      const role = p.id.startsWith("victim") ? "Victim" : p.id.startsWith("suspect") ? "Suspect" : "Witness";
      return `${p.name} (${role})`;
    });

  const linkedDoc = item.documentId
    ? caseData.documents.find((d) => d.id === item.documentId)
    : null;

  const findings = generateDetailedFindings(item, caseData, linkedDoc?.content);
  const labResults = generateLabResults(item);
  const detectiveNotes = buildDetectiveNotes(item);

  const loc = caseData.locations.find((l) => l.evidenceIds.includes(item.id));

  return {
    referenceNumber: refNum,
    collectedAt: `${caseData.meta.date} ${caseData.meta.time ?? ""}`.trim(),
    collectedBy: getCollector(item.type),
    classification: TYPE_LABELS[item.type] ?? "EVIDENCE",
    summary: expandSummary(item, caseData),
    findings,
    chainOfCustody: generateChainOfCustody(item, caseData),
    examinerNotes: generateExaminerNotes(item, linkedDoc),
    relatedSubjects: people,
    labResults,
    detectiveNotes,
    exhibitSpecs: buildExhibitSpecs(item, caseData, loc?.name),
  };
}

function expandSummary(item: EvidenceItem, caseData: InvestigationCase): string {
  const base = item.description;
  const victim = caseData.victim.name;
  const caseLine = `Recovered in connection with the homicide of ${victim} (${caseData.meta.crimeType}).`;
  const locLine = item.locationFound ? ` Found at: ${item.locationFound}.` : "";
  const sig =
    item.significance === "critical"
      ? " This exhibit is flagged as critical to the investigation."
      : item.significance === "red_herring"
        ? " Investigative note: interpret with caution — may be circumstantial."
        : "";
  return `${base} ${caseLine}${locLine}${sig}`.trim();
}

function buildExhibitSpecs(
  item: EvidenceItem,
  caseData: InvestigationCase,
  locationName?: string
): Array<{ label: string; value: string }> {
  return [
    { label: "Exhibit ID", value: item.id.toUpperCase() },
    { label: "Case File", value: caseData.meta.title },
    { label: "Evidence Type", value: item.type.replace("_", " ") },
    { label: "Recovery Site", value: locationName ?? item.locationFound },
    { label: "Priority", value: item.significance.replace("_", " ").toUpperCase() },
    { label: "Storage", value: item.type === "forensic" ? "Lab hold + evidence locker" : "Climate-controlled locker" },
    { label: "Condition", value: item.hidden ? "Secured / non-obvious recovery" : "Logged and sealed" },
    { label: "Photographed", value: "Yes — scene and intake photos on file" },
  ];
}

function getCollector(type: string): string {
  const map: Record<string, string> = {
    physical: "Crime Scene Unit — Officer J. Torres",
    forensic: "Metro Forensic Lab — Dr. K. Singh",
    digital: "Digital Forensics Division",
    financial: "Financial Crimes Unit — Det. M. Hale",
    document: "Detective Bureau — Lead Investigator",
    media: "AV Forensics Lab",
    testimony: "Recorded by Investigating Officer",
  };
  return map[type] ?? "Detective Bureau";
}

function buildDetectiveNotes(item: EvidenceItem): string | undefined {
  if (item.significance !== "critical" && item.significance !== "important") return undefined;

  const hints: Record<string, string> = {
    "ev-badge": "Cross-reference with Webb's investor call alibi. The timestamps don't add up.",
    "ev-ledger": "This is the motive. Someone needed Pierce silenced before Monday's audit.",
    "ev-cctv": "Only an executive credential could override P3-B. Who has EXEC-001?",
    "ev2-tide": "The tide doesn't lie. Calloway's union call ended before the murder window.",
    "ev2-notebook": "Reyes was documenting everything. He knew he was in danger.",
    "ev3-glass": "Only Eleanor's glass was poisoned. Who poured last?",
    "ev3-medbox": "Digoxin source identified. Caregiver had exclusive access.",
    "ev4-autopsy": "Victim was dead before the fire. This is murder, not accident.",
    "ev5-audio": "The recovered audio names the shooter. Get ballistics to confirm.",
    "ev5-alibi": "Do the drive time math: restaurant to studio is 12 minutes.",
  };

  return hints[item.id] ?? `Connect to ${item.relatedPeople.length > 0 ? "linked subjects" : "timeline"} before court submission.`;
}
