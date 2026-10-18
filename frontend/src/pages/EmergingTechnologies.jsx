import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Database,
  Users,
  ArrowRight,
  RefreshCw,
  Cpu,
  UserCheck,
  Zap,
  Info
} from "lucide-react";

import { getEmergingTechnologies } from "../services/technologyService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

function EmergingTechnologies() {
  const [technologies, setTechnologies] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTechnologies = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmergingTechnologies();
      if (data && Array.isArray(data.technologies)) {
        setTechnologies(data.technologies);
        setMeta(data);
      } else if (Array.isArray(data)) {
        setTechnologies(data);
        setMeta(null);
      } else {
        setTechnologies([]);
        setMeta(null);
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Unable to load emerging technologies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnologies();
  }, []);

  const totalPatents = meta?.total_monitored_patents ??
    technologies.reduce((acc, t) => acc + (t.patent_count || 0), 0);

  const uniqueOrgs = meta?.total_unique_organizations ?? 41599;
  const domainAssociations = meta?.domain_organization_associations ??
    technologies.reduce((acc, t) => acc + (t.organization_count || 0), 0);

  const maxPatents = technologies.length > 0
    ? Math.max(...technologies.map(t => t.patent_count || 0))
    : 1;

  return (
    <div style={styles.container}>
      {/* Header */}
      <SectionHeader
        title="Emerging Technology Signals"
        subtitle="Identify breakthrough domains with high patenting velocity, organizational focus, and technical momentum."
        badge={meta?.source_provenance || "PatentsView Cached Dataset"}
        icon={Zap}
      >
        <button
          onClick={loadTechnologies}
          disabled={loading}
          style={styles.refreshBtn}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Signals</span>
        </button>
      </SectionHeader>

      {/* Methodology & Provenance Banner */}
      <div style={styles.banner}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div style={styles.bannerIcon}>
            <Info size={20} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text)", margin: 0 }}>
                Data Scope & Activity Signal Methodology
              </h4>
              <span style={styles.provenancePill}>
                PatentsView Cached Dataset
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: "1.6", margin: 0 }}>
              Emerging technology rankings reflect <strong>279,044 patents</strong> across the top 20 monitored domains from the 325,828-record repository.
              Patent velocity and assignee momentum serve as evidence-based <em>R&D activity proxies</em>. They reflect institutional intellectual property commitments and technical focus, rather than direct commercial market adoption.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Monitored Domains"
          value={loading ? "..." : technologies.length.toString()}
          trend={technologies.length > 0 ? "Top 20 Tracked" : null}
          icon={Cpu}
          color="#4C8DFF"
          badge="Technology Clusters"
          subtext="High-velocity technical fields"
        />
        <StatCard
          title="Monitored Patent Volume"
          value={loading ? "..." : Number(totalPatents).toLocaleString()}
          icon={Database}
          color="#4C8DFF"
          badge="Top 20 Domains"
          subtext="Subset of 325,828 corpus patents"
        />
        <StatCard
          title="Active Organizations"
          value={loading ? "..." : Number(uniqueOrgs).toLocaleString()}
          icon={Users}
          color="#4C8DFF"
          badge="Unique Assignees"
          subtext={`${Number(domainAssociations).toLocaleString()} domain participations`}
        />
      </div>

      {/* States */}
      {loading && (
        <div style={styles.cardsGrid}>
          <LoadingSkeleton type="card" count={6} height={220} />
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadTechnologies} />}

      {!loading && !error && technologies.length === 0 && (
        <EmptyState
          title="No Emerging Technologies Detected"
          description="We couldn't locate technology cluster signals in the current dataset."
          actionText="Reload Data"
          onAction={loadTechnologies}
        />
      )}

      {/* Technology Cards Grid */}
      {!loading && !error && technologies.length > 0 && (
        <div style={styles.cardsGrid}>
          {technologies.map((tech, index) => {
            const domainName = tech.technology || "Unknown Domain";
            const pCount = tech.patent_count || 0;
            const orgCount = tech.organization_count || 0;
            const invCount = tech.inventor_count || 0;
            const velocityRatio = Math.min(100, Math.round((pCount / maxPatents) * 100));

            return (
              <div key={domainName + index} style={styles.card}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={styles.signalNumber}>
                          SIGNAL #{String(index + 1).padStart(2, '0')}
                        </span>
                        <span style={styles.indicatorPill}>
                          {tech.indicator || "High Patent Velocity"}
                        </span>
                      </div>
                      <h3 title={domainName} style={styles.cardTitle}>
                        {domainName}
                      </h3>
                    </div>

                    <div style={styles.trendIcon}>
                      <TrendingUp size={16} />
                    </div>
                  </div>

                  {/* Relative Velocity Bar */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>R&D Activity Velocity</span>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--color-primary)" }}>
                        {velocityRatio}% of peak
                      </span>
                    </div>
                    <div style={styles.velocityTrack}>
                      <div
                        style={{
                          width: `${velocityRatio}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #4C8DFF, #35C98A)",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div style={styles.metricsGrid}>
                    <div>
                      <div style={styles.metricLabel}>
                        <Database size={12} color="#4C8DFF" />
                        <span>Patents</span>
                      </div>
                      <p style={styles.metricValue}>
                        {pCount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <div style={styles.metricLabel}>
                        <Users size={12} color="#35C98A" />
                        <span>Assignees</span>
                      </div>
                      <p style={styles.metricValue}>
                        {orgCount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <div style={styles.metricLabel}>
                        <UserCheck size={12} color="#D9A441" />
                        <span>Inventors</span>
                      </div>
                      <p style={styles.metricValue}>
                        {invCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <Link
                  to={`/technology/${encodeURIComponent(domainName)}`}
                  style={styles.actionBtn}
                >
                  <span>Analyze Domain</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
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
    color: "var(--color-text)",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  refreshBtn: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "var(--shadow-sm)"
  },
  banner: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "14px",
    padding: "18px 22px",
    boxShadow: "var(--shadow-sm)"
  },
  bannerIcon: {
    padding: "8px",
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    color: "var(--color-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  provenancePill: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "12px",
    background: "var(--color-primary-subtle)",
    color: "var(--color-primary)",
    border: "1px solid var(--color-border)"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px"
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "14px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "18px",
    boxShadow: "var(--shadow-card)",
    transition: "transform 0.15s ease, border-color 0.15s ease"
  },
  signalNumber: {
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    color: "var(--color-text-dim)",
    fontWeight: "700"
  },
  indicatorPill: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "1px 7px",
    borderRadius: "12px",
    background: "var(--color-primary-subtle)",
    color: "var(--color-primary)",
    border: "1px solid var(--color-border)"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--color-text)",
    margin: 0,
    lineHeight: "1.35",
    wordBreak: "break-word"
  },
  trendIcon: {
    padding: "8px",
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    color: "var(--color-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  velocityTrack: {
    width: "100%",
    height: "6px",
    background: "var(--color-bg-secondary)",
    borderRadius: "4px",
    overflow: "hidden",
    border: "1px solid var(--color-border)"
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    padding: "12px",
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px"
  },
  metricLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    color: "var(--color-text-muted)",
    marginBottom: "4px"
  },
  metricValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--color-text)",
    fontFamily: "var(--font-mono)",
    margin: 0
  },
  actionBtn: {
    width: "100%",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "8px",
    background: "var(--color-primary)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    boxShadow: "var(--shadow-sm)",
    transition: "background-color 0.15s ease"
  }
};

export default EmergingTechnologies;