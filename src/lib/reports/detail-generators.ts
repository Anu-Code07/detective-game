import type { CaseDocument, CaseMeta, EvidenceItem, InvestigationCase, VictimProfile } from "@/types/case";
import type { ReportSection } from "@/lib/reports/parse-content";

const TYPE_LABELS: Record<string, string> = {
  physical: "PHYSICAL EVIDENCE",
  digital: "DIGITAL FORENSICS",
  document: "DOCUMENTARY",
  forensic: "FORENSIC ANALYSIS",
  testimony: "TESTIMONIAL",
  media: "AUDIO / VIDEO",
  financial: "FINANCIAL RECORDS",
};

/** Case-specific deep-dive findings beyond the base description */
const EVIDENCE_DETAIL_OVERRIDES: Record<string, string[]> = {
  "ev-briefcase": [
    "Black leather briefcase, manufacturer tag: Hartmann Executive Series",
    "Exterior dent consistent with cylindrical metal impact (tire iron class)",
    "Latent fingerprints lifted: Daniel Pierce (victim), partial on handle",
    "Interior: printed financial ledger, Q3–Q4 anomaly report, USB drive (encrypted)",
    "Blood spatter pattern: arterial spray on latch, contact transfer on base",
  ],
  "ev-ledger": [
    "47 line items flagged for irregular vendor routing",
    "Vendor 'Northline Consulting' — no physical office on file",
    "Total irregular transfers: $2,314,880.00 over 14 months",
    "Domain registration for Northline matches personal email of Marcus Webb",
    "Pierce annotated margins: 'Present to SEC Monday — non-negotiable'",
  ],
  "ev-badge": [
    "Badge ID EXEC-001 — registered to Marcus Webb, CEO",
    "Entry swipe: 2026-03-14 22:58:03 — P1 Gate",
    "No matching exit swipe on executive badge",
    "Staff vehicle lane camera: silver Tesla Model S, partial plate",
    "Alibi claim: investor call 22:00–23:30 — CONFLICTS with entry log",
  ],
  "ev-cctv": [
    "P3-B camera feed manually overridden for 4 minutes 51 seconds",
    "Override credential: EXEC-001 — no reason code entered",
    "Blind spot created directly over parking space 314",
    "Auto-restore triggered by system watchdog at 22:54:03",
    "Correlates with argument heard by security at 22:50",
  ],
  "ev-tireiron": [
    "18-inch lug wrench recovered from dumpster, alley behind Meridian Tower",
    "Blood and hair consistent with victim on striking surface",
    "Toolmark comparison: MATCH to dent on briefcase and skull fracture pattern",
    "Partial palm print — insufficient for individual identification",
    "Discarded within 90 minutes of estimated time of death",
  ],
  "ev-bank": [
    "Account ****7712 opened under Northline Consulting shell",
    "Beneficial owner documentation: Marcus Webb driver's license on file",
    "Inbound wire total: $2,314,880.00 from Meridian vendor payments",
    "Outbound wire 2026-03-13: $400,000 to Cayman trust — 24h before murder",
    "Pattern consistent with embezzlement concealment, not legitimate consulting",
  ],
  "ev-call": [
    "Investor conference line logged 8m 12s at 22:14 — ends 22:22",
    "Gap of 36 minutes before garage entry — unaccounted",
    "Cell tower data places phone at Meridian campus at 22:55",
    "Call recording: routine earnings discussion, no mention of Pierce",
    "Does NOT establish continuous alibi through murder window",
  ],
  "ev2-container": [
    "Container RH-4481 sealed externally, opened from interior",
    "Victim positioned behind pallet stack — concealment deliberate",
    "Rope fibers on neck match Berth 7 hawser #12",
    "Diesel fuel trace on victim's boots — Berth 7 apron",
    "Container declared weight off by 2 metric tons",
  ],
  "ev2-notebook": [
    "Water-damaged ledger with dock worker payment discrepancies",
    "Final entry dated night of murder: 'They know I'm documenting'",
    "Ink smear consistent with struggle — page torn from rear",
    "Matches manifest irregularities flagged by Reyes over 6 weeks",
    "Victim was building federal case against smuggling operation",
  ],
  "ev2-tide": [
    "Harbor tide chart: low tide 01:42 AM — container accessible without crane",
    "Murder window 01:15–01:45 requires dock-level access",
    "Union steward Calloway's phone records end 00:58 — on site during window",
    "Tide tables independently verify Reyes could not have been moved post-tide",
    "Killer had maritime operational knowledge",
  ],
  "ev3-glass": [
    "Burgundy wine residue — victim's glass only",
    "Digoxin concentration 40x therapeutic in remaining dregs",
    "Lip print match: Eleanor Whitmore",
    "Bitter agent masked by full-bodied wine",
    "Other place settings test clean — isolated dosing",
  ],
  "ev3-toxicology": [
    "Serum digoxin: 8.2 ng/mL (fatal range >2.0 ng/mL)",
    "No cardiac prescription on file for decedent",
    "Absorption timeline: 30–60 minutes before collapse",
    "Consistent with oral administration in beverage",
    "No other toxins or sedatives detected",
  ],
  "ev3-medbox": [
    "Lockbox access log: Clara Hughes — 21:00 entry",
    "Vitamin compartments undisturbed; false bottom compartment disturbed",
    "Empty digoxin blister pack hidden under liner",
    "Caregiver had sole medication management authority",
    "Eleanor was not prescribed digoxin by any physician",
  ],
  "ev4-office": [
    "V-shaped accelerant pour from door to desk",
    "Victim zip-tied to chair — restraint before ignition",
    "Subdural hematoma predates fire by 2-4 hours",
    "Dual origin: loading bay (insurance) + office (murder)",
    "Gasoline additive matches suspect's equipment sample",
  ],
  "ev5-scene": [
    "Single .38 contact-range gunshot — sternum",
    "Defensive graze on left palm — hands raised",
    "Emergency exit propped with wood wedge",
    "Deleted episode file recovered from cloud backup",
    "Studio door locked from inside — killer used corridor access",
  ],
  "ev5-audio": [
    "Waveform analysis: Rachel Kane voice at 10:58:14 PM",
    "Male voice fragment: 'Not tonight' — stress markers present",
    "Door latch audible at 10:58:02 — entry during live recording",
    "Episode auto-save interrupted by gunshot transient at 10:58:31",
    "Recovered from cloud sync 47 minutes after local deletion",
  ],
};

