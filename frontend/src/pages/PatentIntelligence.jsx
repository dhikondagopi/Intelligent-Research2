import React, { useEffect, useState, useCallback } from "react";
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
  RefreshCw,
  AlertTriangle,
  Database,
  Wifi,
  WifiOff,
  Info
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";

import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { useTheme } from "../context/ThemeContext";

// ─── Horizontal bar chart for Top Patent Holders ────────────────────────────
// Uses full org names on the Y-axis (horizontal layout) to prevent clipping.

const OrgChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div style={{
        background: "var(--color-surface-elevated, #1A2333)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        maxWidth: 280
      }}>
        <p style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: 4, wordBreak: "break-word" }}>
          {name}
        </p>
        <p style={{ color: "#4C8DFF", margin: 0 }}>
          {value.toLocaleString()} patent{value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

/** Truncate an org name for the Y-axis label without losing context in the tooltip. */
function truncateLabel(label, maxLen = 22) {
  if (!label) return "";
  return label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label;
}

function OrgBarChart({ data, height, isLight }) {
  const gridColor = isLight ? "#E2E8F0" : "#202A38";
  const axisColor = isLight ? "#64748B" : "#98A4B5";
  const BAR_COLORS = ["#4C8DFF", "#35C98A", "#D9A441", "#38bdf8", "#818cf8", "#E05B61", "#A78BFA", "#F472B6"];

  // Horizontal chart – keep at most 8 entries, sorted desc
  const chartData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map(d => ({ ...d, shortName: truncateLabel(d.name) }));

  const barHeight = 32;
  const chartHeight = Math.max(height, chartData.length * barHeight + 60);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 8, right: 40, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
        <XAxis
          type="number"
          stroke={axisColor}
          fontSize={11}
          tickLine={false}
          tickFormatter={v => v.toLocaleString()}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          stroke={axisColor}
          fontSize={11}
          tickLine={false}
          width={150}
          tick={{ textAnchor: "end" }}
        />
        <Tooltip content={<OrgChartTooltip />} cursor={{ fill: "rgba(76,141,255,0.06)" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Delivery status & Source provenance badges ──────────────────────────────
// Requirement: Keep delivery status (LIVE, CACHED, UNAVAILABLE) separate from
// source provenance (PatentsView, USPTO Open Data Portal).

function StatusBadges({ deliveryStatus, sourceProvenance, sourceDetail }) {
  const [showDetail, setShowDetail] = useState(false);

  const isLive = deliveryStatus === "LIVE";
  const isUnavailable = deliveryStatus === "UNAVAILABLE";

  const deliveryStyle = isLive
    ? { color: "#35C98A", background: "rgba(53,201,138,0.12)", border: "1px solid rgba(53,201,138,0.3)" }
    : isUnavailable
    ? { color: "#E05B61", background: "rgba(224,91,97,0.12)", border: "1px solid rgba(224,91,97,0.3)" }
    : { color: "#D9A441", background: "rgba(217,164,65,0.12)", border: "1px solid rgba(217,164,65,0.3)" };

  const provenanceStyle = {
    color: "#4C8DFF",
    background: "rgba(76,141,255,0.12)",
    border: "1px solid rgba(76,141,255,0.3)"
  };

  const Icon = isLive ? Wifi : isUnavailable ? WifiOff : Database;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, position: "relative" }}>
      {/* 1. Delivery Status: LIVE, CACHED, or UNAVAILABLE */}
      <span style={{
        ...deliveryStyle,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 6,
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }}>
        <Icon size={11} />
        {deliveryStatus || "UNAVAILABLE"}
      </span>

      {/* 2. Source Provenance: PatentsView or USPTO Open Data Portal */}
      <span style={{
        ...provenanceStyle,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 6,
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }}>
        Source: {sourceProvenance || "PatentsView"}
      </span>

      {sourceDetail && (
        <button
          title="Provenance & Delivery Details"
          onClick={() => setShowDetail(v => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "#98A4B5",
            display: "inline-flex",
            alignItems: "center"
          }}
        >
          <Info size={13} />
        </button>
      )}

      {showDetail && sourceDetail && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 4,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 11,
          color: "var(--color-text-muted)",
          maxWidth: 340,
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          {sourceDetail}
        </div>
      )}
    </div>
  );
}

// ─── Patent row title display ─────────────────────────────────────────────────

function PatentTitleCell({ patent }) {
  const hasTitle = patent.patent_title && patent.patent_title.trim();
  const displayId = patent.patent_id || patent.patent_number || "N/A";

  return (
    <div>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: hasTitle ? "var(--color-text)" : "var(--color-text-muted)",
        marginBottom: 4,
        lineHeight: 1.4,
        fontStyle: hasTitle ? "normal" : "italic"
      }}>
        {hasTitle ? patent.patent_title : displayId}
      </div>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color: "var(--color-primary)",
        background: "rgba(76,141,255,0.12)",
        border: "1px solid rgba(76,141,255,0.3)",
        padding: "2px 6px",
        borderRadius: 4,
        display: "inline-flex",
        alignItems: "center",
        gap: 3
      }}>
        <Hash size={11} />
        {displayId}
      </span>
    </div>
  );
}

