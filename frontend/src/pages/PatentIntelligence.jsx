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

  const [dataSource, setDataSource] = useState("USPTO Live Data");
  const [isCached, setIsCached] = useState(false);
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
      setDataSource(patentResponse?.source || (patentResponse?.is_cached ? "MongoDB Cache" : "USPTO Live Data"));
      setIsCached(Boolean(patentResponse?.is_cached));
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
          color="#4C8DFF"
        />

        <StatCard
          title="Top Organizations"
          value={statistics.top_organizations.length.toString()}
          icon={Building2}
          subtext="Active patent assignees"
          color="#4C8DFF"
        />

        <StatCard
          title="CPC Tech Sections"
          value={statistics.top_cpc_sections.length.toString()}
          icon={Layers}
          subtext="Patent classification areas"
          color="#4C8DFF"
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
            color="#4C8DFF"
            height={240}
          />
        )}

        {/* CPC Technology Classification Card */}
        <div style={styles.sidebarCard}>
          <div style={styles.sidebarHeader}>
            <Layers size={16} color="#4C8DFF" />
            <h4 style={styles.sidebarTitle}>CPC Technology Sections</h4>
          </div>

          <div style={styles.cpcList}>
            {statistics.top_cpc_sections.length === 0 ? (
              <p style={{ color: "#98A4B5", fontSize: "12px", margin: 0 }}>No classification data available.</p>
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
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={isCached ? styles.cachedBadge : styles.sourceBadge}>
              {dataSource}
            </span>
            <span style={styles.resultBadge}>{results.length} Patents Found</span>
          </div>
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
                        <span style={{ color: "#98A4B5" }}>No abstract summary</span>
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
    color: "#F2F5F8"
  },
  refreshBtn: {
    background: "#101620",
    border: "1px solid #202A38",
    color: "#F2F5F8",
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
    background: "#101620",
    border: "1px solid #202A38",
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
    color: "#F2F5F8",
    margin: 0
  },
  resultBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  sourceBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#35C98A",
    background: "rgba(53, 201, 138, 0.12)",
    border: "1px solid rgba(53, 201, 138, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  cachedBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#D9A441",
    background: "rgba(217, 164, 65, 0.12)",
    border: "1px solid rgba(217, 164, 65, 0.3)",
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
    background: "#0B0F17",
    color: "#98A4B5",
    fontWeight: "500",
    fontSize: "12px",
    borderBottom: "1px solid #202A38"
  },
  tr: {
    borderBottom: "1px solid #202A38",
    transition: "background 0.15s ease"
  },
  tdTitleCell: {
    padding: "12px 14px",
    borderBottom: "1px solid #202A38",
    minWidth: "260px"
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #202A38",
    color: "#98A4B5",
    verticalAlign: "top"
  },
  tdDate: {
    padding: "12px 14px",
    borderBottom: "1px solid #202A38",
    color: "#98A4B5",
    whiteSpace: "nowrap",
    verticalAlign: "top"
  },
  tdAbstract: {
    padding: "12px 14px",
    borderBottom: "1px solid #202A38",
    color: "#98A4B5",
    fontSize: "12px",
    maxWidth: "320px",
    verticalAlign: "top"
  },
  patentTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F2F5F8",
    marginBottom: "4px",
    lineHeight: "1.4"
  },
  idBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    padding: "2px 6px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  typeBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
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
    background: "#101620",
    border: "1px solid #202A38",
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
    borderBottom: "1px solid #202A38",
    paddingBottom: "10px"
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#F2F5F8",
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
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "8px"
  },
  cpcBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  cpcName: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#F2F5F8"
  },
  cpcCount: {
    fontSize: "11px",
    color: "#4C8DFF"
  }
};

export default PatentIntelligence;