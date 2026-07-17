import type { EvidenceItem, InvestigationCase } from "@/types/case";

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
    .map((p) => p.name);

  const linkedDoc = item.documentId
    ? caseData.documents.find((d) => d.id === item.documentId)
    : null;

  const linkedEvidence = item.relatedEvidence
    .map((id) => caseData.evidence.find((e) => e.id === id)?.title)
    .filter(Boolean) as string[];

  const findings = buildFindings(item, caseData, linkedDoc?.content);
  if (linkedEvidence.length) {
    findings.push(`Related exhibits on file: ${linkedEvidence.join("; ")}`);
  }
  const labResults = buildLabResults(item);
  const detectiveNotes = buildDetectiveNotes(item);

  return {
    referenceNumber: refNum,
    collectedAt: caseData.meta.date + " " + (caseData.meta.time ?? ""),
    collectedBy: getCollector(item.type),
    classification: TYPE_LABELS[item.type] ?? "EVIDENCE",
    summary: item.description,
    findings,
    chainOfCustody: buildChainOfCustody(item, caseData),
    examinerNotes: linkedDoc
      ? `See linked document: ${linkedDoc.title} (${linkedDoc.referenceNumber})`
      : getExaminerNotes(item),
    relatedSubjects: people,
    labResults,
    detectiveNotes,
  };
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

function getExaminerNotes(item: EvidenceItem): string {
  if (item.significance === "critical") {
    return "PRIORITY EXHIBIT — Critical to establishing motive, opportunity, or method. Handle as primary evidence.";
  }
  if (item.significance === "red_herring") {
    return "Under review — may be circumstantial or misleading. Cross-reference with timeline.";
  }
  return "Standard chain of custody maintained. Available for court submission.";
}

function buildFindings(
  item: EvidenceItem,
  caseData: InvestigationCase,
  docContent?: string
): string[] {
  const findings: string[] = [];

  findings.push(`Exhibit recovered from: ${item.locationFound}`);
  findings.push(`Evidence type: ${item.type.replace("_", " ").toUpperCase()}`);
  findings.push(`Significance rating: ${item.significance.replace("_", " ").toUpperCase()}`);

  if (item.tags.length > 0) {
    findings.push(`Tags: ${item.tags.join(", ")}`);
  }

  // Type-specific detail blocks
  switch (item.id) {
    case "ev-briefcase":
      findings.push(
        "Black leather briefcase, manufacturer tag: Hartmann Executive Series",
        "Exterior dent consistent with cylindrical metal impact (tire iron class)",
        "Latent fingerprints lifted: Daniel Pierce (victim), partial on handle",
        "Interior: printed financial ledger, Q3–Q4 anomaly report, USB drive (encrypted)",
        "Blood spatter pattern: arterial spray on latch, contact transfer on base"
      );
      break;
    case "ev-ledger":
      findings.push(
        "47 line items flagged for irregular vendor routing",
        "Vendor 'Northline Consulting' — no physical office on file",
        "Total irregular transfers: $2,314,880.00 over 14 months",
        "Domain registration for Northline matches personal email of Marcus Webb",
        "Pierce annotated margins: 'Present to SEC Monday — non-negotiable'"
      );
      break;
    case "ev-badge":
      findings.push(
        "Badge ID EXEC-001 — registered to Marcus Webb, CEO",
        "Entry swipe: 2026-03-14 22:58:03 — P1 Gate",
        "No matching exit swipe on executive badge",
        "Staff vehicle lane camera: silver Tesla Model S, partial plate",
        "Alibi claim: investor call 22:00–23:30 — CONFLICTS with entry log"
      );
      break;
    case "ev2-container":
      findings.push(
        "Container RH-4481 sealed externally, opened from interior",
        "Victim positioned behind pallet stack — concealment deliberate",
        "Rope fibers on neck match Berth 7 hawser #12",
        "Diesel fuel trace on victim's boots — Berth 7 apron",
        "Container declared weight off by 2 metric tons"
      );
      break;
    case "ev3-glass":
      findings.push(
        "Burgundy wine residue — victim's glass only",
        "Digoxin concentration 40x therapeutic in remaining dregs",
        "Lip print match: Eleanor Whitmore",
        "Bitter agent masked by full-bodied wine",
        "Other place settings test clean — isolated dosing"
      );
      break;
    case "ev4-office":
      findings.push(
        "V-shaped accelerant pour from door to desk",
        "Victim zip-tied to chair — restraint before ignition",
        "Subdural hematoma predates fire by 2-4 hours",
        "Dual origin: loading bay (insurance) + office (murder)",
        "Gasoline additive matches suspect's equipment sample"
      );
      break;
    case "ev5-scene":
      findings.push(
        "Single .38 contact-range gunshot — sternum",
        "Defensive graze on left palm — hands raised",
        "Emergency exit propped with wood wedge",
        "Deleted episode file recovered from cloud backup",
        "Studio door locked from inside — killer used corridor access"
      );
      break;
      // Parse description into finding bullets for generic items
      if (item.description.length > 80) {
        findings.push(item.description);
      }
  }

  if (docContent) {
    const lines = docContent.split("\n").filter((l) => l.trim() && !l.startsWith("---"));
    findings.push(...lines.slice(0, 6).map((l) => l.trim()));
  }

  return findings;
}

