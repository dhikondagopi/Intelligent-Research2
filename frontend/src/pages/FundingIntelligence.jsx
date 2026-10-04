import React, { useEffect, useState } from "react";
import {
  searchFunding,
  getFundingStatistics,
  getTopOrganizations
} from "../services/fundingService";
import {
  DollarSign,
  Building2,
  Calendar,
  User,
  FileText,
  RefreshCw,
  AlertCircle,
  Database,
  Tag,
  Hash,
  Award,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Layers,
  Sparkles
} from "lucide-react";

import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

function FundingIntelligence() {
  const [query, setQuery] = useState("artificial intelligence");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  const [statistics, setStatistics] = useState({
    project_count: 0,
    total_funding: 0,
    average_funding: 0
  });

  const [organizations, setOrganizations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const formatMoney = (amount) => {
    const num = Number(amount);
    if (isNaN(num) || !num) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPIs = (pis) => {
    if (!pis) return "N/A";
    if (Array.isArray(pis)) return pis.length > 0 ? pis.join(", ") : "N/A";
    return String(pis);
  };

  const performSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setSearchError("");

    try {
      const data = await searchFunding(query.trim());
      const resArray = Array.isArray(data?.results) ? data.results : [];
      setResults(resArray);
      setTotalResults(Number(data?.total) || resArray.length);
    } catch (err) {
      console.error("Funding Search Error:", err);
      setSearchError(err.response?.data?.detail || "Failed to retrieve funding data from NIH RePORTER.");
      setResults([]);
      setTotalResults(0);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const [statsRes, orgsRes] = await Promise.all([
        getFundingStatistics(),
        getTopOrganizations()
      ]);

      if (statsRes) {
        setStatistics({
          project_count: Number(statsRes.project_count) || 0,
          total_funding: Number(statsRes.total_funding) || 0,
          average_funding: Number(statsRes.average_funding) || 0
        });
      }

      setOrganizations(Array.isArray(orgsRes?.results) ? orgsRes.results : []);
    } catch (err) {
      console.error("Failed to load funding dashboard data:", err);
      setDashboardError("Failed to load funding statistics and top organizations.");
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
    loadDashboardData();
  }, []);

  const toggleAbstract = (id) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const orgChartData = organizations.slice(0, 8).map((o) => ({
    name: o.organization || "Unknown",
    value: o.total_funding || o.award_amount || 0
  }));

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Funding Intelligence"
        subtitle="Discover research funding awards, opportunities, and top funding bodies via NIH RePORTER."
        icon={DollarSign}
        badge="NIH RePORTER Synced"
      >
        <button
          onClick={() => {
            performSearch();
            loadDashboardData();
          }}
          style={styles.refreshBtn}
        >
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </SectionHeader>

      {/* KPI Overview Grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Indexed Projects"
          value={statistics.project_count.toLocaleString()}
          icon={FileText}
          subtext="NIH RePORTER records"
          color="#3b82f6"
        />

        <StatCard
          title="Total Funding Volume"
          value={formatMoney(statistics.total_funding)}
          icon={DollarSign}
          subtext="Cumulative grant funding"
          color="#10b981"
        />

        <StatCard
          title="Average Project Award"
          value={formatMoney(statistics.average_funding)}
          icon={Award}
          subtext="Per project award mean"
          color="#c084fc"
        />
      </div>

      {dashboardError && <ErrorState message={dashboardError} onRetry={loadDashboardData} />}

      {/* Search Input Section */}
      <div style={styles.searchSection}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={performSearch}
          placeholder="Search funding topic, disease area, agency, or mechanism..."
          loading={searchLoading}
        />
      </div>

      {searchError && <ErrorState message={searchError} onRetry={performSearch} />}

      {/* Main Content Layout */}
      <div style={styles.layoutGrid}>
        {/* Left Column: Search Results */}
        <div style={styles.leftCol}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionTitle}>Grant Project Results</h3>
            <span style={styles.resultBadge}>{totalResults} Grants</span>
          </div>

          {searchLoading ? (
            <LoadingSkeleton type="card" count={4} height={160} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No Funding Projects Found"
              message={`No NIH RePORTER grant projects matched "${query}".`}
              actionLabel="Try 'Cancer Research'"
              onAction={() => {
                setQuery("cancer research");
                performSearch();
              }}
            />
          ) : (
            <div style={styles.cardsList}>
              {results.map((p, i) => {
                const pId = p.application_id || p.project_number || i;
                const isExpanded = !!expandedAbstracts[pId];

                return (
                  <div key={pId} style={styles.grantCard}>
                    <div style={styles.cardHeader}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.sourceTagRow}>
                          <span style={styles.sourceTag}>
                            <Database size={11} style={{ marginRight: 4 }} />
                            NIH RePORTER
                          </span>
                          {p.activity_code && <span style={styles.codeTag}>{p.activity_code}</span>}
                          {p.fiscal_year && <span style={styles.yearTag}>FY {p.fiscal_year}</span>}
                        </div>
                        <h4 style={styles.grantTitle}>{p.title || p.project_title || "Untitled Project"}</h4>
                      </div>

                      <div style={styles.amountBox}>
                        <span style={styles.amountLabel}>Award Amount</span>
                        <span style={styles.amountVal}>{formatMoney(p.award_amount)}</span>
                      </div>
                    </div>

                    <div style={styles.metaGrid}>
                      <div style={styles.metaItem}>
                        <Building2 size={13} color="#64748b" />
                        <span><strong>Organization:</strong> {p.organization || p.agency || "N/A"}</span>
                      </div>

                      <div style={styles.metaItem}>
                        <Layers size={13} color="#64748b" />
                        <span><strong>Mechanism:</strong> {p.funding_mechanism || p.agency || "N/A"}</span>
                      </div>

                      <div style={styles.metaItem}>
                        <User size={13} color="#64748b" />
                        <span><strong>Principal Investigator:</strong> {formatPIs(p.contact_pi_name || p.principal_investigators)}</span>
                      </div>

                      <div style={styles.metaItem}>
                        <Hash size={13} color="#64748b" />
                        <span><strong>Project #:</strong> {p.project_number || p.application_id || "N/A"}</span>
                      </div>
                    </div>

                    {/* Expandable Abstract */}
                    {p.abstract && (
                      <div style={styles.abstractSection}>
                        <button onClick={() => toggleAbstract(pId)} style={styles.toggleAbstractBtn}>
                          <span>{isExpanded ? "Hide Abstract" : "Show Abstract"}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isExpanded && (
                          <div style={styles.abstractContent}>
                            <p style={styles.abstractText}>{p.abstract}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Top Funding Organizations Chart */}
        <div style={styles.rightCol}>
          {orgChartData.length > 0 && (
            <ChartCard
              title="Top Funding Bodies"
              subtitle="Organizations with highest cumulative grant volume"
              type="bar"
              data={orgChartData}
              dataKey="value"
              nameKey="name"
              color="#10b981"
              height={260}
            />
          )}

          {/* Top Organizations Table Card */}
          <div style={styles.orgCard}>
            <div style={styles.orgHeader}>
              <Building2 size={16} color="#60a5fa" />
              <h4 style={styles.orgTitle}>Top Grant Awardees</h4>
            </div>

            <div style={styles.orgList}>
              {organizations.slice(0, 6).map((o, i) => (
                <div key={i} style={styles.orgItem}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.orgName}>{o.organization}</div>
                    <span style={styles.orgSub}>{o.project_count || 1} projects</span>
                  </div>
                  <span style={styles.orgAmount}>{formatMoney(o.total_funding || o.award_amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px 40px",
    maxWidth: "1400px",
    margin: "0 auto",
    color: "#f8fafc"
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "28px"
  },
  searchSection: {
    marginBottom: "24px"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "24px"
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0
  },
  resultBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#34d399",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  cardsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  grantCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px"
  },
  sourceTagRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px"
  },
  sourceTag: {
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 7px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  codeTag: {
    background: "#1e293b",
    color: "#cbd5e1",
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  yearTag: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  grantTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
    lineHeight: "1.4"
  },
  amountBox: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    borderRadius: "10px",
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0
  },
  amountLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "500"
  },
  amountVal: {
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "#34d399"
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "8px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "12px"
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#cbd5e1"
  },
  abstractSection: {
    borderTop: "1px solid #1e293b",
    paddingTop: "10px"
  },
  toggleAbstractBtn: {
    background: "transparent",
    border: "none",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: 0
  },
  abstractContent: {
    marginTop: "8px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "12px",
    color: "#cbd5e1",
    lineHeight: "1.5"
  },
  abstractText: {
    margin: 0
  },
  orgCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  orgHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px"
  },
  orgTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0
  },
  orgList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  orgItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "8px 10px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px"
  },
  orgName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  orgSub: {
    fontSize: "10px",
    color: "#64748b"
  },
  orgAmount: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#34d399",
    whiteSpace: "nowrap"
  }
};

export default FundingIntelligence;