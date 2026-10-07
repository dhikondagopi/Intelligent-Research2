import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  Award,
  Users,
  Building,
  Tag,
  TrendingUp,
  Sparkles,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";

import { searchResearch, getTrendingResearch } from "../services/researchService";
import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

function ResearchIntelligence() {
  const [query, setQuery] = useState("artificial intelligence");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const performSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const data = await searchResearch(query);
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to retrieve research data.");
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const data = await getTrendingResearch();
      setTrending(data.results || []);
    } catch (err) {
      console.error("Failed to load trending research", err);
    }
  };

  useEffect(() => {
    performSearch();
    loadTrending();
  }, []);

  const toggleAbstract = (id) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Compute analytics from results
  const totalCitations = results.reduce((acc, r) => acc + (r.cited_by_count || 0), 0);
  const avgCitations = results.length ? Math.round(totalCitations / results.length) : 0;

  const yearChartData = results.slice(0, 8).map((r) => ({
    name: (r.title || "").substring(0, 14) + "...",
    citations: r.cited_by_count || 0
  }));

  // Aggregate top concepts across results
  const conceptMap = {};
  results.forEach((r) => {
    if (r.concepts && Array.isArray(r.concepts)) {
      r.concepts.forEach((c) => {
        conceptMap[c] = (conceptMap[c] || 0) + 1;
      });
    }
  });

  const topConcepts = Object.entries(conceptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <SectionHeader
        title="Research Intelligence"
        subtitle="Explore global OpenAlex research literature, bibliometric citation graphs, and emerging concepts."
        icon={BookOpen}
        badge="OpenAlex Synced"
      >
        <button onClick={performSearch} style={styles.refreshBtn} title="Refresh Search Results">
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </SectionHeader>

      {/* KPI Overview Row */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Publications Found"
          value={results.length.toString()}
          icon={BookOpen}
          subtext="Matching search query"
          color="#4C8DFF"
        />
        <StatCard
          title="Cumulative Citations"
          value={totalCitations.toLocaleString()}
          icon={Award}
          subtext="Indexed citation count"
          color="#4C8DFF"
        />
        <StatCard
          title="Avg Citation Impact"
          value={avgCitations.toString()}
          icon={TrendingUp}
          subtext="Mean citations per paper"
          color="#4C8DFF"
        />
      </div>

      {/* Search Bar */}
      <div style={styles.searchSection}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={performSearch}
          placeholder="Search research topics, keywords, authors, or institutional concepts..."
          loading={loading}
        />
      </div>

      {error && <ErrorState message={error} onRetry={performSearch} />}

      {/* Main Analytical 70/30 Grid */}
      <div style={styles.layoutGrid}>
        {/* LEFT COLUMN (70%): Search Results */}
        <div style={styles.leftCol}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>Publication Search Results</h3>
              <p style={styles.sectionSub}>Indexed scientific literature matching query</p>
            </div>
            <span style={styles.resultBadge}>{results.length} Publications</span>
          </div>

          {loading ? (
            <LoadingSkeleton type="card" count={4} height={140} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Research Results Found"
              message={`No publications matched "${query}". Try searching another research topic.`}
              actionLabel="Try 'Quantum Computing'"
              onAction={() => {
                setQuery("quantum computing");
                performSearch();
              }}
            />
          ) : (
            <div style={styles.cardsList}>
              {results.map((r, i) => {
                const itemKey = r.id || i;
                const isExpanded = !!expandedAbstracts[itemKey];

                return (
                  <div key={itemKey} style={styles.paperCard}>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.paperTitle}>{r.title}</h4>
                      {r.cited_by_count !== undefined && (
                        <span style={styles.citationBadge}>
                          <Award size={12} style={{ marginRight: 4 }} />
                          {r.cited_by_count} Citations
                        </span>
                      )}
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaItem}>
                        <Calendar size={13} /> {r.publication_year || "N/A"}
                      </span>
                      {r.authors && r.authors.length > 0 && (
                        <span style={styles.metaItem}>
                          <Users size={13} /> {r.authors.slice(0, 3).join(", ")}
                          {r.authors.length > 3 && ` +${r.authors.length - 3}`}
                        </span>
                      )}
                    </div>

                    {r.institutions && r.institutions.length > 0 && (
                      <div style={styles.instRow}>
                        <Building size={13} color="#64748b" />
                        <span style={styles.instText}>{r.institutions.slice(0, 2).join(", ")}</span>
                      </div>
                    )}

                    {r.concepts && r.concepts.length > 0 && (
                      <div style={styles.tagsRow}>
                        {r.concepts.slice(0, 5).map((c, ci) => (
                          <span key={ci} style={styles.conceptTag}>
                            <Tag size={10} style={{ marginRight: 3 }} /> {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Abstract Expander */}
                    {r.abstract && (
                      <div style={styles.abstractSection}>
                        <button
                          onClick={() => toggleAbstract(itemKey)}
                          style={styles.toggleBtn}
                        >
                          <span>{isExpanded ? "Hide Abstract" : "View Abstract"}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                        {isExpanded && (
                          <div style={styles.abstractBox}>
                            <p style={styles.abstractText}>{r.abstract}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {r.doi && (
                      <div style={styles.cardFooter}>
                        <a href={r.doi} target="_blank" rel="noreferrer" style={styles.doiLink}>
                          <span>View Publication (DOI)</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (30%): Citation Analytics, Trending, Top Concepts */}
        <div style={styles.rightCol}>
          {/* Citation Distribution Chart */}
          {yearChartData.length > 0 && (
            <ChartCard
              title="Citation Distribution"
              subtitle="Citations across top retrieved publications"
              type="bar"
              data={yearChartData}
              dataKey="citations"
              nameKey="name"
              color="#2563eb"
              height={220}
            />
          )}

          {/* Trending Research Sidebar Card */}
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarHeader}>
              <TrendingUp size={16} color="#34d399" />
              <h4 style={styles.sidebarTitle}>Trending Publications</h4>
            </div>

            <div style={styles.trendingList}>
              {trending.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                  Search for topics to populate trending publications.
                </p>
              ) : (
                trending.slice(0, 5).map((t, ti) => (
                  <div key={t._id || ti} style={styles.trendingItem}>
                    <span style={styles.trendingTitle}>{t.title}</span>
                    <span style={styles.trendingBadge}>
                      <Award size={10} style={{ marginRight: 3 }} />
                      {t.cited_by_count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Research Concepts Sidebar Card */}
          {topConcepts.length > 0 && (
            <div style={styles.sidebarCard}>
              <div style={styles.sidebarHeader}>
                <Sparkles size={16} color="#c084fc" />
                <h4 style={styles.sidebarTitle}>Top Domain Concepts</h4>
              </div>

              <div style={styles.conceptsList}>
                {topConcepts.map((cp, ci) => (
                  <div key={ci} style={styles.conceptRow}>
                    <span style={styles.conceptName}>{cp.name}</span>
                    <span style={styles.conceptCountBadge}>{cp.count} papers</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
  refreshBtn: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "500",
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
    marginBottom: "24px"
  },
  searchSection: {
    marginBottom: "24px"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
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
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  sectionSub: {
    fontSize: "12px",
    color: "#64748b",
    margin: "2px 0 0 0"
  },
  resultBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#60a5fa",
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  cardsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  paperCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px"
  },
  paperTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0,
    lineHeight: "1.4"
  },
  citationBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#34d399",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "3px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center"
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "12px",
    color: "#94a3b8"
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  instRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px"
  },
  instText: {
    color: "#64748b"
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "2px"
  },
  conceptTag: {
    background: "rgba(37, 99, 235, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 7px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  abstractSection: {
    borderTop: "1px solid #1e293b",
    paddingTop: "8px"
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: 0
  },
  abstractBox: {
    marginTop: "6px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.5"
  },
  abstractText: {
    margin: 0
  },
  cardFooter: {
    borderTop: "1px solid #1e293b",
    paddingTop: "10px",
    marginTop: "2px",
    display: "flex",
    justifyContent: "flex-end"
  },
  doiLink: {
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  sidebarCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px"
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  trendingList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  trendingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "8px 10px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px"
  },
  trendingTitle: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#cbd5e1",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  trendingBadge: {
    fontSize: "10px",
    color: "#34d399",
    fontWeight: "500",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center"
  },
  conceptsList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  conceptRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 8px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "6px"
  },
  conceptName: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: "500"
  },
  conceptCountBadge: {
    fontSize: "10px",
    color: "#c084fc",
    background: "rgba(192, 132, 252, 0.15)",
    border: "1px solid rgba(192, 132, 252, 0.3)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "500"
  }
};

export default ResearchIntelligence;