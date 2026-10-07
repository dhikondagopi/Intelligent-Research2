import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Lightbulb,
  Database,
  Building2,
  Users,
  FlaskConical,
  DollarSign,
  Target,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

import { getInnovationScore } from "../services/innovationService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

function InnovationDetails() {
  const { technology } = useParams();
  const technologyName = decodeURIComponent(technology || "");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getInnovationScore(technologyName);
      setData(result);
    } catch (err) {
      console.error("Innovation Details Error:", err);
      setError(
        err?.response?.data?.detail ||
        "Unable to load innovation score for " + technologyName
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (technologyName) {
      loadData();
    }
  }, [technologyName]);

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSkeleton type="kpi" count={4} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Link to="/innovation" style={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Back to Innovation Index</span>
        </Link>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const factors = [
    {
      name: "Research Novelty",
      key: "research_novelty",
      icon: FlaskConical,
      color: "#4C8DFF",
      weight: "30%"
    },
    {
      name: "Patent Strength",
      key: "patent_strength",
      icon: Database,
      color: "#4C8DFF",
      weight: "20%"
    },
    {
      name: "Technology Maturity",
      key: "technology_maturity",
      icon: TrendingUp,
      color: "#4C8DFF",
      weight: "15%"
    },
    {
      name: "Market Potential",
      key: "market_potential",
      icon: Target,
      color: "#4C8DFF",
      weight: "20%"
    },
    {
      name: "Funding Relevance",
      key: "funding_relevance",
      icon: DollarSign,
      color: "#4C8DFF",
      weight: "15%"
    }
  ];

  const scoreVal = data?.innovation_score !== null && data?.innovation_score !== undefined
    ? Number(data.innovation_score).toFixed(1)
    : "N/A";

  return (
    <div style={styles.container}>
      {/* Navigation link */}
      <div>
        <Link to="/innovation" style={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Back to Innovation Index</span>
        </Link>
      </div>

      {/* Section Header */}
      <SectionHeader
        title={technologyName}
        subtitle="Multi-factor explainable innovation analysis with quantitative indicator weighting."
        icon={Lightbulb}
        badge="Explainable Score"
      >
        <button onClick={loadData} style={styles.refreshBtn}>
          <RefreshCw size={15} />
          <span>Recalculate Score</span>
        </button>
      </SectionHeader>

      {/* Hero Score Showcase Card */}
      <div style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <span style={styles.heroSub}>COMPOSITE INNOVATION RATING</span>
          <div style={styles.scoreRow}>
            <span style={styles.scoreNumber}>{scoreVal}</span>
            <span style={styles.scoreMax}>/ 100</span>
          </div>
          <div style={{ marginTop: "6px" }}>
            <span style={styles.ratingBadge}>
              <Award size={14} style={{ marginRight: "4px" }} />
              Rating: {data?.rating || "Evaluated"}
            </span>
          </div>
        </div>

        <div style={styles.heroIconBox}>
          <Lightbulb size={48} color="#4C8DFF" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Patents Tracked"
          value={(data?.evidence?.patent_count || 0).toLocaleString()}
          icon={Database}
          color="#4C8DFF"
          badge="USPTO/WIPO"
        />
        <StatCard
          title="Organizations"
          value={(data?.evidence?.organization_count || 0).toLocaleString()}
          icon={Building2}
          color="#4C8DFF"
          badge="Assignees"
        />
        <StatCard
          title="Inventors Base"
          value={(data?.evidence?.inventor_count || 0).toLocaleString()}
          icon={Users}
          color="#4C8DFF"
          badge="Contributors"
        />
        <StatCard
          title="Technical Maturity"
          value={data?.technology_maturity?.stage || "Growth"}
          icon={TrendingUp}
          color="#4C8DFF"
          badge="Phase"
        />
      </div>

      {/* Weighted Score Breakdown */}
      <div style={styles.cardSection}>
        <div style={styles.sectionHeaderRow}>
          <h3 style={styles.cardTitle}>Weighted Score Breakdown</h3>
          <span style={styles.formulaTag}>Formula: 30% + 20% + 15% + 20% + 15%</span>
        </div>

        <div style={styles.factorsGrid}>
          {factors.map((factor) => {
            const val = data?.factors?.[factor.key];
            const breakdown = data?.factor_breakdown?.[factor.key];
            const displayVal = val !== null && val !== undefined ? Number(val).toFixed(1) : null;
            const IconComp = factor.icon;

            return (
              <div key={factor.key} style={styles.factorTile}>
                <div style={styles.factorHeader}>
                  <div style={styles.factorIconBox}>
                    <IconComp size={16} color="#4C8DFF" />
                  </div>
                  <div>
                    <h4 style={styles.factorName}>{factor.name}</h4>
                    <span style={styles.factorWeight}>Weight {factor.weight}</span>
                  </div>
                </div>

                <div style={styles.scoreBody}>
                  <div style={styles.factorScoreRow}>
                    <span style={styles.factorScoreVal}>
                      {displayVal ? `${displayVal}` : "N/A"}
                    </span>
                    <span style={styles.factorScoreMax}>/ 100</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div style={styles.progressBarTrack}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${Math.min(100, Math.max(0, val || 0))}%`,
                        background: "#4C8DFF"
                      }}
                    />
                  </div>
                </div>

                {breakdown && (
                  <div style={styles.contributionRow}>
                    <span>Contribution: </span>
                    <strong style={{ color: "#4C8DFF" }}>
                      {(breakdown.effective_weight * 100).toFixed(1)}%
                    </strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Source Evidence Audit */}
      <div style={styles.cardSection}>
        <h3 style={styles.cardTitle}>Multi-Source Evidence Audit</h3>
        <div style={styles.evidenceGrid}>
          <div style={styles.evidenceBox}>
            <span style={styles.evidenceLabel}>Patent Volume</span>
            <span style={styles.evidenceVal}>{(data?.evidence?.patent_count || 0).toLocaleString()}</span>
          </div>
          <div style={styles.evidenceBox}>
            <span style={styles.evidenceLabel}>Organizations</span>
            <span style={styles.evidenceVal}>{(data?.evidence?.organization_count || 0).toLocaleString()}</span>
          </div>
          <div style={styles.evidenceBox}>
            <span style={styles.evidenceLabel}>Inventors</span>
            <span style={styles.evidenceVal}>{(data?.evidence?.inventor_count || 0).toLocaleString()}</span>
          </div>
          <div style={styles.evidenceBox}>
            <span style={styles.evidenceLabel}>Research Signal</span>
            <span style={{ ...styles.evidenceVal, color: "#4C8DFF" }}>
              {data?.evidence?.research_signal ?? "Available"}
            </span>
          </div>
          <div style={styles.evidenceBox}>
            <span style={styles.evidenceLabel}>Funding Signal</span>
            <span style={{ ...styles.evidenceVal, color: "#4C8DFF" }}>
              {data?.evidence?.funding_signal ?? "Available"}
            </span>
          </div>
        </div>
      </div>

      {/* Methodology & Transparency */}
      {data?.methodology && (
        <div style={styles.cardSection}>
          <h3 style={styles.cardTitle}>Scoring Methodology & Transparency</h3>
          <div style={styles.methodologyList}>
            {data.methodology.formula && (
              <p style={styles.methodologyItem}>
                • <strong>Formula:</strong> {data.methodology.formula}
              </p>
            )}
            {data.methodology.missing_data && (
              <p style={styles.methodologyItem}>
                • <strong>Data Strategy:</strong> {data.methodology.missing_data}
              </p>
            )}
            {data.methodology.maturity_note && (
              <p style={styles.methodologyItem}>
                • <strong>Maturity Modeling:</strong> {data.methodology.maturity_note}
              </p>
            )}
            {data.methodology.market_potential_note && (
              <p style={styles.methodologyItem}>
                • <strong>Market Proxy:</strong> {data.methodology.market_potential_note}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "28px 36px",
    maxWidth: "1440px",
    margin: "0 auto",
    color: "#F2F5F8",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#4C8DFF",
    textDecoration: "none",
    transition: "color 0.15s ease"
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
  heroCard: {
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "16px",
    padding: "28px 36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
    flexWrap: "wrap",
    gap: "20px"
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  heroSub: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#98A4B5",
    letterSpacing: "0.08em"
  },
  scoreRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px"
  },
  scoreNumber: {
    fontSize: "52px",
    fontWeight: "800",
    color: "#4C8DFF",
    letterSpacing: "-0.03em",
    lineHeight: "1"
  },
  scoreMax: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#98A4B5"
  },
  ratingBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(53, 201, 138, 0.12)",
    border: "1px solid rgba(53, 201, 138, 0.3)",
    color: "#35C98A",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },
  heroIconBox: {
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    padding: "16px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px"
  },
  cardSection: {
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#F2F5F8",
    margin: 0
  },
  formulaTag: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#98A4B5",
    background: "#0B0F17",
    border: "1px solid #202A38",
    padding: "4px 10px",
    borderRadius: "6px"
  },
  factorsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  factorTile: {
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  factorHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  factorIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    background: "rgba(76, 141, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  factorName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F2F5F8",
    margin: 0
  },
  factorWeight: {
    fontSize: "10px",
    color: "#98A4B5"
  },
  scoreBody: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  factorScoreRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  factorScoreVal: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#F2F5F8",
    letterSpacing: "-0.02em"
  },
  factorScoreMax: {
    fontSize: "11px",
    color: "#98A4B5"
  },
  progressBarTrack: {
    width: "100%",
    height: "6px",
    background: "#202A38",
    borderRadius: "3px",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.4s ease"
  },
  contributionRow: {
    fontSize: "11px",
    color: "#98A4B5",
    borderTop: "1px solid #202A38",
    paddingTop: "8px"
  },
  evidenceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px"
  },
  evidenceBox: {
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  evidenceLabel: {
    fontSize: "11px",
    color: "#98A4B5",
    fontWeight: "500"
  },
  evidenceVal: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F2F5F8"
  },
  methodologyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  methodologyItem: {
    fontSize: "12px",
    color: "#98A4B5",
    lineHeight: "1.5",
    margin: 0
  }
};

export default InnovationDetails;