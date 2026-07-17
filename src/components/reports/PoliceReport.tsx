import { cn } from "@/lib/utils";
import type { PoliceReportData, ReportSection } from "@/lib/reports/parse-content";

const STAMP_COLORS: Record<string, string> = {
  OFFICIAL: "border-blue-800 text-blue-900",
  CONFIDENTIAL: "border-red-700 text-red-800",
  RESTRICTED: "border-amber-700 text-amber-800",
  EVIDENCE: "border-slate-700 text-slate-800",
};

function ReportSectionBlock({ section }: { section: ReportSection }) {
  return (
    <div className={cn("report-section", section.highlight && "report-section-highlight")}>
      <h4 className="report-section-heading">{section.heading}</h4>

      {section.rows && section.rows.length > 0 && (
        <table className="report-table w-full">
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i}>
                <td className="report-table-label">{row.label}</td>
                <td className="report-table-value">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {section.body && <p className="report-body whitespace-pre-wrap">{section.body}</p>}

      {section.bullets && (
        <ol className="report-list">
          {section.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ol>
      )}

      {section.table && (
        <table className="report-table w-full border-collapse">
          <thead>
            <tr>
              {section.table.headers.map((h) => (
                <th key={h} className="report-table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="report-table-td">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function PoliceReport({ data, className }: { data: PoliceReportData; className?: string }) {
  const stampClass = STAMP_COLORS[data.classification ?? "OFFICIAL"];

  return (
    <article className={cn("police-report", className)}>
      {/* Letterhead */}
      <header className="report-letterhead">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="report-dept">{data.department ?? "METROPOLITAN POLICE DEPARTMENT"}</p>
            <h2 className="report-title">{data.title}</h2>
            {data.subtitle && data.subtitle !== data.title && (
              <p className="report-subtitle">{data.subtitle}</p>
            )}
          </div>
          {data.classification && (
            <div className={cn("report-stamp", stampClass)}>{data.classification}</div>
          )}
        </div>

        <div className="report-meta-grid">
          <div><span>REF NO.</span><strong>{data.referenceNumber}</strong></div>
          <div><span>DATE</span><strong>{data.date}</strong></div>
          <div><span>AUTHOR</span><strong>{data.author}</strong></div>
          {data.stamp && (
            <div><span>STATUS</span><strong>{data.stamp}</strong></div>
          )}
        </div>

        {data.meta && data.meta.length > 0 && (
          <div className="report-meta-extra">
            {data.meta.map((m) => (
              <div key={m.label}>
                <span>{m.label}</span>
                <strong>{m.value}</strong>
              </div>
            ))}
          </div>
        )}
      </header>

      <hr className="report-rule" />

      {/* Sections */}
      <div className="report-body-area">
        {data.sections.map((section, i) => (
          <ReportSectionBlock key={i} section={section} />
        ))}
      </div>

      {/* Footer */}
      <footer className="report-footer">
        {data.footer && <p className="report-footer-text">{data.footer}</p>}
        <div className="report-signature-row">
          <div className="report-signature-block">
            <div className="report-signature-line" />
            <p>Investigating Officer</p>
          </div>
          <div className="report-signature-block">
            <div className="report-signature-line" />
            <p>Supervisor Approval</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