function findPerson(caseData: InvestigationCase, id: string) {
  return (
    caseData.suspects.find((p) => p.id === id) ??
    caseData.witnesses.find((p) => p.id === id) ??
    (caseData.victim.id === id ? caseData.victim : null)
  );
}

function resolveNodeName(id: string, caseData: InvestigationCase): string {
  const person = findPerson(caseData, id);
  if (person) return person.name;
  const ev = caseData.evidence.find((e) => e.id === id);
  if (ev) return ev.title;
  const tl = caseData.timeline.find((t) => t.id === id);
  if (tl) return tl.title;
  return id;
}

function typeSpecificAnalysis(item: EvidenceItem): string[] {
  const lines: string[] = [];

  switch (item.type) {
    case "physical":
      lines.push(
        "Packaging: paper evidence bag, heat-sealed, tamper-evident tape applied",
        "Photography: 24 digital images at scene (overview, mid-range, close-up, scale)",
        "Preservation: stored dry at 68°F — Evidence Locker Bay 3"
      );
      break;
    case "forensic":
      lines.push(
        "Laboratory: Metro Forensic Sciences Division",
        "Analyst certification: ISO 17025 accredited procedures followed",
        "Sample integrity: sealed, logged, and witnessed at submission",
        "Re-test available upon defense request per discovery rules"
      );
      break;
    case "digital":
      lines.push(
        "Acquisition: forensic write-blocker imaging performed",
        "Hash verification: SHA-256 checksum logged at intake",
        "Chain preserved for courtroom authentication (FRE 901)",
        "Metadata extraction completed — timestamps preserved in UTC"
      );
      break;
    case "financial":
      lines.push(
        "Source: subpoena return — financial institution compliance division",
        "Authentication: certified bank records custodian signature on file",
        "Cross-reference: flagged for Financial Crimes Unit review",
        "Account activity mapped to investigation timeline"
      );
      break;
    case "media":
      lines.push(
        "Format: native container preserved; working copy for analysis",
        "Enhancement: noise reduction and voice isolation applied where noted",
        "Timestamp verification against system logs and witness statements",
        "Original media sealed — analysis performed on forensic duplicate"
      );
      break;
    case "document":
      lines.push(
        "Document status: authenticated copy — original retained by issuing agency",
        "Notarization / certification verified where applicable",
        "Entered into discovery index under case exhibit numbering",
        "Scanned at 600 DPI — OCR text layer generated for search"
      );
      break;
    default:
      break;
  }

  if (item.tags.includes("weapon")) {
    lines.push("Weapon classification: potential instrument of homicide — priority handling");
  }
  if (item.tags.includes("motive")) {
    lines.push("Investigative significance: supports motive theory — flag for prosecutor review");
  }
  if (item.tags.includes("alibi")) {
    lines.push("Alibi relevance: cross-reference with suspect statements and timeline");
  }

  return lines;
}

