import type { CaseDocument, CaseMeta, VictimProfile } from "@/types/case";
import { enrichDocumentSections } from "@/lib/reports/detail-generators";

export interface ReportSection {
  heading: string;
  body?: string;
  bullets?: string[];
  rows?: Array<{ label: string; value: string }>;
  table?: { headers: string[]; rows: string[][] };
  highlight?: boolean;
}

export interface PoliceReportData {
  department?: string;
  title: string;
  subtitle?: string;
  referenceNumber: string;
  date: string;
  author: string;
  classification?: "OFFICIAL" | "CONFIDENTIAL" | "RESTRICTED" | "EVIDENCE";
  meta?: Array<{ label: string; value: string }>;
  sections: ReportSection[];
  footer?: string;
  stamp?: string;
}

/** Parse plain-text case documents into structured report sections */
export function parseDocumentContent(content: string): ReportSection[] {
  const sections: ReportSection[] = [];
  const blocks = content.split(/─{3,}|={3,}/).map((b) => b.trim()).filter(Boolean);

  if (blocks.length <= 1) {
    const lines = content.split("\n").filter((l) => l.trim());
    let current: ReportSection | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const isHeader =
        trimmed === trimmed.toUpperCase() &&
        trimmed.length < 60 &&
        !trimmed.includes(":") &&
        trimmed.length > 2 &&
        !/^\d+\./.test(trimmed);

      if (isHeader) {
        if (current) sections.push(current);
        current = { heading: trimmed };
      } else if (trimmed.match(/^\d+\.\s/)) {
        if (!current) current = { heading: "Findings" };
        if (!current.bullets) current.bullets = [];
        current.bullets.push(trimmed.replace(/^\d+\.\s*/, ""));
      } else if (trimmed.includes(":") && !current?.body && !current?.bullets?.length) {
        const colonIdx = trimmed.indexOf(":");
        const label = trimmed.slice(0, colonIdx);
        const value = trimmed.slice(colonIdx + 1).trim();
        if (label.length < 40 && value) {
          if (!current) current = { heading: "Report Details", rows: [] };
          if (!current.rows) current.rows = [];
          current.rows.push({ label: label.trim(), value });
        } else {
          if (!current) current = { heading: "Report" };
          current.body = (current.body ? current.body + "\n" : "") + trimmed;
        }
      } else if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
        if (!current) current = { heading: "Report" };
        if (!current.bullets) current.bullets = [];
        current.bullets.push(trimmed.replace(/^[-•]\s*/, ""));
      } else {
        if (!current) current = { heading: "Report" };
        current.body = (current.body ? current.body + "\n" : "") + trimmed;
      }
    }
    if (current) sections.push(current);
    return sections.length ? sections : [{ heading: "Full Report", body: content }];
  }

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    const heading = lines[0].replace(/:$/, "");
    const rest = lines.slice(1);
    const rowLines = rest.filter((l) => l.includes(":") && !l.match(/^\d+\.|^[-•]/));
    const bullets = rest.filter((l) => l.match(/^\d+\.|^[-•]/)).map((l) => l.replace(/^\d+\.|^[-•]\s*/, ""));
    const bodyLines = rest.filter(
      (l) => !l.match(/^\d+\.|^[-•]/) && !(l.includes(":") && l.indexOf(":") < 40)
    );

    const section: ReportSection = { heading };
    if (rowLines.length >= 2) {
      section.rows = rowLines.map((l) => {
        const [label, ...val] = l.split(":");
        return { label: label.trim(), value: val.join(":").trim() };
      });
    }
    if (bodyLines.length) section.body = bodyLines.join("\n");
    if (bullets.length) section.bullets = bullets;
    sections.push(section);
  }

  return sections;
}

export function documentToReport(
  doc: {
    title: string;
    referenceNumber: string;
    date: string;
    author: string;
    content: string;
    type: string;
    classified?: boolean;
  },
  options?: { caseMeta?: CaseMeta; victim?: VictimProfile }
): PoliceReportData {
  const typeLabels: Record<string, string> = {
    fir: "FIRST INFORMATION REPORT",
    autopsy: "MEDICAL EXAMINER REPORT",
    lab_report: "FORENSIC LABORATORY REPORT",
    investigation_notes: "INVESTIGATION MEMO",
    phone_records: "TELECOMMUNICATIONS SUBPOENA RETURN",
    bank_transactions: "FINANCIAL RECORDS SUBPOENA",
    cctv_log: "SURVEILLANCE SYSTEM LOG",
    chat_history: "DIGITAL MESSAGE EXTRACTION",
    email: "EMAIL FORENSICS REPORT",
    receipt: "TRANSACTION RECORD",
    audio: "AUDIO FORENSICS TRANSCRIPT",
  };

  const parsed = parseDocumentContent(doc.content);
  const enriched = enrichDocumentSections(
    { type: doc.type as CaseDocument["type"], classified: doc.classified ?? false },
    options?.caseMeta,
    options?.victim
  );

  const preamble = enriched.filter((s) => s.heading === "Case Reference" || s.heading === "Decedent Information");
  const closing = enriched.filter((s) => !preamble.includes(s));

  return {
    department: "METROPOLITAN POLICE — DETECTIVE BUREAU",
    title: typeLabels[doc.type] ?? doc.title.toUpperCase(),
    subtitle: doc.title,
    referenceNumber: doc.referenceNumber,
    date: doc.date,
    author: doc.author,
    classification: doc.classified ? "CONFIDENTIAL" : "OFFICIAL",
    meta: options?.caseMeta
      ? [
          { label: "Case", value: options.caseMeta.title },
          { label: "Incident", value: `${options.caseMeta.date} ${options.caseMeta.time}` },
          { label: "Document Type", value: doc.type.replace(/_/g, " ").toUpperCase() },
        ]
      : undefined,
    sections: [...preamble, ...parsed, ...closing],
    footer:
      "This document is property of law enforcement. Unauthorized disclosure is prohibited. " +
      "Certified copy — suitable for investigative use and court filing.",
    stamp: doc.classified ? "CLASSIFIED" : "FILED",
  };
}
