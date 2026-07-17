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
        trimmed.length > 2;

      if (isHeader) {
        if (current) sections.push(current);
        current = { heading: trimmed };
      } else if (trimmed.includes(":") && !current?.body) {
        const [label, ...rest] = trimmed.split(":");
        if (!current) current = { heading: "Details", rows: [] };
        if (!current.rows) current.rows = [];
        current.rows.push({ label: label.trim(), value: rest.join(":").trim() });
      } else if (trimmed.startsWith("-") || trimmed.match(/^\d+\./)) {
        if (!current) current = { heading: "Report" };
        if (!current.bullets) current.bullets = [];
        current.bullets.push(trimmed.replace(/^[-\d.]+\s*/, ""));
      } else {
        if (!current) current = { heading: "Report" };
        current.body = (current.body ? current.body + "\n" : "") + trimmed;
      }
    }
    if (current) sections.push(current);
    return sections.length ? sections : [{ heading: "Report", body: content }];
  }

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    const heading = lines[0].replace(/:$/, "");
    const rest = lines.slice(1);
    const bullets = rest.filter((l) => l.match(/^\d+\.|^[-•]/)).map((l) => l.replace(/^\d+\.|^[-•]\s*/, ""));
    const bodyLines = rest.filter((l) => !l.match(/^\d+\.|^[-•]/));
    sections.push({
      heading,
      body: bodyLines.length ? bodyLines.join("\n") : undefined,
      bullets: bullets.length ? bullets : undefined,
    });
  }

  return sections;
}

export function documentToReport(doc: {
  title: string;
  referenceNumber: string;
  date: string;
  author: string;
  content: string;
  type: string;
  classified?: boolean;
}): PoliceReportData {
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

  return {
    department: "METROPOLITAN POLICE — DETECTIVE BUREAU",
    title: typeLabels[doc.type] ?? doc.title.toUpperCase(),
    subtitle: doc.title,
    referenceNumber: doc.referenceNumber,
    date: doc.date,
    author: doc.author,
    classification: doc.classified ? "CONFIDENTIAL" : "OFFICIAL",
    sections: parseDocumentContent(doc.content),
    footer: "This document is property of law enforcement. Unauthorized disclosure is prohibited.",
    stamp: doc.classified ? "CLASSIFIED" : "FILED",
  };
}
