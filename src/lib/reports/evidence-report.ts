import type { EvidenceDetail } from "@/lib/case-engine/evidence-detail";
import type { PoliceReportData, ReportSection } from "@/lib/reports/parse-content";

export function evidenceToReport(
  detail: EvidenceDetail,
  exhibitTitle: string,
  caseTitle: string
): PoliceReportData {
  const sections: ReportSection[] = [
    {
      heading: "Exhibit Specification",
      rows: detail.exhibitSpecs,
    },
    {
      heading: "Executive Summary",
      body: detail.summary,
    },
    {
      heading: "Detailed Findings",
      bullets: detail.findings,
    },
  ];

  if (detail.labResults?.length) {
    sections.push({
      heading: "Laboratory Analysis",
      bullets: detail.labResults,
    });
  }

  if (detail.relatedSubjects.length) {
    sections.push({
      heading: "Related Subjects",
      table: {
        headers: ["#", "Subject"],
        rows: detail.relatedSubjects.map((s, i) => [String(i + 1), s]),
      },
    });
  } else {
    sections.push({
      heading: "Related Subjects",
      body: "No subjects formally linked at time of initial report filing.",
    });
  }

  sections.push({
    heading: "Chain of Custody",
    table: {
      headers: ["Step", "Date / Action", "Custodian"],
      rows: detail.chainOfCustody.map((step, i) => {
        const parts = step.split(" — ");
        const dateAction = parts[0] ?? step;
        const custodian = parts.slice(1).join(" — ") || "Evidence Unit";
        return [String(i + 1), dateAction, custodian];
      }),
    },
  });

  sections.push({
    heading: "Examiner Notes & Certification",
    body: detail.examinerNotes,
  });

  sections.push({
    heading: "Prosecutorial Review",
    body:
      "This exhibit has been reviewed for chain-of-custody integrity, relevance, and potential exculpatory material. " +
      "Recommend inclusion in discovery packet upon chargesheet filing. Defense inspection available by appointment.",
  });

  if (detail.detectiveNotes) {
    sections.push({
      heading: "Lead Detective Annotation",
      body: detail.detectiveNotes,
      highlight: true,
    });
  }

  return {
    department: "METROPOLITAN POLICE — EVIDENCE & PROPERTY UNIT",
    title: "PROPERTY EVIDENCE REPORT",
    subtitle: exhibitTitle,
    referenceNumber: detail.referenceNumber,
    date: detail.collectedAt,
    author: detail.collectedBy,
    classification: "EVIDENCE",
    meta: [
      { label: "Case", value: caseTitle },
      { label: "Classification", value: detail.classification },
      { label: "Findings Count", value: String(detail.findings.length) },
      { label: "Lab Analysis", value: detail.labResults ? "COMPLETE" : "N/A" },
    ],
    sections,
    footer:
      "Exhibit sealed and logged. Chain of custody must be maintained for court admissibility. " +
      "Tampering with evidence is a felony under Penal Code §141.",
    stamp: "LOGGED",
  };
}
