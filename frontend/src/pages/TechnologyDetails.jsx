import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Database,
  Users,
  TrendingUp,
  Target,
  Building2,
  Lightbulb,
  RefreshCw,
  Award,
  BookOpen,
  ChevronRight
} from "lucide-react";

import {
  getTechnologyDetails,
  getTechnologyMaturity,
  getTechnologyAdoption,
  getTechnologyOpportunities,
  getTechnologyCompetitors
} from "../services/technologyService";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

function TechnologyDetails() {
  const { technology } = useParams();
  const technologyName = decodeURIComponent(technology || "");

  const [details, setDetails] = useState(null);
  const [maturity, setMaturity] = useState(null);
  const [adoption, setAdoption] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [competitors, setCompetitors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        detailsData,
        maturityData,
        adoptionData,
        opportunitiesData,
        competitorsData
      ] = await Promise.all([
        getTechnologyDetails(technologyName),
        getTechnologyMaturity(technologyName),
        getTechnologyAdoption(technologyName),
        getTechnologyOpportunities(technologyName),
        getTechnologyCompetitors(technologyName)
      ]);

      setDetails(detailsData);
      setMaturity(maturityData);
      setAdoption(adoptionData);
      setOpportunities(opportunitiesData?.opportunities || []);
      setCompetitors(competitorsData?.competitors || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Unable to load technology intelligence."
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

  return (
    <div className="space-y-6">
      {/* Navigation link */}
      <div>
        <Link
          to="/technology/emerging"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Emerging Technologies
        </Link>
      </div>

      {/* Header */}
      <SectionHeader
        title={technologyName}
        description="Comprehensive patent portfolio analysis, maturity indicators, and market adoption signals."
        badgeText="Technology Analysis"
        badgeIcon={<TrendingUp className="w-3.5 h-3.5 text-indigo-400" />}
        actionButton={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-navy-800 border border-slate-700 hover:bg-navy-700 text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Analysis
          </button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patent Volume"
          value={(details?.patent_count || 0).toLocaleString()}
          icon={<Database className="w-5 h-5 text-indigo-400" />}
          badgeText="Patents"
        />
        <StatCard
          title="Active Inventors"
          value={(details?.inventor_count || 0).toLocaleString()}
          icon={<Users className="w-5 h-5 text-cyan-400" />}
          badgeText="Inventors"
        />
        <StatCard
          title="Assignee Organizations"
          value={(details?.organizations?.length || 0).toLocaleString()}
          icon={<Building2 className="w-5 h-5 text-emerald-400" />}
          badgeText="Organizations"
        />
        <StatCard
          title="Maturity Phase"
          value={maturity?.maturity_stage || "Early Stage"}
          trend="Calculated"
          trendDirection="up"
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
          badgeText="Status"
        />
      </div>

      {/* Maturity Analysis */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Technology Maturity Analysis</h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            Phase: {maturity?.maturity_stage || "N/A"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-navy-950/70 border border-slate-800 p-4 rounded-lg">
            <div className="text-xs text-slate-400">Patent Activity</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-1">
              {(maturity?.patent_activity || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-navy-950/70 border border-slate-800 p-4 rounded-lg">
            <div className="text-xs text-slate-400">Organization Count</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-1">
              {(maturity?.organization_activity || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-navy-950/70 border border-slate-800 p-4 rounded-lg">
            <div className="text-xs text-slate-400">Inventor Base</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-1">
              {(maturity?.inventor_activity || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-navy-950/70 border border-slate-800 p-4 rounded-lg">
            <div className="text-xs text-slate-400">Maturity Score</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {maturity?.maturity_stage || "Growth"}
            </div>
          </div>
        </div>

        {maturity?.methodology && (
          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
            {maturity.methodology}
          </p>
        )}
      </div>

      {/* Adoption Signals */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Technology Adoption Tracking</h3>
        </div>

        <p className="text-xs text-slate-400">
          Patent and organization activity serves as an evidence-based proxy for technical adoption and market engagement.
        </p>

        {adoption?.adoption_proxy?.length > 0 ? (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  <th className="py-3 px-4">Filing Year</th>
                  <th className="py-3 px-4">Patent Publications</th>
                  <th className="py-3 px-4">Active Organizations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {adoption.adoption_proxy.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-semibold">{item.year}</td>
                    <td className="py-3 px-4 text-blue-400">{(item.patent_count || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400">{(item.organization_count || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Adoption Proxy Data" description="Yearly patent activity signals are currently unmapped for this domain." />
        )}
      </div>

      {/* Leading Organizations & CPC Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leading Orgs */}
        <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Leading Organizations</h3>
          </div>

          {details?.organizations?.length > 0 ? (
            <div className="space-y-2.5">
              {details.organizations.map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-navy-950/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-200">{org.name}</div>
                    <div className="text-[11px] text-slate-500">Assignee Organization</div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                    {(org.patent_count || 0).toLocaleString()} Patents
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Organizations Found" description="Organization assignees are currently unavailable." />
          )}
        </div>

        {/* CPC Sections */}
        <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">CPC Classification Breakdown</h3>
          </div>

          {details?.cpc_areas?.length > 0 ? (
            <div className="space-y-2.5">
              {details.cpc_areas.map((area, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-navy-950/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-200">CPC Section {area.section}</div>
                    <div className="text-[11px] text-slate-500">Cooperative Patent Code</div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded">
                    {(area.patent_count || 0).toLocaleString()} Patents
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No CPC Data" description="Cooperative Patent Classification data is unavailable." />
          )}
        </div>
      </div>

      {/* Innovation Opportunities */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Innovation Opportunities</h3>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-4 bg-navy-950/70 border border-slate-800 rounded-lg space-y-2 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">{opp.title}</h4>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Confidence: {opp.confidence}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>
                {opp.signals?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {opp.signals.map((sig, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {sig}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No Opportunities Detected" description="No actionable technical white spaces detected." />
        )}
      </div>

      {/* Competitors */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Competitive Landscape Monitoring</h3>
        </div>

        {competitors.length > 0 ? (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Patent Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {competitors.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-4 text-slate-200 font-semibold font-sans">{comp.organization}</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">{(comp.patent_count || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Competitors Found" description="Organization rank records are unavailable." />
        )}
      </div>
    </div>
  );
}

export default TechnologyDetails;