function splitDescription(description: string): string[] {
  return description
    .split(/(?<=[.;])\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 8);
}

export function generateDetailedFindings(
  item: EvidenceItem,
  caseData: InvestigationCase,
  docContent?: string
): string[] {
  const findings: string[] = [];

  findings.push(`Recovery location: ${item.locationFound}`);
  findings.push(`Evidence type: ${TYPE_LABELS[item.type] ?? item.type.toUpperCase()}`);
  findings.push(`Priority rating: ${item.significance.replace("_", " ").toUpperCase()}`);

  if (item.tags.length > 0) {
    findings.push(`Investigative tags: ${item.tags.join(", ")}`);
  }

  const loc = caseData.locations.find((l) => l.evidenceIds.includes(item.id));
  if (loc) {
    findings.push(`Scene: ${loc.name} (${loc.address})`);
    findings.push(`Location notes: ${loc.description}`);
  }

  findings.push(...splitDescription(item.description));

  const overrides = EVIDENCE_DETAIL_OVERRIDES[item.id];
  if (overrides) findings.push(...overrides);

  for (const pid of item.relatedPeople) {
    const person = findPerson(caseData, pid);
    if (person && "occupation" in person) {
      const role = person.id.startsWith("victim")
        ? "Victim"
        : person.id.startsWith("suspect")
          ? "Suspect"
          : "Witness";
      findings.push(
        `Linked ${role}: ${person.name}, ${person.occupation} — ${"background" in person ? person.background?.slice(0, 120) : person.personality?.slice(0, 80) ?? "on file"}`
      );
    }
  }

  const timelineHits = caseData.timeline.filter((t) => t.evidence.includes(item.id));
  for (const event of timelineHits) {
    findings.push(`Timeline correlation [${event.timestamp}]: ${event.title} — ${event.description}`);
  }

  const relationships = caseData.evidenceRelationships.filter(
    (r) => r.from === item.id || r.to === item.id
  );
  for (const rel of relationships) {
    const from = resolveNodeName(rel.from, caseData);
    const to = resolveNodeName(rel.to, caseData);
    findings.push(`Case board link: ${from} → ${to} (${rel.label})`);
  }

  if (item.relatedEvidence.length) {
    const titles = item.relatedEvidence
      .map((id) => caseData.evidence.find((e) => e.id === id)?.title)
      .filter(Boolean);
    if (titles.length) {
      findings.push(`Cross-reference exhibits: ${titles.join("; ")}`);
    }
  }

  findings.push(...typeSpecificAnalysis(item));

  if (docContent) {
    const docLines = docContent
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 4 && !/^[-=─]{3,}$/.test(l) && !/^(REF|CASE|DATE|SIGNED)/i.test(l));
    findings.push(...docLines.slice(0, 10));
  }

  if (item.unlockCondition) {
    findings.push(`Recovery note: ${item.unlockCondition}`);
  }

  return [...new Set(findings)];
}

