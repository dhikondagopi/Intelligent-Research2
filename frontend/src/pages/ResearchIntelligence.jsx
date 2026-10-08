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
  FileText,
  CheckCircle2,
  AlertTriangle
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
  const [meta, setMeta] = useState(null);
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
      setMeta(data.meta || null);
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

          {/* Provider Health Bar */}
          {meta && meta.source_status && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                padding: "10px 14px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
                marginBottom: "14px"
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                Sources:
              </span>
              {Object.entries(meta.source_status).map(([srcName, status]) => (
                <span
                  key={srcName}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    fontSize: "11px",
                    color: "var(--color-text)"
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor:
                        status === "LIVE"
                          ? "var(--color-success)"
                          : status === "CACHED"
                          ? "var(--color-warning)"
                          : "var(--color-danger)"
                    }}
                  />
                  {srcName} ({status})
                </span>
              ))}
            </div>
          )}

          {/* Partial provider warning */}
          {meta && meta.errors && Object.keys(meta.errors).length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "var(--color-warning)",
                fontSize: "12px",
                marginBottom: "14px"
              }}
            >
              <AlertTriangle size={14} />
              <span>
                {Object.keys(meta.errors).join(", ")} temporarily unavailable. Showing available literature.
              </span>
            </div>
          )}

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
                const itemKey = r.id || r.doi || i;
                const isExpanded = !!expandedAbstracts[itemKey];

                return (
                  <div key={itemKey} style={styles.paperCard}>
                    {/* Provenance Badges & Citations Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {(r.sources && r.sources.length > 0 ? r.sources : ["OpenAlex"]).map((src) => (
                          <span
                            key={src}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "10.5px",
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: 4,
                              backgroundColor: "rgba(76, 141, 255, 0.12)",
                              color: "var(--color-primary)"
                            }}
                          >
                            <CheckCircle2 size={11} /> {src}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={styles.citationBadge}>
                          <Award size={12} style={{ marginRight: 4 }} />
                          {r.citation_count !== undefined ? r.citation_count : r.cited_by_count || 0} Citations
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardHeader}>
                      <h4 style={styles.paperTitle}>{r.title}</h4>
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaItem}>
                        <Calendar size={13} /> {r.year || r.publication_year || "N/A"}
                      </span>
                      {r.authors && r.authors.length > 0 && (
                        <span style={styles.metaItem}>
                          <Users size={13} /> {r.authors.slice(0, 3).join(", ")}
                          {r.authors.length > 3 && ` +${r.authors.length - 3}`}
                        </span>
                      )}
                      {r.venue && (
                        <span style={styles.metaItem}>
                          · Published in {r.venue}
                        </span>
                      )}
                    </div>

                    {r.institutions && r.institutions.length > 0 && (
                      <div style={styles.instRow}>
                        <Building size={13} color="var(--color-text-muted)" />
                        <span style={styles.instText}>{r.institutions.slice(0, 2).join(", ")}</span>
                      </div>
                    )}

                    {(r.topics || r.concepts) && (
                      <div style={styles.tagsRow}>
                        {(r.topics || r.concepts).slice(0, 5).map((c, ci) => (
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

                    {/* Direct External Provider Links & DOI */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--color-border)" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Direct Links:
                      </span>

                      {r.source_urls && Object.entries(r.source_urls).map(([src, link]) => (
                        <a
                          key={src}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "11.5px",
                            fontWeight: 500,
                            padding: "3px 8px",
                            borderRadius: 5,
                            background: "var(--color-surface-elevated)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-primary)",
                            textDecoration: "none"
                          }}
                        >
                          <span>View on {src}</span>
                          <ExternalLink size={11} />
                        </a>
                      ))}

                      {r.doi && !r.source_urls?.["Crossref"] && (
                        <a
                          href={r.doi.startsWith("http") ? r.doi : `https://doi.org/${r.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "11.5px",
                            fontWeight: 500,
                            padding: "3px 8px",
                            borderRadius: 5,
                            background: "var(--color-surface-elevated)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-primary)",
                            textDecoration: "none"
                          }}
                        >
                          <span>DOI Publication</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
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
    color: "var(--color-text)",
    margin: 0
  },
  sectionSub: {
    fontSize: "12px",
    color: "var(--color-text-muted)",
    margin: "2px 0 0 0"
  },
  resultBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--color-primary)",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid var(--color-border)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  cardsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  paperCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "var(--shadow-card)"
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
    color: "var(--color-text)",
    margin: 0,
    lineHeight: "1.4"
  },
  citationBadge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--color-success)",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
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
    color: "var(--color-text-muted)"
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
    color: "var(--color-text-muted)"
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "2px"
  },
  conceptTag: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    color: "var(--color-primary)",
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 7px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  abstractSection: {
    borderTop: "1px solid var(--color-border)",
    paddingTop: "8px"
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    color: "var(--color-primary)",
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
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "var(--color-text-muted)",
    lineHeight: "1.5"
  },
  abstractText: {
    margin: 0
  },
  cardFooter: {
    borderTop: "1px solid var(--color-border)",
    paddingTop: "10px",
    marginTop: "2px",
    display: "flex",
    justifyContent: "flex-end"
  },
  doiLink: {
    color: "var(--color-primary)",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  sidebarCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "var(--shadow-card)"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid var(--color-border)",
    paddingBottom: "10px"
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--color-text)",
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
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px"
  },
  trendingTitle: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--color-text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  trendingBadge: {
    fontSize: "10px",
    color: "var(--color-success)",
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
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "6px"
  },
  conceptName: {
    fontSize: "12px",
    color: "var(--color-text)",
    fontWeight: "500"
  },
  conceptCountBadge: {
    fontSize: "10px",
    color: "var(--color-primary)",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid var(--color-border)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "500"
  }
};

export default ResearchIntelligence;