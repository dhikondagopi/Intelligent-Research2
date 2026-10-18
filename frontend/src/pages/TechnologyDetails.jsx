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
  SearchX,
  Cpu,
  Layers
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
import EmptyState from "../components/EmptyState";

function TechnologyDetails() {
  const { technology } = useParams();
  const rawTechnology = technology || "";
  const technologyName = decodeURIComponent(rawTechnology).trim();

  const [details, setDetails] = useState(null);
  const [maturity, setMaturity] = useState(null);
  const [adoption, setAdoption] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [competitors, setCompetitors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    if (!technologyName) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotFound(false);

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
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(
          err?.response?.data?.detail ||
          "Unable to load technology intelligence."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [technologyName]);

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSkeleton type="kpi" count={4} />
        <div style={{ marginTop: "24px" }}>
          <LoadingSkeleton type="card" count={2} height={260} />
        </div>
      </div>
    );
  }

  // Not Found State (Section 1 priority requirement)
  if (notFound) {
    return (
      <div style={styles.notFoundContainer}>
        <div style={styles.notFoundCard}>
          <div style={styles.notFoundIcon}>
            <SearchX size={32} />
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text)", margin: "0 0 10px 0" }}>
            Technology Domain Not Found
          </h2>

          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: "1.6", maxWidth: "480px", margin: "0 auto 28px" }}>
            The requested technical domain <strong>"{technologyName}"</strong> does not have classified patent records in the repository. Please verify the domain spelling or explore indexed emerging domains.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/technology/emerging" style={styles.primaryBtn}>
              <ArrowLeft size={15} />
              <span>Explore Emerging Technologies</span>
            </Link>

            <Link to="/technology" style={styles.secondaryBtn}>
              <span>Back to Technology Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.notFoundContainer}>
        <div style={styles.notFoundCard}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-danger)", marginBottom: "8px" }}>
            Failed to Load Technology Intelligence
          </h3>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>{error}</p>
          <button onClick={loadData} style={styles.primaryBtn}>
            <span>Retry Analysis</span>
          </button>
        </div>
      </div>
    );
  }

  const domainDisplayName = details?.canonical_name || details?.technology || technologyName;

  return (
    <div style={styles.container}>
      {/* Navigation link */}
      <div>
        <Link to="/technology/emerging" style={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Back to Emerging Technologies</span>
        </Link>
      </div>

      {/* Header */}
      <SectionHeader
        title={domainDisplayName}
        subtitle="Comprehensive patent portfolio analysis, maturity indicators, and market activity signals."
        badge={details?.source_provenance || "PatentsView Cached Dataset"}
        icon={Cpu}
      >
        <button onClick={loadData} style={styles.refreshBtn}>
          <RefreshCw size={15} />
          <span>Refresh Analysis</span>
        </button>
      </SectionHeader>

      {/* Metric Cards */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Patent Volume"
          value={(details?.patent_count || 0).toLocaleString()}
          icon={Database}
          color="#4C8DFF"
          badge="Patents"
          subtext="Total classified filings"
        />
        <StatCard
          title="Active Inventors"
          value={(details?.inventor_count || 0).toLocaleString()}
          icon={Users}
          color="#4C8DFF"
          badge="Inventors"
          subtext="Contributing inventors"
        />
        <StatCard
          title="Assignee Organizations"
          value={(details?.unique_organizations_count || details?.organizations?.length || 0).toLocaleString()}
          icon={Building2}
          color="#4C8DFF"
          badge="Organizations"
          subtext="Unique patent holders"
        />
        <StatCard
          title="Maturity Phase"
          value={maturity?.maturity_stage || "Established"}
          trend="Calculated"
          icon={TrendingUp}
          color="#4C8DFF"
          badge="Stage"
          subtext="IP filing velocity"
        />
      </div>

      {/* Maturity Analysis */}
      <div style={styles.sectionCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.iconBox}>
              <TrendingUp size={18} color="var(--color-primary)" />
            </div>
            <h3 style={styles.sectionTitle}>
              Technology Maturity Analysis
            </h3>
          </div>
          <span style={styles.phasePill}>
            Phase: {maturity?.maturity_stage || "N/A"}
          </span>
        </div>

        <div style={styles.maturityGrid}>
          <div style={styles.metricBlock}>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Patent Activity</div>
            <div style={styles.monoValue}>
              {(maturity?.patent_activity || 0).toLocaleString()}
            </div>
          </div>
          <div style={styles.metricBlock}>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Active Assignees</div>
            <div style={styles.monoValue}>
              {(maturity?.organization_activity || 0).toLocaleString()}
            </div>
          </div>
          <div style={styles.metricBlock}>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Inventor Base</div>
            <div style={styles.monoValue}>
              {(maturity?.inventor_activity || 0).toLocaleString()}
            </div>
          </div>
          <div style={styles.metricBlock}>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Maturity Indicator</div>
            <div style={{ ...styles.monoValue, color: "var(--color-success)" }}>
              {maturity?.maturity_stage || "Growth"}
            </div>
          </div>
        </div>

        {maturity?.methodology && (
          <p style={styles.methodologyText}>
            {maturity.methodology}
          </p>
        )}
      </div>

      {/* Adoption Signals */}
      <div style={styles.sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.iconBox}>
            <Target size={18} color="var(--color-primary)" />
          </div>
          <h3 style={styles.sectionTitle}>
            Technology Activity Tracking (Annual Distribution)
          </h3>
        </div>

        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
          Annual publication and assignee counts serve as an evidence-based proxy for R&D momentum and organizational engagement.
        </p>

        {adoption?.adoption_proxy?.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Filing / Grant Year</th>
                  <th style={styles.th}>Patent Publications</th>
                  <th style={styles.th}>Active Organizations</th>
                </tr>
              </thead>
              <tbody>
                {adoption.adoption_proxy.map((item, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.tdBold}>{item.year}</td>
                    <td style={{ ...styles.td, color: "var(--color-primary)", fontWeight: "700" }}>
                      {(item.patent_count || 0).toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, color: "var(--color-success)", fontWeight: "700" }}>
                      {(item.organization_count || 0).toLocaleString()}
                    </td>
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
      <div style={styles.twoColGrid}>
        {/* Leading Orgs */}
        <div style={styles.sectionCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ ...styles.iconBox, color: "var(--color-success)" }}>
              <Building2 size={18} />
            </div>
            <h3 style={styles.sectionTitle}>
              Leading Assignee Organizations
            </h3>
          </div>

          {details?.organizations?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {details.organizations.map((org, idx) => (
                <div key={idx} style={styles.orgRow}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text)" }}>{org.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Patent Assignee</div>
                  </div>
                  <span style={styles.patentBadge}>
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
        <div style={styles.sectionCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.iconBox}>
              <Layers size={18} color="var(--color-primary)" />
            </div>
            <h3 style={styles.sectionTitle}>
              CPC Classification Breakdown
            </h3>
          </div>

          {details?.cpc_areas?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {details.cpc_areas.map((area, idx) => (
                <div key={idx} style={styles.orgRow}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text)" }}>CPC Section {area.section}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Cooperative Patent Code</div>
                  </div>
                  <span style={{ ...styles.patentBadge, color: "var(--color-primary)", borderColor: "var(--color-border)" }}>
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
      <div style={styles.sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ ...styles.iconBox, color: "var(--color-warning)" }}>
            <Lightbulb size={18} />
          </div>
          <h3 style={styles.sectionTitle}>
            Innovation Opportunities
          </h3>
        </div>

        {opportunities.length > 0 ? (
          <div style={styles.twoColGrid}>
            {opportunities.map((opp, idx) => (
              <div key={idx} style={styles.opportunityCard}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)", margin: 0 }}>{opp.title}</h4>
                  <span style={styles.confidencePill}>
                    Confidence: {opp.confidence}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: "1.5", margin: 0 }}>{opp.description}</p>
                {opp.signals?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "4px" }}>
                    {opp.signals.map((sig, sIdx) => (
                      <span key={sIdx} style={styles.signalPill}>
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
      <div style={styles.sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.iconBox}>
            <Users size={18} color="var(--color-primary)" />
          </div>
          <h3 style={styles.sectionTitle}>
            Competitive Landscape Monitoring
          </h3>
        </div>

        {competitors.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Organization Name</th>
                  <th style={styles.th}>Patent Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={{ ...styles.td, fontWeight: "700", color: "var(--color-text-dim)" }}>#{idx + 1}</td>
                    <td style={styles.tdBold}>{comp.organization}</td>
                    <td style={{ ...styles.td, color: "var(--color-primary)", fontWeight: "700" }}>
                      {(comp.patent_count || 0).toLocaleString()}
                    </td>
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
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--color-primary)",
    textDecoration: "none"
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
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  sectionCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  iconBox: {
    padding: "8px",
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--color-text)",
    margin: 0
  },
  phasePill: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "20px",
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    color: "var(--color-primary)"
  },
  maturityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    paddingTop: "6px"
  },
  metricBlock: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    padding: "16px",
    borderRadius: "10px"
  },
  monoValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--color-text)",
    fontFamily: "var(--font-mono)",
    marginTop: "4px"
  },
  methodologyText: {
    fontSize: "12px",
    color: "var(--color-text-muted)",
    lineHeight: "1.6",
    borderTop: "1px solid var(--color-border)",
    paddingTop: "12px",
    margin: 0
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px"
  },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid var(--color-border)",
    borderRadius: "10px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    textAlign: "left"
  },
  th: {
    background: "var(--color-bg-secondary)",
    color: "var(--color-text-muted)",
    fontWeight: "600",
    padding: "10px 14px",
    borderBottom: "1px solid var(--color-border)"
  },
  td: {
    padding: "10px 14px",
    color: "var(--color-text-muted)",
    borderBottom: "1px solid var(--color-border)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px"
  },
  tdBold: {
    padding: "10px 14px",
    color: "var(--color-text)",
    fontWeight: "600",
    borderBottom: "1px solid var(--color-border)"
  },
  trEven: {
    background: "transparent"
  },
  trOdd: {
    background: "rgba(0, 0, 0, 0.02)"
  },
  orgRow: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  patentBadge: {
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    color: "var(--color-success)",
    background: "rgba(53, 201, 138, 0.1)",
    border: "1px solid rgba(53, 201, 138, 0.25)",
    padding: "4px 10px",
    borderRadius: "6px"
  },
  opportunityCard: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  confidencePill: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "rgba(217, 164, 65, 0.12)",
    border: "1px solid rgba(217, 164, 65, 0.3)",
    color: "var(--color-warning)"
  },
  signalPill: {
    fontSize: "10px",
    padding: "2px 8px",
    borderRadius: "12px",
    background: "var(--color-surface)",
    color: "var(--color-text-muted)",
    border: "1px solid var(--color-border)"
  },
  notFoundContainer: {
    padding: "40px 24px",
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center"
  },
  notFoundCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "16px",
    padding: "48px 32px",
    boxShadow: "var(--shadow-card)"
  },
  notFoundIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 20px",
    borderRadius: "14px",
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-primary)"
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--color-primary)",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    border: "none",
    cursor: "pointer"
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none"
  }
};

export default TechnologyDetails;