export function generateLabResults(item: EvidenceItem): string[] | undefined {
  const results: string[] = [];

  if (item.type === "forensic" || item.type === "physical" || item.tags.includes("forensic")) {
    results.push("Laboratory: Metro Forensic Sciences Division");
    results.push("Case analyst: Dr. K. Singh, Supervisory Criminalist");
    results.push("Analysis status: COMPLETE — report finalized");
    results.push("Quality control: duplicate extraction verified; controls within tolerance");
  }

  if (item.id.includes("toxicology") || item.tags.includes("poison")) {
    results.push("Toxicology panel: comprehensive drug and poison screen");
    results.push("Instrument: LC-MS/MS — limit of detection 0.01 ng/mL");
    results.push("Positive identification: foreign substance consistent with case theory");
  }

  if (item.tags.includes("weapon") || item.id.includes("ballistics") || item.id.includes("shell")) {
    results.push("Ballistics: breech face and firing pin impressions documented");
    results.push("Comparison microscopy: candidate weapon test-fired for correlation");
    results.push("Result: markings consistent with submitted casing (see ballistics memo)");
  }

  if (item.tags.includes("arson")) {
    results.push("Arson analysis: ignitable liquid residue detected via GC-MS");
    results.push("Burn pattern analysis: multiple origin points documented");
    results.push("Accelerant classification: petroleum distillate — sample retained");
  }

  if (item.type === "digital" || item.type === "media") {
    results.push("Digital forensics: hash-verified forensic image created");
    results.push("Timeline reconstruction: file system metadata analyzed");
    results.push("Integrity: no evidence of post-incident tampering on working copy");
  }

  if (item.type === "financial") {
    results.push("Financial analysis: transaction mapping across 18-month window");
    results.push("Forensic accounting review: flagged transfers cross-referenced to suspects");
    results.push("Subpoena compliance: certified records received from institution");
  }

  return results.length > 0 ? results : undefined;
}

export function generateChainOfCustody(
  item: EvidenceItem,
  caseData: InvestigationCase
): string[] {
  const date = caseData.meta.date;
  const time = caseData.meta.time ?? "00:00";
  const collector = getCollectorLabel(item.type);

  const steps = [
    `${date} ${time} — Initial recovery at ${item.locationFound} by ${collector}`,
    `${date} — Scene photography completed; evidence markers placed (photos logged)`,
    `${date} — Item packaged, sealed, and tagged ${item.id.toUpperCase()}`,
    `${date} — Transported to Evidence Intake — receiving officer signature obtained`,
    `${date} — Logged into Evidence Management System; barcode assigned`,
    `Case assignment: ${caseData.meta.title} — Lead Detective Bureau`,
  ];

  if (item.type === "forensic" || item.tags.includes("forensic")) {
    steps.push(`${date} — Submitted to Forensic Lab; accession number assigned`);
    steps.push(`Lab analysis COMPLETE — results entered into case file`);
  } else {
    steps.push(`Held in secure storage — climate-controlled evidence bay`);
  }

  steps.push(`Status: AVAILABLE for court submission — chain unbroken`);

  return steps;
}

function getCollectorLabel(type: string): string {
  const map: Record<string, string> = {
    physical: "Crime Scene Unit — Officer J. Torres",
    forensic: "Metro Forensic Lab — Dr. K. Singh",
    digital: "Digital Forensics Division — Analyst R. Park",
    financial: "Financial Crimes Unit — Det. M. Hale",
    document: "Detective Bureau — Lead Investigator",
    media: "AV Forensics Lab — Tech S. Morales",
    testimony: "Investigating Officer — recorded statement",
  };
  return map[type] ?? "Detective Bureau";
}