// ─── Abstract cell ────────────────────────────────────────────────────────────

function AbstractCell({ abstract }) {
  if (!abstract || !abstract.trim()) {
    return (
      <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: 11 }}>
        Abstract not available in cache
      </span>
    );
  }
  const snippet = abstract.length > 140 ? abstract.slice(0, 140) + "…" : abstract;
  return (
    <span style={{ display: "block", lineHeight: 1.4, fontSize: 12 }}>
      {snippet}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function PatentIntelligence() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [query, setQuery] = useState("artificial intelligence");
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    total_patents: 0,
    top_organizations: [],
    top_cpc_sections: []
  });

  // Delivery status: "LIVE" | "CACHED" | "UNAVAILABLE"
  const [deliveryStatus, setDeliveryStatus] = useState("CACHED");
  // Source provenance: "PatentsView" | "USPTO Open Data Portal"
  const [sourceProvenance, setSourceProvenance] = useState("PatentsView");
  const [sourceDetail, setSourceDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalFound, setTotalFound] = useState(0);

  const loadPatentData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [patentResponse, statisticsResponse] = await Promise.all([
        searchPatents(query),
        getPatentStatistics()
      ]);

      setResults(Array.isArray(patentResponse?.results) ? patentResponse.results : []);
      setTotalFound(patentResponse?.total || 0);

      // Separate delivery status from source provenance
      const status = patentResponse?.delivery_status || (patentResponse?.is_cached ? "CACHED" : "LIVE");
      const provenance = patentResponse?.source_provenance || (patentResponse?.is_cached ? "PatentsView" : "USPTO Open Data Portal");

      setDeliveryStatus(status);
      setSourceProvenance(provenance);
      setSourceDetail(patentResponse?.source_detail || patentResponse?.warning || null);

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
      setDeliveryStatus("UNAVAILABLE");
      setSourceProvenance("Unknown");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadPatentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orgChartData = (statistics.top_organizations || [])
    .slice(0, 8)
    .map(o => ({
      name: o.organization || "Unknown",
      value: o.patent_count || 0
    }));

  // Dynamic header badge separating delivery status and provenance
  const headerBadge = deliveryStatus === "LIVE"
    ? "LIVE • USPTO"
    : deliveryStatus === "CACHED"
    ? `CACHED • ${sourceProvenance}`
    : "UNAVAILABLE";

  return (
    <div style={styles(isLight).container}>
      <SectionHeader
        title="Patent Intelligence"
        subtitle="Analyze global patent portfolios, technology assignees, and CPC classification trends."
        icon={Building2}
        badge={headerBadge}
      >
        <button onClick={loadPatentData} disabled={loading} style={styles(isLight).refreshBtn}>
          <RefreshCw size={15} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
          <span>Refresh Data</span>
        </button>
      </SectionHeader>

      {/* KPI Overview Grid */}
      <div style={styles(isLight).kpiGrid}>
        <StatCard
          title="Total Stored Patents"
          value={statistics.total_patents.toLocaleString()}
          icon={FileText}
          subtext="Cached PatentsView repository records"
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

      {/* Analytics Grid */}
      <div style={styles(isLight).analyticsGrid}>
        {/* Top Patent Holders — horizontal bar chart to handle long org names */}
        <div style={styles(isLight).chartCard}>
          <div style={styles(isLight).chartHeader}>
            <h4 style={styles(isLight).chartTitle}>Top Patent Holders</h4>
            <span style={styles(isLight).chartSubtitle}>Organizations with the largest cached patent portfolios</span>
          </div>
          {orgChartData.length > 0 ? (
            <OrgBarChart data={orgChartData} height={240} isLight={isLight} />
          ) : (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px 0", fontSize: 12 }}>
              No assignee data in cache
            </div>
          )}
        </div>

        {/* CPC Technology Classification */}
        <div style={styles(isLight).sidebarCard}>
          <div style={styles(isLight).sidebarHeader}>
            <Layers size={16} color="#4C8DFF" />
            <h4 style={styles(isLight).sidebarTitle}>CPC Technology Sections</h4>
          </div>
          <div style={styles(isLight).cpcList}>
            {statistics.top_cpc_sections.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: 0 }}>
                No classification data available.
              </p>
            ) : (
              statistics.top_cpc_sections.slice(0, 6).map((cpc, i) => (
                <div key={i} style={styles(isLight).cpcItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={styles(isLight).cpcBadge}>{cpc.section}</span>
                    <span style={styles(isLight).cpcName}>Section {cpc.section}</span>
                  </div>
                  <span style={styles(isLight).cpcCount}>{cpc.patent_count} patents</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={loadPatentData}
          placeholder="Search patent title, number, assignee, CPC code, or technology field…"
          loading={loading}
        />
      </div>

      {error && <ErrorState message={error} onRetry={loadPatentData} />}

      {/* Results Table */}
      <div style={styles(isLight).resultsSection}>
        <div style={styles(isLight).sectionHeaderRow}>
          <h3 style={styles(isLight).sectionTitle}>Patent Records</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <StatusBadges
              deliveryStatus={deliveryStatus}
              sourceProvenance={sourceProvenance}
              sourceDetail={sourceDetail}
            />
            <span style={styles(isLight).resultBadge}>
              {results.length} of {totalFound.toLocaleString()} shown
            </span>
          </div>
        </div>

        {/* Cache notice when no titles are available */}
        {deliveryStatus === "CACHED" && results.length > 0 && results.every(r => !r.patent_title) && (
          <div style={styles(isLight).infoBox}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>
              The cached records for this query originate from the PatentsView bulk dataset,
              which does not include patent titles or abstracts in its annualized tables.
              When a live USPTO API key is configured and external requests succeed, full records including titles will be fetched and cached.
            </span>
          </div>
        )}

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
              setTimeout(() => loadPatentData(), 50);
            }}
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles(isLight).table}>
              <thead>
                <tr>
                  <th style={styles(isLight).th}>Patent Title / Document ID</th>
                  <th style={styles(isLight).th}>Assignee</th>
                  <th style={styles(isLight).th}>Year</th>
                  <th style={styles(isLight).th}>Type</th>
                  <th style={styles(isLight).th}>Abstract</th>
                </tr>
              </thead>
              <tbody>
                {results.map((patent, index) => (
                  <tr key={patent.patent_id || patent.patent_number || index} style={styles(isLight).tr}>
                    <td style={styles(isLight).tdTitleCell}>
                      <PatentTitleCell patent={patent} />
                    </td>
                    <td style={styles(isLight).td}>
                      {Array.isArray(patent.assignees) && patent.assignees.length > 0
                        ? patent.assignees.join(", ")
                        : patent.assignee || "—"}
                    </td>
                    <td style={{ ...styles(isLight).td, whiteSpace: "nowrap" }}>
                      {patent.grant_year ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={12} />
                          {patent.grant_year}
                        </span>
                      ) : patent.patent_date ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={12} />
                          {patent.patent_date}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={styles(isLight).td}>
                      {patent.patent_type ? (
                        <span style={styles(isLight).typeBadge}>{patent.patent_type}</span>
                      ) : "—"}
                    </td>
                    <td style={styles(isLight).tdAbstract}>
                      <AbstractCell abstract={patent.patent_abstract || patent.abstract} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Theme-aware styles ───────────────────────────────────────────────────────

const styles = (isLight) => ({
  container: {
    padding: "28px 36px",
    maxWidth: 1440,
    margin: "0 auto",
    color: isLight ? "#1A202C" : "#F2F5F8"
  },
  refreshBtn: {
    background: isLight ? "#F1F5F9" : "#101620",
    border: `1px solid ${isLight ? "#E2E8F0" : "#202A38"}`,
    color: isLight ? "#334155" : "#F2F5F8",
    fontSize: 12,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    opacity: 1
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
    marginBottom: 24
  },
  chartCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 14,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "var(--shadow-card)"
  },
  chartHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text)",
    margin: 0
  },
  chartSubtitle: {
    fontSize: 11,
    color: "var(--color-text-muted)"
  },
  sidebarCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 14,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "var(--shadow-card)"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: "1px solid var(--color-border)",
    paddingBottom: 10
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text)",
    margin: 0
  },
  cpcList: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  cpcItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: 8
  },
  cpcBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-primary)",
    background: "rgba(76,141,255,0.12)",
    padding: "2px 6px",
    borderRadius: 4
  },
  cpcName: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text)"
  },
  cpcCount: {
    fontSize: 11,
    color: "var(--color-primary)"
  },
  resultsSection: {
    background: isLight ? "#F8FAFC" : "#101620",
    border: `1px solid ${isLight ? "#E2E8F0" : "#202A38"}`,
    borderRadius: 14,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text)",
    margin: 0
  },
  resultBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: "#4C8DFF",
    background: "rgba(76,141,255,0.12)",
    border: "1px solid rgba(76,141,255,0.3)",
    padding: "2px 8px",
    borderRadius: 6
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(217,164,65,0.08)",
    border: "1px solid rgba(217,164,65,0.3)",
    borderRadius: 8,
    color: "#D9A441",
    fontSize: 12,
    lineHeight: 1.5
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 13
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    background: "var(--color-bg-secondary)",
    color: "var(--color-text-muted)",
    fontWeight: 500,
    fontSize: 12,
    borderBottom: "1px solid var(--color-border)"
  },
  tr: {
    borderBottom: "1px solid var(--color-border)",
    transition: "background 0.15s ease"
  },
  tdTitleCell: {
    padding: "12px 14px",
    borderBottom: "1px solid var(--color-border)",
    minWidth: 240,
    verticalAlign: "top"
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-text-muted)",
    verticalAlign: "top"
  },
  tdAbstract: {
    padding: "12px 14px",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-text-muted)",
    maxWidth: 300,
    verticalAlign: "top"
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-primary)",
    background: "rgba(76,141,255,0.12)",
    border: "1px solid rgba(76,141,255,0.3)",
    padding: "2px 6px",
    borderRadius: 4
  }
});

export default PatentIntelligence;