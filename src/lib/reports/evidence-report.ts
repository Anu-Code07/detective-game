import type { EvidenceDetail } from "@/lib/case-engine/evidence-detail";
import type { PoliceReportData, ReportSection } from "@/lib/reports/parse-content";

export function evidenceToReport(
  detail: EvidenceDetail,
  exhibitTitle: string,
  caseTitle: string
): PoliceReportData {
  const sections: ReportSection[] = [
    {
      heading: "Summary of Exhibit",
      body: detail.summary,
    },
    {
      heading: "Detailed Findings",
      bullets: detail.findings,
    },
  ];

  if (detail.labResults?.length) {
    sections.push({
      heading: "Laboratory Results",
      bullets: detail.labResults,
    });
  }

  sections.push({
    heading: "Related Subjects",
    bullets: detail.relatedSubjects.length
      ? detail.relatedSubjects
      : ["None linked at time of report"],
  });

  sections.push({
    heading: "Chain of Custody",
    table: {
      headers: ["Step", "Action"],
      rows: detail.chainOfCustody.map((step, i) => [String(i + 1), step]),
    },
  });

  sections.push({
    heading: "Examiner Notes",
    body: detail.examinerNotes,
  });

  if (detail.detectiveNotes) {
    sections.push({
      heading: "Detective Insight",
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
    ],
    sections,
    footer: "Exhibit sealed and logged. Chain of custody must be maintained for court admissibility.",
    stamp: "LOGGED",
  };
}