export function generateExaminerNotes(
  item: EvidenceItem,
  linkedDoc?: { title: string; referenceNumber: string; content: string } | null
): string {
  const parts: string[] = [];

  if (item.significance === "critical") {
    parts.push(
      "PRIORITY EXHIBIT — Critical to establishing motive, opportunity, or method.",
      "Recommend early disclosure to prosecutor and preservation of all derivatives."
    );
  } else if (item.significance === "red_herring") {
    parts.push(
      "Under active review — circumstantial or potentially misleading standing alone.",
      "Cross-reference with timeline and corroborating exhibits before reliance at trial."
    );
  } else {
    parts.push("Standard chain of custody maintained. Suitable for investigative use and court submission.");
  }

  if (linkedDoc) {
    parts.push(
      `Linked documentary exhibit: ${linkedDoc.title} (${linkedDoc.referenceNumber}).`,
      `Document excerpt on file — see full report in Case Documents tab.`
    );
    const excerpt = linkedDoc.content
      .split("\n")
      .filter((l) => l.trim().length > 20)
      .slice(0, 2)
      .join(" ");
    if (excerpt) parts.push(`Summary: ${excerpt.slice(0, 280)}...`);
  }

  if (item.hidden) {
    parts.push(`Recovery status: Originally secured / non-obvious — ${item.unlockCondition ?? "special recovery"}.`);
  }

  return parts.join("\n\n");
}

export function enrichDocumentSections(
  doc: { type: CaseDocument["type"]; classified: boolean },
  caseMeta?: CaseMeta,
  victim?: VictimProfile
): ReportSection[] {
  const preamble: ReportSection[] = [];

  if (caseMeta) {
    preamble.push({
      heading: "Case Reference",
      rows: [
        { label: "Case Title", value: caseMeta.title },
        { label: "Crime Classification", value: caseMeta.crimeType },
        { label: "Incident Date / Time", value: `${caseMeta.date} — ${caseMeta.time}` },
        { label: "Primary Scene", value: caseMeta.location },
        { label: "Case Severity", value: caseMeta.severity.toUpperCase() },
      ],
    });
  }

  if (victim && (doc.type === "autopsy" || doc.type === "medical_report")) {
    preamble.push({
      heading: "Decedent Information",
      rows: [
        { label: "Full Name", value: victim.name },
        { label: "Age", value: String(victim.age) },
        { label: "Occupation", value: victim.occupation },
        { label: "Last Seen", value: victim.lastSeen },
        { label: "Background", value: victim.background },
      ],
    });
  }

  const distribution: ReportSection = {
    heading: "Distribution & Handling",
    bullets: [
      "Original retained by issuing agency records division",
      "Copy provided to Detective Bureau — Homicide Unit",
      "Prosecutor discovery packet — upon case filing",
      doc.classified ? "RESTRICTED — warrant or court order required for external release" : "Standard law enforcement distribution",
    ],
  };

  const closing: ReportSection[] = [distribution];

  if (doc.type === "fir") {
    closing.unshift({
      heading: "Initial Actions Taken",
      bullets: [
        "Scene secured and logged — evidence preservation protocol initiated",
        "Medical response documented; victim pronounced at scene",
        "Witness canvass commenced within 2 hours of notification",
        "Lead detective assigned — case elevated to Homicide Unit",
        "Forensic services requested — photography and evidence collection underway",
      ],
    });
  }

  if (doc.type === "autopsy") {
    closing.unshift({
      heading: "Specimens Retained",
      bullets: [
        "Toxicology aliquots — refrigerated storage, 90-day hold",
        "Histology slides — permanent archive",
        "Clothing and personal effects — returned to evidence unit",
        "DNA reference samples collected per standard protocol",
      ],
    });
  }

  if (doc.type === "bank_transactions" || doc.type === "receipt") {
    closing.unshift({
      heading: "Financial Analysis Notes",
      bullets: [
        "Transactions mapped to investigation timeline",
        "Beneficial ownership traced where shell entities involved",
        "Suspicious activity report cross-reference pending FinCEN liaison",
        "Certified copies suitable for grand jury presentation",
      ],
    });
  }

  if (doc.type === "cctv_log" || doc.type === "phone_records") {
    closing.unshift({
      heading: "Authentication",
      bullets: [
        "Records certified by custodian of records",
        "Timestamps verified against system NTP synchronization logs",
        "Gaps or overrides flagged for investigative follow-up",
        "Correlated with witness statements and physical evidence",
      ],
    });
  }

  return [...preamble, ...closing];
}
