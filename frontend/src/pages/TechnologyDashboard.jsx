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
  const organizations = data?.top_organizations || [];
  const cpcAreas = data?.cpc_areas || [];

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
        subtitle="Analyze technology fields, patent concentration, market adoption signals, and competitive assignees."
        icon={Cpu}
        badge="WIPO / USPTO Data"
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
          subtext="Patent repository"
          color="#3b82f6"
        />

        <StatCard
          title="Technology Fields"
          value={fields.length.toString()}
          icon={Cpu}
          subtext="Categorized fields"
          color="#7c3aed"
        />

        <StatCard
          title="Technology Sectors"
          value={sectors.length.toString()}
          icon={Layers}
          subtext="Identified sectors"
          color="#c084fc"
        />

        <StatCard
          title="Leading Organizations"
          value={organizations.length.toString()}
          icon={Building2}
          subtext="Patent holders"
          color="#10b981"
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
          color="#2563eb"
          height={260}
        />

        <ChartCard
          title="Technology Sector Distribution"
          subtitle="Patent concentration across broad technological sectors"
          type="pie"
          data={sectorChartData}
          dataKey="value"
          nameKey="name"
          color="#7c3aed"
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
            <Building2 size={18} color="#60a5fa" />
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
                    <td style={{ ...styles.td, color: "#34d399", fontWeight: "700" }}>
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
            <Layers size={18} color="#c084fc" />
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
    color: "#f8fafc"
  },
  emergingBtn: {
    background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
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
    gridTemplateColumns: "1.2fr 1fr",
    gap: "20px"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: "0 0 2px 0"
  },
  cardSub: {
    fontSize: "11px",
    color: "#64748b",
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
    background: "#0b0f19",
    color: "#94a3b8",
    fontWeight: "600",
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
  cpcGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px"
  },
  cpcItem: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  cpcTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#c084fc"
  },
  cpcValue: {
    fontSize: "11px",
    color: "#94a3b8"
  }
};

export default TechnologyDashboard;