function buildLabResults(item: EvidenceItem): string[] | undefined {
  if (item.type !== "forensic" && item.type !== "physical") return undefined;

  const results: string[] = [];
  if (item.tags.includes("forensic") || item.type === "forensic") {
    results.push("Sample submitted to Metro Forensic Lab");
    results.push("Analysis status: COMPLETE");
  }
  if (item.id.includes("toxicology") || item.tags.includes("poison")) {
    results.push("Toxicology: positive for foreign substance — see lab report");
  }
  if (item.tags.includes("weapon")) {
    results.push("Toolmark analysis: MATCH to wound pattern");
    results.push("DNA: mixed profile consistent with victim + suspect");
  }
  return results.length > 0 ? results : undefined;
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

function buildChainOfCustody(item: EvidenceItem, caseData: InvestigationCase): string[] {
  const date = caseData.meta.date;
  return [
    `${date} — Recovered at ${item.locationFound} by Crime Scene Unit`,
    `${date} — Logged into Evidence Locker, tag ${item.id.toUpperCase()}`,
    `${date} — Photographed, sealed, witness signature obtained`,
    `Transferred to Detective Bureau — Case ${caseData.meta.title}`,
    item.type === "forensic" ? `Submitted to Forensic Lab — analysis pending → COMPLETE` : `Held for investigative review`,
  ];
}

export function formatEvidenceReport(detail: EvidenceDetail, title: string): string {
  return `PROPERTY EVIDENCE REPORT
═══════════════════════════════════════

EXHIBIT: ${title}
REF: ${detail.referenceNumber}
CLASSIFICATION: ${detail.classification}

COLLECTED: ${detail.collectedAt}
COLLECTED BY: ${detail.collectedBy}
STATUS: LOGGED & SEALED

───────────────────────────────────────
SUMMARY
───────────────────────────────────────
${detail.summary}

───────────────────────────────────────
DETAILED FINDINGS
───────────────────────────────────────
${detail.findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

${detail.labResults ? `───────────────────────────────────────
LAB RESULTS
───────────────────────────────────────
${detail.labResults.map((r) => `• ${r}`).join("\n")}
` : ""}
───────────────────────────────────────
RELATED SUBJECTS
───────────────────────────────────────
${detail.relatedSubjects.length > 0 ? detail.relatedSubjects.map((s) => `• ${s}`).join("\n") : "None linked at time of report"}

───────────────────────────────────────
CHAIN OF CUSTODY
───────────────────────────────────────
${detail.chainOfCustody.map((c, i) => `${i + 1}. ${c}`).join("\n")}

───────────────────────────────────────
EXAMINER NOTES
───────────────────────────────────────
${detail.examinerNotes}
${detail.detectiveNotes ? `\nDETECTIVE NOTE: ${detail.detectiveNotes}` : ""}

═══════════════════════════════════════
END OF REPORT — FOR INVESTIGATIVE USE ONLY`;
}
