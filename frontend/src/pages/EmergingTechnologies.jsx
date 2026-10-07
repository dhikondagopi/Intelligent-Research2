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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTechnologies = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmergingTechnologies();
      setTechnologies(data?.technologies || []);
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

  const totalPatents = technologies.reduce((acc, t) => acc + (t.patent_count || 0), 0);
  const totalOrgs = technologies.reduce((acc, t) => acc + (t.organization_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Emerging Technology Signals"
        description="Identify breakthrough domains with high patenting velocity, organizational focus, and technical momentum."
        badgeText="Technology Radar"
        badgeIcon={<Zap className="w-3.5 h-3.5 text-blue-400" />}
        actionButton={
          <button
            onClick={loadTechnologies}
            disabled={loading}
            style={{
              background: "#101620",
              border: "1px solid #202A38",
              color: "#F2F5F8",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Signals
          </button>
        }
      />

      {/* Methodology Banner */}
      <div style={{
        background: "#101620",
        border: "1px solid #202A38",
        borderRadius: "12px",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="flex items-start gap-3.5">
          <div style={{
            padding: "10px",
            background: "rgba(76, 141, 255, 0.12)",
            border: "1px solid rgba(76, 141, 255, 0.3)",
            borderRadius: "8px",
            color: "#4C8DFF",
            flexShrink: 0
          }}>
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#F2F5F8" }}>
              Evidence-Based Signals Methodology
            </h4>
            <p style={{ fontSize: "12px", color: "#98A4B5", lineHeight: "1.6", margin: 0 }}>
              This index uses multi-source activity signals—patent velocity, organizational filings, and inventor growth—as dynamic proxies for emerging field momentum. Records are synthesized from cross-institution patent publications.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Monitored Domains"
          value={loading ? "..." : technologies.length}
          trend={technologies.length > 0 ? "High Growth" : null}
          icon={Cpu}
          color="#4C8DFF"
          badge="Active Fields"
        />
        <StatCard
          title="Aggregated Patent Volume"
          value={loading ? "..." : totalPatents.toLocaleString()}
          icon={Database}
          color="#4C8DFF"
          badge="2025 Data"
        />
        <StatCard
          title="Active Organizations"
          value={loading ? "..." : totalOrgs.toLocaleString()}
          icon={Users}
          color="#4C8DFF"
          badge="Assignees"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={6} />
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

      {/* Technology Grid */}
      {!loading && !error && technologies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((technology, index) => (
            <div
              key={technology.technology || technology._id || index}
              style={{
                background: "#101620",
                border: "1px solid #202A38",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#98A4B5", fontWeight: "600" }}>
                      SIGNAL #{String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", marginTop: "2px", lineHeight: "1.3" }}>
                      {technology.technology || "Unknown Domain"}
                    </h3>
                  </div>
                  <div style={{
                    padding: "10px",
                    background: "#0B0F17",
                    border: "1px solid #202A38",
                    borderRadius: "8px",
                    color: "#4C8DFF",
                    flexShrink: 0
                  }}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* Badge */}
                <div className="mb-5">
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background: "rgba(76, 141, 255, 0.12)",
                    color: "#4C8DFF",
                    border: "1px solid rgba(76, 141, 255, 0.3)"
                  }}>
                    <Zap className="w-3 h-3" />
                    {technology.indicator || "High Patent Velocity"}
                  </span>
                </div>

                {/* Activity Stats */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "14px",
                  background: "#0B0F17",
                  border: "1px solid #202A38",
                  borderRadius: "10px",
                  marginBottom: "16px"
                }}>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span style={{ color: "#98A4B5" }}>Patents</span>
                    </div>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#F2F5F8", fontFamily: "var(--font-mono)" }}>
                      {(technology.patent_count || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span style={{ color: "#98A4B5" }}>Organizations</span>
                    </div>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#F2F5F8", fontFamily: "var(--font-mono)" }}>
                      {(technology.organization_count || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-5">
                  <span className="flex items-center gap-1" style={{ color: "#98A4B5" }}>
                    <UserCheck className="w-3.5 h-3.5" />
                    Active Inventors
                  </span>
                  <span style={{ fontWeight: "600", color: "#F2F5F8", fontFamily: "var(--font-mono)" }}>
                    {(technology.inventor_count || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action */}
              <Link
                to={`/technology/${encodeURIComponent(technology.technology)}`}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#4C8DFF",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
              >
                <span>Analyze Domain</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmergingTechnologies;