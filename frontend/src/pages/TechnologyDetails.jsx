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
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "#4C8DFF", textDecoration: "none" }}
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
        badgeIcon={<TrendingUp className="w-3.5 h-3.5 text-blue-400" />}
        actionButton={
          <button
            onClick={loadData}
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
          icon={Database}
          color="#4C8DFF"
          badge="Patents"
        />
        <StatCard
          title="Active Inventors"
          value={(details?.inventor_count || 0).toLocaleString()}
          icon={Users}
          color="#4C8DFF"
          badge="Inventors"
        />
        <StatCard
          title="Assignee Organizations"
          value={(details?.organizations?.length || 0).toLocaleString()}
          icon={Building2}
          color="#4C8DFF"
          badge="Organizations"
        />
        <StatCard
          title="Maturity Phase"
          value={maturity?.maturity_stage || "Early Stage"}
          trend="Calculated"
          icon={TrendingUp}
          color="#4C8DFF"
          badge="Status"
        />
      </div>

      {/* Maturity Analysis */}
      <div style={{ background: "#101620", border: "1px solid #202A38", borderRadius: "14px", padding: "24px" }} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div style={{ padding: "8px", background: "rgba(76, 141, 255, 0.12)", border: "1px solid rgba(76, 141, 255, 0.3)", borderRadius: "8px", color: "#4C8DFF" }}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", margin: 0 }}>Technology Maturity Analysis</h3>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", background: "rgba(76, 141, 255, 0.12)", border: "1px solid rgba(76, 141, 255, 0.3)", color: "#4C8DFF" }}>
            Phase: {maturity?.maturity_stage || "N/A"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div style={{ background: "#0B0F17", border: "1px solid #202A38", padding: "16px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#98A4B5" }}>Patent Activity</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#F2F5F8", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {(maturity?.patent_activity || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ background: "#0B0F17", border: "1px solid #202A38", padding: "16px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#98A4B5" }}>Organization Count</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#F2F5F8", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {(maturity?.organization_activity || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ background: "#0B0F17", border: "1px solid #202A38", padding: "16px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#98A4B5" }}>Inventor Base</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#F2F5F8", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {(maturity?.inventor_activity || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ background: "#0B0F17", border: "1px solid #202A38", padding: "16px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#98A4B5" }}>Maturity Score</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#35C98A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {maturity?.maturity_stage || "Growth"}
            </div>
          </div>
        </div>

        {maturity?.methodology && (
          <p style={{ fontSize: "12px", color: "#98A4B5", lineHeight: "1.6", borderTop: "1px solid #202A38", paddingTop: "12px", margin: 0 }}>
            {maturity.methodology}
          </p>
        )}
      </div>

      {/* Adoption Signals */}
      <div style={{ background: "#101620", border: "1px solid #202A38", borderRadius: "14px", padding: "24px" }} className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div style={{ padding: "8px", background: "rgba(76, 141, 255, 0.12)", border: "1px solid rgba(76, 141, 255, 0.3)", borderRadius: "8px", color: "#4C8DFF" }}>
            <Target className="w-5 h-5" />
          </div>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", margin: 0 }}>Technology Adoption Tracking</h3>
        </div>

        <p style={{ fontSize: "12px", color: "#98A4B5", margin: 0 }}>
          Patent and organization activity serves as an evidence-based proxy for technical adoption and market engagement.
        </p>

        {adoption?.adoption_proxy?.length > 0 ? (
          <div style={{ overflowX: "auto", border: "1px solid #202A38", borderRadius: "10px" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "#0B0F17", borderBottom: "1px solid #202A38", fontSize: "12px", fontWeight: "600", color: "#98A4B5" }}>
                  <th className="py-3 px-4">Filing Year</th>
                  <th className="py-3 px-4">Patent Publications</th>
                  <th className="py-3 px-4">Active Organizations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {adoption.adoption_proxy.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #202A38" }}>
                    <td className="py-3 px-4 font-semibold" style={{ color: "#F2F5F8" }}>{item.year}</td>
                    <td className="py-3 px-4" style={{ color: "#4C8DFF" }}>{(item.patent_count || 0).toLocaleString()}</td>
                    <td className="py-3 px-4" style={{ color: "#35C98A" }}>{(item.organization_count || 0).toLocaleString()}</td>
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
        <div style={{ background: "#101620", border: "1px solid #202A38", borderRadius: "14px", padding: "24px" }} className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div style={{ padding: "8px", background: "rgba(53, 201, 138, 0.12)", border: "1px solid rgba(53, 201, 138, 0.3)", borderRadius: "8px", color: "#35C98A" }}>
              <Building2 className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", margin: 0 }}>Leading Organizations</h3>
          </div>

          {details?.organizations?.length > 0 ? (
            <div className="space-y-2.5">
              {details.organizations.map((org, idx) => (
                <div key={idx} style={{ background: "#0B0F17", border: "1px solid #202A38", borderRadius: "10px", padding: "12px" }} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#F2F5F8" }}>{org.name}</div>
                    <div style={{ fontSize: "11px", color: "#98A4B5" }}>Assignee Organization</div>
                  </div>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "#35C98A", background: "rgba(53, 201, 138, 0.12)", border: "1px solid rgba(53, 201, 138, 0.3)", padding: "4px 10px", borderRadius: "6px" }}>
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
        <div style={{ background: "#101620", border: "1px solid #202A38", borderRadius: "14px", padding: "24px" }} className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div style={{ padding: "8px", background: "rgba(76, 141, 255, 0.12)", border: "1px solid rgba(76, 141, 255, 0.3)", borderRadius: "8px", color: "#4C8DFF" }}>
              <Database className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", margin: 0 }}>CPC Classification Breakdown</h3>
          </div>

          {details?.cpc_areas?.length > 0 ? (
            <div className="space-y-2.5">
              {details.cpc_areas.map((area, idx) => (
                <div key={idx} style={{ background: "#0B0F17", border: "1px solid #202A38", borderRadius: "10px", padding: "12px" }} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#F2F5F8" }}>CPC Section {area.section}</div>
                    <div style={{ fontSize: "11px", color: "#98A4B5" }}>Cooperative Patent Code</div>
                  </div>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "#4C8DFF", background: "rgba(76, 141, 255, 0.12)", border: "1px solid rgba(76, 141, 255, 0.3)", padding: "4px 10px", borderRadius: "6px" }}>
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
      <div style={{ background: "#101620", border: "1px solid #202A38", borderRadius: "14px", padding: "24px" }} className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div style={{ padding: "8px", background: "rgba(217, 164, 65, 0.12)", border: "1px solid rgba(217, 164, 65, 0.3)", borderRadius: "8px", color: "#D9A441" }}>
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", margin: 0 }}>Innovation Opportunities</h3>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp, idx) => (
              <div key={idx} style={{ background: "#0B0F17", border: "1px solid #202A38", borderRadius: "10px", padding: "16px" }} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#F2F5F8", margin: 0 }}>{opp.title}</h4>
                  <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", background: "rgba(217, 164, 65, 0.12)", border: "1px solid rgba(217, 164, 65, 0.3)", color: "#D9A441" }}>
                    Confidence: {opp.confidence}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#98A4B5", lineHeight: "1.5", margin: 0 }}>{opp.description}</p>
                {opp.signals?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {opp.signals.map((sig, sIdx) => (
                      <span key={sIdx} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "12px", background: "#101620", color: "#98A4B5", border: "1px solid #202A38" }}>
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
      <div style={{ background: "#101620", border: "1px solid #202A38", borderRadius: "14px", padding: "24px" }} className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div style={{ padding: "8px", background: "rgba(76, 141, 255, 0.12)", border: "1px solid rgba(76, 141, 255, 0.3)", borderRadius: "8px", color: "#4C8DFF" }}>
            <Users className="w-5 h-5" />
          </div>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#F2F5F8", margin: 0 }}>Competitive Landscape Monitoring</h3>
        </div>

        {competitors.length > 0 ? (
          <div style={{ overflowX: "auto", border: "1px solid #202A38", borderRadius: "10px" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "#0B0F17", borderBottom: "1px solid #202A38", fontSize: "12px", fontWeight: "600", color: "#98A4B5" }}>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Patent Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {competitors.map((comp, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #202A38" }}>
                    <td className="py-3 px-4 font-bold" style={{ color: "#98A4B5" }}>#{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold font-sans" style={{ color: "#F2F5F8" }}>{comp.organization}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: "#4C8DFF" }}>{(comp.patent_count || 0).toLocaleString()}</td>
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