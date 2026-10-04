import React from "react";
import {
  FileText,
  BarChart3,
  CheckCircle2,
  Calendar,
  User,
  Info,
  DollarSign,
  Building2,
  Cpu,
  FileCode,
  Layers,
  Sparkles
} from "lucide-react";

function ReportPreview({ data, reportType }) {
  if (!data) return null;

  const {
    title,
    generated_at,
    user_name,
    summary,
    metrics = [],
    records = [],
    chart_data = {},
    methodology
  } = data;

  const formattedDate = generated_at
    ? new Date(generated_at).toLocaleString()
    : new Date().toLocaleString();

  const renderTableHeaders = () => {
    switch (reportType) {
      case "funding":
        return (
          <tr>
            <th style={styles.th}>Project Title</th>
            <th style={styles.th}>Organization / Agency</th>
            <th style={styles.th}>Funding Type</th>
            <th style={styles.th}>Award Amount</th>
            <th style={styles.th}>Fiscal Year</th>
          </tr>
        );
      case "patents":
        return (
          <tr>
            <th style={styles.th}>Patent Title</th>
            <th style={styles.th}>Assignee</th>
            <th style={styles.th}>Technology Field</th>
            <th style={styles.th}>Filing Date</th>
            <th style={styles.th}>Citations</th>
          </tr>
        );
      case "research-trends":
        return (
          <tr>
            <th style={styles.th}>Publication Title</th>
            <th style={styles.th}>Primary Topic</th>
            <th style={styles.th}>Year</th>
            <th style={styles.th}>Citations</th>
          </tr>
        );
      case "innovation":
        return (
          <tr>
            <th style={styles.th}>Technology Field</th>
            <th style={styles.th}>Novelty Score</th>
            <th style={styles.th}>IP Strength</th>
            <th style={styles.th}>Maturity Stage</th>
            <th style={styles.th}>Overall Score</th>
          </tr>
        );
      case "commercialization":
      default:
        return (
          <tr>
            <th style={styles.th}>Technology Field</th>
            <th style={styles.th}>Patents</th>
            <th style={styles.th}>Organizations</th>
            <th style={styles.th}>Productization Signal</th>
            <th style={styles.th}>Licensing Signal</th>
          </tr>
        );
    }
  };

  const renderTableRows = () => {
    if (!records || records.length === 0) {
      return (
        <tr>
          <td colSpan={5} style={styles.emptyTd}>
            No records available for the selected filters.
          </td>
        </tr>
      );
    }

    return records.slice(0, 30).map((r, idx) => {
      switch (reportType) {
        case "funding":
          return (
            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td style={styles.tdBold}>{r.title}</td>
              <td style={styles.td}>{r.organization}</td>
              <td style={styles.td}>{r.funding_type}</td>
              <td style={{ ...styles.td, color: "#34d399", fontWeight: "600" }}>
                {r.award_amount_formatted}
              </td>
              <td style={styles.td}>{r.fiscal_year}</td>
            </tr>
          );
        case "patents":
          return (
            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td style={styles.tdBold}>{r.title}</td>
              <td style={styles.td}>{r.assignee}</td>
              <td style={styles.td}>{r.technology_field}</td>
              <td style={styles.td}>{r.filing_date}</td>
              <td style={styles.td}>{r.citations}</td>
            </tr>
          );
        case "research-trends":
          return (
            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td style={styles.tdBold}>{r.title}</td>
              <td style={styles.td}>{r.primary_topic}</td>
              <td style={styles.td}>{r.publication_year}</td>
              <td style={{ ...styles.td, color: "#60a5fa", fontWeight: "600" }}>{r.citations}</td>
            </tr>
          );
        case "innovation":
          return (
            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td style={styles.tdBold}>{r.technology}</td>
              <td style={styles.td}>{r.research_novelty}</td>
              <td style={styles.td}>{r.patent_strength}</td>
              <td style={styles.td}>
                <span style={styles.badgeStage}>{r.maturity_stage}</span>
              </td>
              <td style={{ ...styles.td, color: "#c084fc", fontWeight: "700" }}>
                {r.innovation_score} / 100
              </td>
            </tr>
          );
        case "commercialization":
        default:
          return (
            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td style={styles.tdBold}>{r.technology}</td>
              <td style={styles.td}>{r.patent_count}</td>
              <td style={styles.td}>{r.organization_count}</td>
              <td style={styles.td}>
                <span style={styles.badgeSignal}>{r.productization_readiness}</span>
              </td>
              <td style={styles.td}>{r.licensing_readiness}</td>
            </tr>
          );
      }
    });
  };

  return (
    <div style={styles.previewContainer}>
      {/* Header Banner */}
      <div style={styles.headerBox}>
        <div style={{ flex: 1 }}>
          <div style={styles.badgeRow}>
            <span style={styles.typeBadge}>{reportType.toUpperCase()} REPORT PREVIEW</span>
            <span style={styles.statusBadge}>
              <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Validated Dataset
            </span>
          </div>
          <h2 style={styles.reportTitle}>{title}</h2>
          <div style={styles.metaRow}>
            <span><User size={13} style={styles.inlineIcon} /> Prepared for: {user_name}</span>
            <span><Calendar size={13} style={styles.inlineIcon} /> Date: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div style={styles.summaryBox}>
        <h4 style={styles.sectionHeader}>Executive Summary</h4>
        <p style={styles.summaryText}>{summary}</p>
      </div>

      {/* Metrics KPI Cards */}
      {metrics && metrics.length > 0 && (
        <div style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <div key={i} style={styles.metricCard}>
              <span style={styles.metricLabel}>{m.label}</span>
              <span style={styles.metricValue}>{m.value}</span>
              {m.subtext && <span style={styles.metricSub}>{m.subtext}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Visual Bar Chart Breakdown */}
      {chart_data && chart_data.categories && chart_data.categories.length > 0 && (
        <div style={styles.chartSection}>
          <h4 style={styles.sectionHeader}>
            <BarChart3 size={16} style={{ color: "#60a5fa", marginRight: 6 }} /> Key Field Breakdown
          </h4>
          <div style={styles.barList}>
            {chart_data.categories.map((cat, i) => {
              const val = chart_data.values[i] || 0;
              const maxVal = Math.max(...chart_data.values, 1);
              const pct = Math.round((val / maxVal) * 100);

              return (
                <div key={i} style={styles.barRow}>
                  <span style={styles.barLabel}>{cat}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${pct}%` }} />
                  </div>
                  <span style={styles.barVal}>{typeof val === "number" ? val.toLocaleString() : val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Data Table */}
      <div style={styles.tableSection}>
        <h4 style={styles.sectionHeader}>Structured Data Records</h4>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>{renderTableHeaders()}</thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
        {records && records.length > 30 && (
          <p style={styles.tableFooterNote}>
            Showing top 30 of {records.length} total records. Download PDF or Excel report for full dataset.
          </p>
        )}
      </div>

      {/* Methodology Notice */}
      {methodology && (
        <div style={styles.methodologyBox}>
          <Info size={15} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
          <p style={styles.methodologyText}>{methodology}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  previewContainer: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "24px",
    color: "#f8fafc"
  },

  headerBox: {
    borderBottom: "1px solid #1e293b",
    paddingBottom: "18px",
    marginBottom: "20px"
  },

  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px"
  },

  typeBadge: {
    background: "rgba(37, 99, 235, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "6px"
  },

  statusBadge: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34d399",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 9px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center"
  },

  reportTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 10px 0"
  },

  metaRow: {
    display: "flex",
    gap: "20px",
    fontSize: "12px",
    color: "#94a3b8"
  },

  inlineIcon: {
    verticalAlign: "middle",
    marginRight: "4px"
  },

  summaryBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px"
  },

  sectionHeader: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 10px 0",
    display: "flex",
    alignItems: "center"
  },

  summaryText: {
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: "1.5",
    margin: 0
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
    marginBottom: "24px"
  },

  metricCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  metricLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "600"
  },

  metricValue: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#f8fafc"
  },

  metricSub: {
    fontSize: "11px",
    color: "#60a5fa"
  },

  chartSection: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "24px"
  },

  barList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  barRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  barLabel: {
    width: "140px",
    fontSize: "12px",
    color: "#cbd5e1",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  barTrack: {
    flex: 1,
    height: "8px",
    background: "#1e293b",
    borderRadius: "4px",
    overflow: "hidden"
  },

  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb, #7c3aed)",
    borderRadius: "4px"
  },

  barVal: {
    width: "60px",
    textAlign: "right",
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8"
  },

  tableSection: {
    marginBottom: "20px"
  },

  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #1e293b",
    borderRadius: "10px"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    textAlign: "left"
  },

  th: {
    background: "#0f172a",
    color: "#94a3b8",
    fontWeight: "700",
    padding: "10px 14px",
    borderBottom: "1px solid #1e293b"
  },

  td: {
    padding: "10px 14px",
    color: "#cbd5e1",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
  },

  tdBold: {
    padding: "10px 14px",
    color: "#f8fafc",
    fontWeight: "600",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
  },

  trEven: {
    background: "transparent"
  },

  trOdd: {
    background: "rgba(255, 255, 255, 0.015)"
  },

  emptyTd: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b"
  },

  badgeStage: {
    background: "rgba(192, 132, 252, 0.15)",
    color: "#c084fc",
    padding: "2px 7px",
    borderRadius: "4px",
    fontSize: "11px"
  },

  badgeSignal: {
    background: "rgba(52, 211, 153, 0.15)",
    color: "#34d399",
    padding: "2px 7px",
    borderRadius: "4px",
    fontSize: "11px"
  },

  tableFooterNote: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "8px",
    textAlign: "right"
  },

  methodologyBox: {
    display: "flex",
    gap: "10px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "12px 14px"
  },

  methodologyText: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: "1.4"
  }
};

export default ReportPreview;
