import { useEffect, useState } from "react";
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
  CheckCircle2,
  HelpCircle
} from "lucide-react";

import { getInnovationScore } from "../services/innovationService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

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
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Unable to load innovation score."
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
      <div className="space-y-6">
        <LoadingSkeleton type="kpi" count={4} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const factors = [
    {
      name: "Research Novelty",
      key: "research_novelty",
      icon: <FlaskConical className="w-4 h-4 text-purple-400" />,
      weight: "30%"
    },
    {
      name: "Patent Strength",
      key: "patent_strength",
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      weight: "20%"
    },
    {
      name: "Technology Maturity",
      key: "technology_maturity",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      weight: "15%"
    },
    {
      name: "Market Potential",
      key: "market_potential",
      icon: <Target className="w-4 h-4 text-amber-400" />,
      weight: "20%"
    },
    {
      name: "Funding Relevance",
      key: "funding_relevance",
      icon: <DollarSign className="w-4 h-4 text-indigo-400" />,
      weight: "15%"
    }
  ];

  const scoreVal = data?.innovation_score !== null && data?.innovation_score !== undefined
    ? Number(data.innovation_score).toFixed(1)
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Navigation link */}
      <div>
        <Link
          to="/innovation"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Innovation Index
        </Link>
      </div>

      {/* Header */}
      <SectionHeader
        title={technologyName}
        description="Multi-factor explainable innovation analysis with quantitative indicator weighting."
        badgeText="Explainable Score"
        badgeIcon={<Lightbulb className="w-3.5 h-3.5 text-amber-400" />}
        actionButton={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-navy-800 border border-slate-700 hover:bg-navy-700 text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Recalculate Score
          </button>
        }
      />

      {/* Hero Score Showcase */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-900/90 to-blue-950/40 border border-slate-800 rounded-xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Composite Innovation Rating
          </span>
          <div className="flex items-baseline gap-4 justify-center md:justify-start">
            <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 font-mono tracking-tight">
              {scoreVal}
            </span>
            <span className="text-xl font-semibold text-slate-400 font-mono">/100</span>
          </div>
          <div className="flex items-center gap-2 justify-center md:justify-start pt-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-3.5 h-3.5" />
              Rating: {data?.rating || "Evaluated"}
            </span>
          </div>
        </div>

        <div className="p-6 bg-navy-800/80 border border-slate-700/60 rounded-2xl text-amber-400 shadow-inner flex items-center justify-center shrink-0">
          <Lightbulb className="w-16 h-16 stroke-[1.2]" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patents Tracked"
          value={(data?.evidence?.patent_count || 0).toLocaleString()}
          icon={<Database className="w-5 h-5 text-indigo-400" />}
          badgeText="USPTO/WIPO"
        />
        <StatCard
          title="Organizations"
          value={(data?.evidence?.organization_count || 0).toLocaleString()}
          icon={<Building2 className="w-5 h-5 text-cyan-400" />}
          badgeText="Assignees"
        />
        <StatCard
          title="Inventors Base"
          value={(data?.evidence?.inventor_count || 0).toLocaleString()}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          badgeText="Contributors"
        />
        <StatCard
          title="Technical Maturity"
          value={data?.technology_maturity?.stage || "Growth"}
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
          badgeText="Phase"
        />
      </div>

      {/* Factors Breakdown */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Weighted Score Breakdown</h3>
          <span className="text-xs text-slate-400 font-mono">Formula: 30% + 20% + 15% + 20% + 15%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {factors.map((factor) => {
            const val = data?.factors?.[factor.key];
            const breakdown = data?.factor_breakdown?.[factor.key];
            const displayVal = val !== null && val !== undefined ? Number(val).toFixed(1) : null;

            return (
              <div key={factor.key} className="p-4 bg-navy-950/70 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-navy-800 border border-slate-700/60 rounded-md">
                    {factor.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{factor.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Weight {factor.weight}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-lg font-bold text-slate-100 font-mono tracking-tight">
                      {displayVal ? `${displayVal}` : "N/A"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, val || 0))}%` }}
                    />
                  </div>
                </div>

                {breakdown && (
                  <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                    Contribution: <span className="text-blue-300 font-semibold">{(breakdown.effective_weight * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Source Evidence */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">Multi-Source Evidence Audit</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3.5 bg-navy-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400 block mb-1">Patent Volume</span>
            <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">{data?.evidence?.patent_count || 0}</span>
          </div>
          <div className="p-3.5 bg-navy-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400 block mb-1">Organizations</span>
            <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">{data?.evidence?.organization_count || 0}</span>
          </div>
          <div className="p-3.5 bg-navy-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400 block mb-1">Inventors</span>
            <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">{data?.evidence?.inventor_count || 0}</span>
          </div>
          <div className="p-3.5 bg-navy-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400 block mb-1">Research Signal</span>
            <span className="text-sm font-semibold text-purple-300 font-mono">{data?.evidence?.research_signal ?? "Available"}</span>
          </div>
          <div className="p-3.5 bg-navy-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400 block mb-1">Funding Signal</span>
            <span className="text-sm font-semibold text-indigo-300 font-mono">{data?.evidence?.funding_signal ?? "Available"}</span>
          </div>
        </div>
      </div>

      {/* Methodology */}
      {data?.methodology && (
        <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Scoring Methodology & Transparency</h3>
          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            {data.methodology.formula && <p>• <strong>Formula:</strong> {data.methodology.formula}</p>}
            {data.methodology.missing_data && <p>• <strong>Data Strategy:</strong> {data.methodology.missing_data}</p>}
            {data.methodology.maturity_note && <p>• <strong>Maturity Modeling:</strong> {data.methodology.maturity_note}</p>}
            {data.methodology.market_potential_note && <p>• <strong>Market Proxy:</strong> {data.methodology.market_potential_note}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default InnovationDetails;