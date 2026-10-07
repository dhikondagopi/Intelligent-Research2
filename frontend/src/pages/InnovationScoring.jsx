import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Database,
  Lightbulb,
  Award,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";

import { getInnovationDashboard } from "../services/innovationService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

function InnovationScoring() {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getInnovationDashboard();
      setTechnologies(data?.technologies || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Unable to load innovation scores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSkeleton type="kpi" count={4} />
        <div style={{ marginTop: "20px" }}>
          <LoadingSkeleton type="card" count={2} height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const chartData = technologies.slice(0, 8).map((t) => ({
    name: t.technology,
    score: t.innovation_score || 0
  }));

  const avgScore = technologies.length
    ? (technologies.reduce((acc, t) => acc + (t.innovation_score || 0), 0) / technologies.length).toFixed(1)
    : 0;

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Cross-Domain Innovation Scoring"
        subtitle="Explainable innovation assessment connecting Research Novelty, Patent Strength, Technology Maturity, Market Potential, and Funding Relevance."
        icon={Sparkles}
        badge="Multi-Factor Model"
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/technology" style={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>Technology Intelligence</span>
          </Link>
          <button onClick={loadData} style={styles.refreshBtn}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </SectionHeader>

      {/* KPI Overview Grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Technologies Evaluated"
          value={technologies.length.toString()}
          icon={Layers}
          subtext="Active tech domains"
          color="#4C8DFF"
        />

        <StatCard
          title="Average Innovation Score"
          value={`${avgScore} / 100`}
          icon={Sparkles}
          subtext="Cross-domain index"
          color="#4C8DFF"
        />

        <StatCard
          title="Highest Scoring Field"
          value={technologies[0]?.technology || "N/A"}
          icon={Award}
          subtext={`Score: ${technologies[0]?.innovation_score || 0}`}
          color="#4C8DFF"
        />
      </div>

      {/* Formula Explanation Banner */}
      <div style={styles.formulaCard}>
        <div style={styles.formulaHeader}>
          <Info size={18} color="#4C8DFF" />
          <h3 style={styles.formulaTitle}>Explainable Innovation Scoring Model</h3>
        </div>
        <p style={styles.formulaDesc}>
          Composite scores (0-100) are computed dynamically by weighting available evidence across 5 core innovation vectors. Weights are normalized automatically if specific data is unavailable.
        </p>

        <div style={styles.factorGrid}>
          <FactorCard name="Research Novelty" weight="30%" desc="Citation velocity & publication freshness" color="#4C8DFF" />
          <FactorCard name="Patent Strength" weight="20%" desc="Patent portfolio volume & claims" color="#4C8DFF" />
          <FactorCard name="Market Potential" weight="20%" desc="Industry assignee concentration" color="#4C8DFF" />
          <FactorCard name="Tech Maturity" weight="15%" desc="Growth stage (Early -> Established)" color="#4C8DFF" />
          <FactorCard name="Funding Relevance" weight="15%" desc="NIH grant alignment & awards" color="#4C8DFF" />
        </div>
      </div>

      {/* Score Comparison Chart */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <ChartCard
            title="Technology Innovation Velocity Ranking"
            subtitle="Composite innovation score breakdown across top evaluated fields"
            type="bar"
            data={chartData}
            dataKey="score"
            nameKey="name"
            color="#4C8DFF"
            height={260}
          />
        </div>
      )}

      {/* Technologies Score Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Evaluated Technology Signals</h3>
          <span style={styles.countBadge}>{technologies.length} Fields</span>
        </div>

        {technologies.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Innovation Scores"
            message="No technology fields currently evaluated in the database."
          />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Technology Field</th>
                  <th style={styles.th}>Innovation Score</th>
                  <th style={styles.th}>Signal Status</th>
                  <th style={styles.th}>Supporting Patents</th>
                  <th style={styles.th}>Detailed Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {technologies.map((t, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.tdBold}>{t.technology}</td>
                    <td style={styles.td}>
                      <span style={styles.scoreBadge}>
                        {t.innovation_score !== undefined ? `${t.innovation_score} / 100` : "N/A"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.signalBadge}>{t.rating || "High Potential"}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Database size={13} color="#98A4B5" />
                        {Number(t.patent_count || 0).toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link to={`/innovation/${encodeURIComponent(t.technology)}`} style={styles.detailLink}>
                        <span>View Score</span>
                        <ChevronRight size={14} />
                      </Link>
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

function FactorCard({ name, weight, desc, color }) {
  return (
    <div style={styles.factorItem}>
      <div style={styles.factorTop}>
        <span style={styles.factorName}>{name}</span>
        <span style={{ ...styles.factorWeight, color }}>{weight}</span>
      </div>
      <span style={styles.factorDesc}>{desc}</span>
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
  backBtn: {
    background: "#101620",
    border: "1px solid #202A38",
    color: "#F2F5F8",
    fontSize: "12px",
    fontWeight: "600",
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px"
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "28px"
  },
  formulaCard: {
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  formulaHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  formulaTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F2F5F8",
    margin: 0
  },
  formulaDesc: {
    fontSize: "13px",
    color: "#98A4B5",
    margin: 0,
    lineHeight: "1.5"
  },
  factorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
    marginTop: "8px"
  },
  factorItem: {
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  factorTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  factorName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#F2F5F8"
  },
  factorWeight: {
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "-0.02em"
  },
  factorDesc: {
    fontSize: "11px",
    color: "#98A4B5"
  },
  tableCard: {
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#F2F5F8",
    margin: 0
  },
  countBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
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
    background: "#0B0F17",
    color: "#98A4B5",
    fontWeight: "600",
    padding: "12px 14px",
    borderBottom: "1px solid #202A38"
  },
  td: {
    padding: "12px 14px",
    color: "#98A4B5",
    borderBottom: "1px solid #202A38"
  },
  tdBold: {
    padding: "12px 14px",
    color: "#F2F5F8",
    fontWeight: "600",
    borderBottom: "1px solid #202A38"
  },
  trEven: {
    background: "transparent"
  },
  trOdd: {
    background: "rgba(255, 255, 255, 0.015)"
  },
  scoreBadge: {
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    color: "#4C8DFF",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    fontSize: "12px",
    padding: "4px 9px",
    borderRadius: "6px"
  },
  signalBadge: {
    background: "rgba(53, 201, 138, 0.12)",
    color: "#35C98A",
    fontSize: "11px",
    fontWeight: "500",
    padding: "3px 8px",
    borderRadius: "4px"
  },
  detailLink: {
    color: "#4C8DFF",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  }
};

export default InnovationScoring;