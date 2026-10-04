import React, { useEffect, useState } from "react";
import {
  searchPatents,
  getPatentStatistics
} from "../services/patentService";
import {
  Building2,
  FileText,
  Users,
  Layers,
  Search,
  Calendar,
  Tag,
  Hash,
  Sparkles,
  RefreshCw
} from "lucide-react";

import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

function PatentIntelligence() {
  const [query, setQuery] = useState("artificial intelligence");
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    total_patents: 0,
    top_organizations: [],
    top_cpc_sections: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPatentData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patentResponse, statisticsResponse] = await Promise.all([
        searchPatents(query),
        getPatentStatistics()
      ]);

      setResults(Array.isArray(patentResponse?.results) ? patentResponse.results : []);
      setStatistics({
        total_patents: Number(statisticsResponse?.total_patents) || 0,
        top_organizations: Array.isArray(statisticsResponse?.top_organizations)
          ? statisticsResponse.top_organizations
          : [],
        top_cpc_sections: Array.isArray(statisticsResponse?.top_cpc_sections)
          ? statisticsResponse.top_cpc_sections
          : []
      });
    } catch (err) {
      console.error("Patent Intelligence Error:", err);
      setError(err.response?.data?.detail || err.message || "Unable to retrieve patent data.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatentData();
  }, []);

  const orgChartData = (statistics.top_organizations || []).slice(0, 8).map((o) => ({
    name: o.organization || "Unknown",
    value: o.patent_count || 0
  }));

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Patent Intelligence"
        subtitle="Analyze global patent portfolios, technology assignees, and CPC classification trends."
        icon={Building2}
        badge="USPTO & WIPO Synced"
      >
        <button onClick={loadPatentData} style={styles.refreshBtn}>
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </SectionHeader>

      {/* KPI Overview Grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Total Stored Patents"
          value={statistics.total_patents.toLocaleString()}
          icon={FileText}
          subtext="Patent repository documents"
          color="#3b82f6"
        />

        <StatCard
          title="Top Organizations"
          value={statistics.top_organizations.length.toString()}
          icon={Building2}
          subtext="Active patent assignees"
          color="#7c3aed"
        />

        <StatCard
          title="CPC Tech Sections"
          value={statistics.top_cpc_sections.length.toString()}
          icon={Layers}
          subtext="Patent classification areas"
          color="#c084fc"
        />
      </div>

      {/* Analytics Grid Above Search */}
      <div style={styles.analyticsGrid}>
        {orgChartData.length > 0 && (
          <ChartCard
            title="Top Patent Holders"
            subtitle="Organizations with largest patent portfolios"
            type="bar"
            data={orgChartData}
            dataKey="value"
            nameKey="name"
            color="#7c3aed"
            height={240}
          />
        )}

        {/* CPC Technology Classification Card */}
        <div style={styles.sidebarCard}>
          <div style={styles.sidebarHeader}>
            <Layers size={16} color="#c084fc" />
            <h4 style={styles.sidebarTitle}>CPC Technology Sections</h4>
          </div>

          <div style={styles.cpcList}>
            {statistics.top_cpc_sections.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>No classification data available.</p>
            ) : (
              statistics.top_cpc_sections.slice(0, 6).map((cpc, i) => (
                <div key={i} style={styles.cpcItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={styles.cpcBadge}>{cpc.section}</span>
                    <span style={styles.cpcName}>Section {cpc.section}</span>
                  </div>
                  <span style={styles.cpcCount}>{cpc.patent_count} patents</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div style={styles.searchSection}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={loadPatentData}
          placeholder="Search patent title, number, assignee, CPC code, or technology field..."
          loading={loading}
        />
      </div>

      {error && <ErrorState message={error} onRetry={loadPatentData} />}

      {/* Search Results Table Section */}
      <div style={styles.resultsSection}>
        <div style={styles.sectionHeaderRow}>
          <h3 style={styles.sectionTitle}>Patent Records</h3>
          <span style={styles.resultBadge}>{results.length} Patents Found</span>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} height={120} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Patents Found"
            message={`No patent records matched "${query}".`}
            actionLabel="Try 'Neural Networks'"
            onAction={() => {
              setQuery("neural networks");
              loadPatentData();
            }}
          />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patent Title & Document ID</th>
                  <th style={styles.th}>Assignees</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Abstract / Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((patent, index) => (
                  <tr key={patent.patent_id || index} style={styles.tr}>
                    <td style={styles.tdTitleCell}>
                      <div style={styles.patentTitle}>{patent.patent_title || "Untitled Patent Document"}</div>
                      <div style={styles.idBadge}>
                        <Hash size={11} style={{ marginRight: 3 }} />
                        {patent.patent_id || "ID N/A"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {Array.isArray(patent.assignees) && patent.assignees.length > 0
                        ? patent.assignees.join(", ")
                        : "N/A"}
                    </td>
                    <td style={styles.tdDate}>
                      {patent.patent_date ? (
                        <span style={styles.metaItem}>
                          <Calendar size={12} /> {patent.patent_date}
                        </span>
                      ) : "N/A"}
                    </td>
                    <td style={styles.td}>
                      {patent.patent_type ? (
                        <span style={styles.typeBadge}>{patent.patent_type}</span>
                      ) : "Utility"}
                    </td>
                    <td style={styles.tdAbstract}>
                      {patent.patent_abstract ? (
                        <span style={styles.abstractSnippet}>
                          {patent.patent_abstract.length > 140
                            ? patent.patent_abstract.slice(0, 140) + "..."
                            : patent.patent_abstract}
                        </span>
                      ) : (
                        <span style={{ color: "#475569" }}>No abstract summary</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  refreshBtn: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "600",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px"
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "20px",
    marginBottom: "24px"
  },
  searchSection: {
    marginBottom: "24px"
  },
  resultsSection: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  resultBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#60a5fa",
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: "13px"
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    background: "#0b0f19",
    color: "#94a3b8",
    fontWeight: "500",
    fontSize: "12px",
    borderBottom: "1px solid #1e293b"
  },
  tr: {
    borderBottom: "1px solid #1e293b",
    transition: "background 0.15s ease"
  },
  tdTitleCell: {
    padding: "12px 14px",
    borderBottom: "1px solid #1e293b",
    minWidth: "260px"
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #1e293b",
    color: "#cbd5e1",
    verticalAlign: "top"
  },
  tdDate: {
    padding: "12px 14px",
    borderBottom: "1px solid #1e293b",
    color: "#94a3b8",
    whiteSpace: "nowrap",
    verticalAlign: "top"
  },
  tdAbstract: {
    padding: "12px 14px",
    borderBottom: "1px solid #1e293b",
    color: "#94a3b8",
    fontSize: "12px",
    maxWidth: "320px",
    verticalAlign: "top"
  },
  patentTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: "4px",
    lineHeight: "1.4"
  },
  idBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#c084fc",
    background: "rgba(192, 132, 252, 0.15)",
    border: "1px solid rgba(192, 132, 252, 0.3)",
    padding: "2px 6px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  typeBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#38bdf8",
    background: "rgba(56, 189, 248, 0.15)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  abstractSnippet: {
    display: "block",
    lineHeight: "1.4"
  },
  sidebarCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px"
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  cpcList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  cpcItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px"
  },
  cpcBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#c084fc",
    background: "rgba(192, 132, 252, 0.15)",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  cpcName: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#f8fafc"
  },
  cpcCount: {
    fontSize: "11px",
    color: "#60a5fa"
  }
};

export default PatentIntelligence;