import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  FileText,
  Rocket,
  Building2,
  RefreshCw,
  Database,
  Users,
  Briefcase,
  CheckCircle2,
  Info,
  ChevronRight
} from "lucide-react";

import { getCommercializationDashboard } from "../services/commercializationService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

function Commercialization() {
  const { technology } = useParams();
  const technologyName = decodeURIComponent(technology || "Artificial Intelligence");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getCommercializationDashboard(technologyName);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Unable to load commercialization analysis.");
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
        <LoadingSkeleton type="kpi" count={3} />
        <div style={{ marginTop: "20px" }}>
          <LoadingSkeleton type="card" count={2} height={260} />
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

  const pathways = data?.pathways || {};
  const evidence = data?.evidence || {};

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Commercialization Pathways Intelligence"
        subtitle={`Technology Transfer & Market Readiness Screening for '${technologyName}'`}
        icon={Briefcase}
        badge="Opportunity Screening"
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/technology/${encodeURIComponent(technologyName)}`} style={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>Back to Technology</span>
          </Link>
          <button onClick={loadData} style={styles.refreshBtn}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </SectionHeader>

      {/* Technology Evidence KPI Summary */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Supporting Patents"
          value={Number(evidence.patent_count || 0).toLocaleString()}
          icon={Database}
          subtext="Patent evidence base"
          color="#3b82f6"
        />
        <StatCard
          title="Engaged Organizations"
          value={Number(evidence.organization_count || 0).toLocaleString()}
          icon={Building2}
          subtext="Commercial ecosystem"
          color="#7c3aed"
        />
        <StatCard
          title="Inventor Activity"
          value={Number(evidence.inventor_count || 0).toLocaleString()}
          icon={Users}
          subtext="Active inventors"
          color="#10b981"
        />
      </div>

      {/* Disclaimers & Methodology Banner */}
      <div style={styles.noticeBox}>
        <Info size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={styles.noticeTitle}>Opportunity Screening Disclaimer</h4>
          <p style={styles.noticeText}>
            Commercialization pathways are derived from patent density and organization participation in the dataset. They represent potential market opportunities and transfer pathways, not guaranteed commercial outcomes.
          </p>
        </div>
      </div>

      {/* 4 Pathway Cards Grid */}
      <div style={styles.pathwayGrid}>
        <PathwayCard
          title="Productization Pathway"
          icon={Package}
          color="#3b82f6"
          data={pathways.productization}
        />

        <PathwayCard
          title="Licensing Pathway"
          icon={FileText}
          color="#7c3aed"
          data={pathways.licensing}
        />

        <PathwayCard
          title="Startup Creation"
          icon={Rocket}
          color="#f59e0b"
          data={pathways.startup}
        />

        <PathwayCard
          title="Industry Partnership"
          icon={Building2}
          color="#10b981"
          data={pathways.industry_partnership}
        />
      </div>
    </div>
  );
}

function PathwayCard({ title, icon: Icon, color, data }) {
  if (!data) return null;

  return (
    <div style={styles.pathwayCard}>
      <div style={styles.pathwayHeader}>
        <div style={{ ...styles.iconBox, background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <h3 style={styles.pathwayTitle}>{title}</h3>
          <span style={styles.readinessBadge}>{data.readiness || "Screening"}</span>
        </div>
      </div>

      <div style={styles.pathwaySection}>
        <h4 style={styles.sectionHeader}>Evidence Signals</h4>
        <div style={styles.tagsRow}>
          {(data.signals || []).map((sig, i) => (
            <span key={i} style={styles.signalTag}>
              <CheckCircle2 size={11} style={{ marginRight: 4 }} /> {sig}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.pathwaySection}>
        <h4 style={styles.sectionHeader}>Recommended Next Steps</h4>
        <ul style={styles.actionsList}>
          {(data.recommended_actions || []).map((act, i) => (
            <li key={i} style={styles.actionItem}>
              {act}
            </li>
          ))}
        </ul>
      </div>

      {data.note && (
        <div style={styles.noteBox}>
          <span style={styles.noteText}>{data.note}</span>
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
    color: "#f8fafc"
  },
  backBtn: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
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
  noticeBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "16px 20px",
    display: "flex",
    gap: "12px",
    marginBottom: "28px"
  },
  noticeTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 4px 0"
  },
  noticeText: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: "1.5"
  },
  pathwayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px"
  },
  pathwayCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  pathwayHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "16px"
  },
  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  pathwayTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: "0 0 4px 0"
  },
  readinessBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#34d399",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  pathwaySection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  sectionHeader: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    margin: 0
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  signalTag: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
    fontSize: "11px",
    padding: "4px 9px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center"
  },
  actionsList: {
    margin: 0,
    paddingLeft: "18px",
    fontSize: "12px",
    color: "#cbd5e1",
    lineHeight: "1.6"
  },
  actionItem: {
    marginBottom: "4px"
  },
  noteBox: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "10px 12px",
    marginTop: "auto"
  },
  noteText: {
    fontSize: "11px",
    color: "#64748b",
    lineHeight: "1.4"
  }
};

export default Commercialization;