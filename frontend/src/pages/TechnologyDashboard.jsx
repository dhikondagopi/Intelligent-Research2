import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  FileText,
  Building2,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowRight,
  RefreshCw
} from "lucide-react";

import { getTechnologyDashboard } from "../services/technologyService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

function TechnologyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getTechnologyDashboard();
      setData(response);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load Technology Intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSkeleton type="kpi" count={4} />
        <div style={{ marginTop: "20px" }}>
          <LoadingSkeleton type="card" count={2} height={240} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <ErrorState message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  const fields = data?.technology_fields || [];
  const sectors = data?.technology_sectors || [];
  const organizations = data?.top_organizations || data?.organizations || [];
  const cpcAreas = data?.cpc_sections || data?.cpc_areas || [];

  const fieldsChartData = fields.slice(0, 8).map((f) => ({
    name: f.technology,
    patents: f.patent_count
  }));

  const sectorChartData = sectors.slice(0, 6).map((s) => ({
    name: s.sector,
    value: s.patent_count
  }));

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Technology Intelligence"
        subtitle="Analyze technology fields, patent concentration, market activity signals, and competitive assignees."
        icon={Cpu}
        badge={data?.source_provenance || "PatentsView Cached Data"}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/technology/emerging" style={styles.emergingBtn}>
            <Sparkles size={15} />
            <span>Emerging Tech</span>
          </Link>
          <button onClick={loadDashboard} style={styles.refreshBtn}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </SectionHeader>

      {/* KPI Overview Grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Total Patents Analyzed"
          value={Number(data?.total_patents || 0).toLocaleString()}
          icon={FileText}
          subtext="325,017 classified in WIPO fields"
          color="#4C8DFF"
        />

        <StatCard
          title="Technology Fields"
          value={fields.length.toString()}
          icon={Cpu}
          subtext="Active technical domains"
          color="#4C8DFF"
        />

        <StatCard
          title="Technology Sectors"
          value={sectors.length.toString()}
          icon={Layers}
          subtext="Macro sectors mapped"
          color="#4C8DFF"
        />

        <StatCard
          title="Active Organizations"
          value={Number(data?.total_organizations || organizations.length || 0).toLocaleString()}
          icon={Building2}
          subtext="Unique patent assignees"
          color="#4C8DFF"
        />
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        <ChartCard
          title="Technology Field Activity"
          subtitle="Top technology fields ranked by total patent filings"
          type="bar"
          data={fieldsChartData}
          dataKey="patents"
          nameKey="name"
          color="#4C8DFF"
          height={260}
        />

        <ChartCard
          title="Technology Sector Distribution"
          subtitle="Patent concentration across broad technological sectors"
          type="pie"
          data={sectorChartData}
          dataKey="value"
          nameKey="name"
          color="#4C8DFF"
          height={260}
        />
      </div>

      {/* Tables & CPC Layout */}
      <div style={styles.layoutGrid}>
        {/* Leading Organizations Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Leading Patent Assignee Organizations</h3>
              <p style={styles.cardSub}>Top corporate and academic holders</p>
            </div>
            <Building2 size={18} color="#4C8DFF" />
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Organization</th>
                  <th style={styles.th}>Patent Count</th>
                </tr>
              </thead>
              <tbody>
                {organizations.slice(0, 10).map((org, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.tdBold}>{org.organization}</td>
                    <td style={{ ...styles.td, color: "#35C98A", fontWeight: "700" }}>
                      {Number(org.patent_count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CPC Technology Areas Card Grid */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>CPC Technology Sections</h3>
              <p style={styles.cardSub}>Cooperative patent classification areas</p>
            </div>
            <Layers size={18} color="#4C8DFF" />
          </div>

          <div style={styles.cpcGrid}>
            {cpcAreas.map((area, idx) => (
              <div key={idx} style={styles.cpcItem}>
                <span style={styles.cpcTitle}>Section {area.section}</span>
                <span style={styles.cpcValue}>{Number(area.patent_count).toLocaleString()} patents</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "28px 36px",
    maxWidth: "1440px",
    margin: "0 auto",
    color: "var(--color-text)"
  },
  emergingBtn: {
    background: "var(--color-primary)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "600",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  refreshBtn: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "20px",
    marginBottom: "24px"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "var(--shadow-card)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: "0 0 2px 0"
  },
  cardSub: {
    fontSize: "11px",
    color: "var(--color-text-muted)",
    margin: 0
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    textAlign: "left"
  },
  th: {
    background: "var(--color-bg-secondary)",
    color: "var(--color-text-muted)",
    fontWeight: "600",
    padding: "10px 14px",
    borderBottom: "1px solid var(--color-border)"
  },
  td: {
    padding: "10px 14px",
    color: "var(--color-text-muted)",
    borderBottom: "1px solid var(--color-border)"
  },
  tdBold: {
    padding: "10px 14px",
    color: "var(--color-text)",
    fontWeight: "600",
    borderBottom: "1px solid var(--color-border)"
  },
  trEven: {
    background: "transparent"
  },
  trOdd: {
    background: "rgba(0, 0, 0, 0.02)"
  },
  cpcGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px"
  },
  cpcItem: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  cpcTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--color-primary)"
  },
  cpcValue: {
    fontSize: "11px",
    color: "var(--color-text-muted)"
  }
};

export default TechnologyDashboard;