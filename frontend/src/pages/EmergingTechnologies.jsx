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
        badgeIcon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
        actionButton={
          <button
            onClick={loadTechnologies}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-navy-800 border border-slate-700 hover:bg-navy-700 text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Signals
          </button>
        }
      />

      {/* Methodology Banner */}
      <div className="bg-navy-900/80 border border-blue-500/20 rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">
              Evidence-Based Signals Methodology
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
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
          trendDirection="up"
          icon={<Cpu className="w-5 h-5 text-indigo-400" />}
          badgeText="Active Fields"
        />
        <StatCard
          title="Aggregated Patent Volume"
          value={loading ? "..." : totalPatents.toLocaleString()}
          icon={<Database className="w-5 h-5 text-cyan-400" />}
          badgeText="2025 Data"
        />
        <StatCard
          title="Active Organizations"
          value={loading ? "..." : totalOrgs.toLocaleString()}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          badgeText="Assignees"
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
              className="group bg-navy-900/60 border border-slate-800 hover:border-blue-500/40 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      SIGNAL #{String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors mt-0.5 leading-snug">
                      {technology.technology || "Unknown Domain"}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-navy-800 border border-slate-700/60 rounded-lg text-blue-400 group-hover:border-blue-500/30 transition-all shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* Badge */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    <Zap className="w-3 h-3" />
                    {technology.indicator || "High Patent Velocity"}
                  </span>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-navy-950/70 border border-slate-800/80 rounded-lg mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>Patents</span>
                    </div>
                    <p className="text-base font-bold text-slate-100 font-mono tracking-tight">
                      {(technology.patent_count || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Organizations</span>
                    </div>
                    <p className="text-base font-bold text-slate-100 font-mono tracking-tight">
                      {(technology.organization_count || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-5">
                  <span className="flex items-center gap-1 text-slate-500">
                    <UserCheck className="w-3.5 h-3.5" />
                    Active Inventors
                  </span>
                  <span className="font-medium text-slate-200 font-mono">
                    {(technology.inventor_count || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action */}
              <Link
                to={`/technology/${encodeURIComponent(technology.technology)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-blue-500 text-xs font-semibold transition-all duration-200 shadow-sm"
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