import React, { useState, useEffect } from "react";
import {
  getFundingReport,
  getPatentReport,
  getResearchTrendReport,
  getInnovationReport,
  getCommercializationReport,
  exportPdfReport,
  exportExcelReport
} from "../services/reportService";
import ReportPreview from "../components/ReportPreview";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Search,
  DollarSign,
  Building2,
  Cpu,
  BookOpen,
  Briefcase,
  Sparkles
} from "lucide-react";

const REPORT_TYPES = [
  { id: "funding", label: "Funding Report", icon: DollarSign },
  { id: "patents", label: "Patent Report", icon: Building2 },
  { id: "research-trends", label: "Research Trend Report", icon: BookOpen },
  { id: "innovation", label: "Innovation Report", icon: Cpu },
  { id: "commercialization", label: "Commercialization Report", icon: Briefcase }
];

function Reports() {
  const [activeTab, setActiveTab] = useState("funding");

  // Filters State
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [technology, setTechnology] = useState("");
  const [organization, setOrganization] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [fundingType, setFundingType] = useState("");

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReportPreview = async () => {
    setLoading(true);
    setError("");

    const params = {
      query,
      domain,
      technology,
      organization,
      start_year: startYear ? parseInt(startYear) : undefined,
      end_year: endYear ? parseInt(endYear) : undefined,
      funding_type: fundingType,
      limit: 50
    };

    try {
      let res;
      if (activeTab === "funding") {
        res = await getFundingReport(params);
      } else if (activeTab === "patents") {
        res = await getPatentReport(params);
      } else if (activeTab === "research-trends") {
        res = await getResearchTrendReport(params);
      } else if (activeTab === "innovation") {
        res = await getInnovationReport(params);
      } else if (activeTab === "commercialization") {
        res = await getCommercializationReport(params);
      }

      setPreviewData(res);
    } catch (err) {
      console.error("Failed to fetch report preview:", err);
      setError(
        err.response?.data?.detail || "Failed to generate report preview. Please verify database connectivity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportPreview();
  }, [activeTab]);

  const handleExportPdf = async () => {
    setExportLoading(true);
    try {
      const exportParams = {
        report_type: activeTab,
        query,
        domain,
        technology,
        organization,
        start_year: startYear ? parseInt(startYear) : undefined,
        end_year: endYear ? parseInt(endYear) : undefined,
        funding_type: fundingType,
        limit: 50
      };
      await exportPdfReport(exportParams);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("PDF Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const exportParams = {
        report_type: activeTab,
        query,
        domain,
        technology,
        organization,
        start_year: startYear ? parseInt(startYear) : undefined,
        end_year: endYear ? parseInt(endYear) : undefined,
        funding_type: fundingType,
        limit: 50
      };
      await exportExcelReport(exportParams);
    } catch (err) {
      console.error("Excel Export failed:", err);
      alert("Excel Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setDomain("");
    setTechnology("");
    setOrganization("");
    setStartYear("");
    setEndYear("");
    setFundingType("");
  };

  return (
    <div style={styles.container}>
      {/* Title & Description Banner */}
      <div style={styles.banner}>
        <div>
          <h1 style={styles.pageTitle}>Intelligence Reports & Export Center</h1>
          <p style={styles.pageSubtitle}>
            Synthesize cross-domain intelligence into executive-level PDF reports and structured Excel spreadsheets.
          </p>
        </div>

        <div style={styles.exportButtonGroup}>
          <button
            onClick={handleExportPdf}
            disabled={exportLoading || loading || !previewData}
            style={styles.pdfExportBtn}
            title="Export as PDF"
          >
            <FileText size={16} />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exportLoading || loading || !previewData}
            style={styles.excelExportBtn}
            title="Export as Excel"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div style={styles.tabContainer}>
        {REPORT_TYPES.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {})
              }}
            >
              <Icon size={16} style={{ color: isActive ? "#60a5fa" : "#64748b" }} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <Filter size={16} style={{ color: "#60a5fa" }} />
          <h3 style={styles.filterTitle}>Report Filters & Parameters</h3>
          <button onClick={handleClearFilters} style={styles.clearBtn}>
            Clear Filters
          </button>
        </div>

        <div style={styles.filterGrid}>
          {/* Query Filter */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Search Query / Keyword</label>
            <div style={styles.inputWrapper}>
              <Search size={14} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence, Cancer, NIH..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Domain Filter */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Research Domain / Sector</label>
            <input
              type="text"
              placeholder="e.g. Biotechnology, Energy, Computer Science"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Technology Filter (for Innovation / Commercialization) */}
          {(activeTab === "innovation" || activeTab === "commercialization" || activeTab === "patents") && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Technology</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence, Quantum"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          {/* Organization Filter */}
          {(activeTab === "funding" || activeTab === "patents") && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Organization / Assignee</label>
              <input
                type="text"
                placeholder="e.g. Stanford University, IBM..."
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          {/* Funding Type Filter */}
          {activeTab === "funding" && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Funding Mechanism</label>
              <input
                type="text"
                placeholder="e.g. R01, R44, Cooperative Agreement"
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          {/* Year Range Filters */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Start Year</label>
            <input
              type="number"
              placeholder="2018"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>End Year</label>
            <input
              type="number"
              placeholder="2026"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={fetchReportPreview} disabled={loading} style={styles.applyBtn}>
            {loading ? <RefreshCw size={15} style={styles.spinner} /> : <Sparkles size={15} />}
            <span>{loading ? "Generating..." : "Generate Preview"}</span>
          </button>
        </div>
      </div>

      {/* Report Preview Display Area */}
      {error ? (
        <div style={styles.errorCard}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchReportPreview} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div style={styles.loadingCard}>
          <RefreshCw size={28} style={styles.spinner} />
          <p style={styles.loadingText}>Synthesizing database analytics for preview...</p>
        </div>
      ) : (
        <ReportPreview data={previewData} reportType={activeTab} />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "28px 36px",
    maxWidth: "1440px",
    margin: "0 auto",
    color: "#f8fafc"
  },

  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px"
  },

  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 6px 0",
    letterSpacing: "-0.02em"
  },

  pageSubtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0
  },

  exportButtonGroup: {
    display: "flex",
    gap: "12px"
  },

  pdfExportBtn: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
    transition: "all 0.2s ease"
  },

  excelExportBtn: {
    background: "linear-gradient(135deg, #059669, #047857)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)",
    transition: "all 0.2s ease"
  },

  tabContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "12px",
    overflowX: "auto"
  },

  tabBtn: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
    padding: "10px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease"
  },

  tabBtnActive: {
    background: "rgba(37, 99, 235, 0.16)",
    borderColor: "#3b82f6",
    color: "#ffffff"
  },

  filterCard: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "28px"
  },

  filterHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px"
  },

  filterTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
    flex: 1
  },

  clearBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "underline"
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px"
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8"
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },

  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#64748b"
  },

  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "9px 12px 9px 34px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box"
  },

  applyBtn: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px"
  },

  errorCard: {
    background: "rgba(127, 29, 29, 0.2)",
    border: "1px solid #7f1d1d",
    borderRadius: "12px",
    padding: "20px",
    color: "#fca5a5",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  retryBtn: {
    marginLeft: "auto",
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer"
  },

  loadingCard: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "60px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  loadingText: {
    fontSize: "14px",
    color: "#94a3b8",
    marginTop: "12px"
  },

  spinner: {
    animation: "spin 1s linear infinite",
    color: "#60a5fa"
  }
};

export default Reports;
