import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
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
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Activity,
  Flame,
  Compass,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
  DollarSign
} from "lucide-react";

import {
  searchResearch,
  getTrendingResearch,
  getRelatedResearch,
  getResearchTrends,
  getEmergingTopics,
  getResearchHotspots,
  getTopicAnalytics
} from "../services/researchService";
import { useTheme } from "../context/ThemeContext";
import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={customTooltipStyles.container}>
        <p style={customTooltipStyles.label}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || "var(--color-primary)", margin: 0, fontSize: "12px" }}>
            {`${entry.name}: ${typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const customTooltipStyles = {
  container: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    padding: "8px 12px",
    borderRadius: "8px",
    boxShadow: "var(--shadow-dropdown)",
    fontSize: "12px"
  },
  label: {
    color: "var(--color-text)",
    fontWeight: 600,
    margin: "0 0 4px 0"
  }
};

function ResearchIntelligence() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === "light";

  // Active view tab: "overview" (Trends & Emerging) vs "literature" (Paper search)
  const [activeTab, setActiveTab] = useState("overview");

  // Search state
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Artificial intelligence");

  // Literature search state
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [trending, setTrending] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [expandedRelated, setExpandedRelated] = useState({});
  const [relatedData, setRelatedData] = useState({});
  const [loadingRelated, setLoadingRelated] = useState({});

  // Research Trend Analytics state
  const [trendsData, setTrendsData] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState("");
  const [timeGranularity, setTimeGranularity] = useState("annual");

  // Emerging Topics state
  const [emergingData, setEmergingData] = useState(null);
  const [emergingLoading, setEmergingLoading] = useState(true);
  const [emergingError, setEmergingError] = useState("");

  // Research Hotspots state
  const [hotspotsData, setHotspotsData] = useState(null);
  const [hotspotsLoading, setHotspotsLoading] = useState(true);
  const [hotspotsError, setHotspotsError] = useState("");

  // Topic Explorer state
  const [topicDetail, setTopicDetail] = useState(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState("");

  // Load trend intelligence data
  const loadTrends = async (searchParam = query) => {
    setTrendsLoading(true);
    setTrendsError("");
    try {
      const data = await getResearchTrends({
        q: searchParam.trim() || undefined,
        granularity: timeGranularity
      });
      setTrendsData(data);
    } catch (err) {
      console.error("Failed to load publication trends", err);
      setTrendsError(err.response?.data?.detail || "Failed to load publication trend analytics.");
    } finally {
      setTrendsLoading(false);
    }
  };

  const loadEmerging = async (searchParam = query) => {
    setEmergingLoading(true);
    setEmergingError("");
    try {
      const data = await getEmergingTopics({
        q: searchParam.trim() || undefined,
        limit: 8
      });
      setEmergingData(data);
    } catch (err) {
      console.error("Failed to load emerging topics", err);
      setEmergingError(err.response?.data?.detail || "Failed to load emerging topic detection.");
    } finally {
      setEmergingLoading(false);
    }
  };

  const loadHotspots = async (searchParam = query) => {
    setHotspotsLoading(true);
    setHotspotsError("");
    try {
      const data = await getResearchHotspots({
        q: searchParam.trim() || undefined,
        limit: 8
      });
      setHotspotsData(data);
    } catch (err) {
      console.error("Failed to load research hotspots", err);
      setHotspotsError(err.response?.data?.detail || "Failed to load research hotspots.");
    } finally {
      setHotspotsLoading(false);
    }
  };

  const loadTopicDetails = async (topicName) => {
    if (!topicName || !topicName.trim()) return;
    setTopicLoading(true);
    setTopicError("");
    try {
      const data = await getTopicAnalytics(topicName.trim(), 8);
      setTopicDetail(data);
      setSelectedTopic(topicName);
    } catch (err) {
      console.error("Failed to load topic analytics", err);
      setTopicError(err.response?.data?.detail || `Failed to load details for topic "${topicName}".`);
    } finally {
      setTopicLoading(false);
    }
  };

  const performLiteratureSearch = async (searchTerm = query) => {
    const q = (searchTerm || "Artificial intelligence").trim();
    setSearchLoading(true);
    setSearchError("");

    try {
      const data = await searchResearch(q);
      setResults(data.results || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error(err);
      setSearchError(err.response?.data?.detail || "Failed to retrieve literature search data.");
    } finally {
      setSearchLoading(false);
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

  // Initial load
  useEffect(() => {
    loadTrends();
    loadEmerging();
    loadHotspots();
    loadTopicDetails(selectedTopic);
    loadTrending();
    performLiteratureSearch("artificial intelligence");
  }, []);

  // When timeGranularity changes
  useEffect(() => {
    loadTrends(query);
  }, [timeGranularity]);

  const handleGlobalSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    loadTrends(query);
    loadEmerging(query);
    loadHotspots(query);
    if (query.trim()) {
      loadTopicDetails(query.trim());
      performLiteratureSearch(query);
    }
  };

  const handleSelectTopic = (topicName) => {
    setSelectedTopic(topicName);
    loadTopicDetails(topicName);
    // Smooth scroll to Topic Explorer if on overview tab
    const el = document.getElementById("topic-explorer-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleAbstract = (id) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleRelated = async (itemKey, r) => {
    if (expandedRelated[itemKey]) {
      setExpandedRelated((prev) => ({ ...prev, [itemKey]: false }));
      return;
    }

    setExpandedRelated((prev) => ({ ...prev, [itemKey]: true }));
    if (!relatedData[itemKey] && !loadingRelated[itemKey]) {
      setLoadingRelated((prev) => ({ ...prev, [itemKey]: true }));
      try {
        const workId = r.id || r.doi || r.title;
        const res = await getRelatedResearch(workId, 5);
        setRelatedData((prev) => ({ ...prev, [itemKey]: res.results || [] }));
      } catch (err) {
        console.error("Failed to load related research", err);
        setRelatedData((prev) => ({ ...prev, [itemKey]: [] }));
      } finally {
        setLoadingRelated((prev) => ({ ...prev, [itemKey]: false }));
      }
    }
  };

  // Format chart data
  const timeSeriesData = useMemo(() => {
    if (!trendsData) return [];
    if (timeGranularity === "monthly" && trendsData.monthly_timeline && trendsData.monthly_timeline.length > 0) {
      return trendsData.monthly_timeline.map((item) => ({
        name: item.period,
        publications: item.publication_count
      }));
    }
    return (trendsData.timeline || []).map((item) => ({
      name: item.label || String(item.year),
      publications: item.publication_count,
      citations: item.avg_citations || 0,
      isPartial: item.is_partial_year
    }));
  }, [trendsData, timeGranularity]);

  const activeColor = isLight ? "#2F6FED" : "#4C8DFF";
  const gridColor = isLight ? "#E2E8F0" : "#202A38";
  const axisColor = isLight ? "#64748B" : "#98A4B5";

  return (
    <div style={styles.container}>
      {/* SECTION HEADER */}
      <SectionHeader
        title="Research Trend Intelligence"
        subtitle="Data-driven publication trajectory analysis, transparent emerging topic detection, and cross-source research hotspots."
        icon={Activity}
        badge="Multi-Source Intelligence"
      >
        <button
          onClick={() => {
            loadTrends();
            loadEmerging();
            loadHotspots();
            if (selectedTopic) loadTopicDetails(selectedTopic);
          }}
          style={styles.refreshBtn}
          title="Refresh Trend Intelligence"
        >
          <RefreshCw size={14} />
          <span>Refresh Analysis</span>
        </button>
      </SectionHeader>

      {/* TOP KPI OVERVIEW */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Analyzed Publications"
          value={trendsData ? trendsData.meta?.records_analyzed?.toLocaleString() : "..."}
          icon={BookOpen}
          subtext="Deduplicated research works"
          color="#4C8DFF"
        />
        <StatCard
          title="Period-over-Period Growth"
          value={
            trendsData?.period_growth?.growth_rate_pct !== null && trendsData?.period_growth?.growth_rate_pct !== undefined
              ? `${trendsData.period_growth.growth_rate_pct > 0 ? "+" : ""}${trendsData.period_growth.growth_rate_pct}%`
              : "Insufficient Base"
          }
          icon={TrendingUp}
          subtext={
            trendsData?.period_growth?.recent_period
              ? `${trendsData.period_growth.prior_period} vs ${trendsData.period_growth.recent_period}`
              : "Comparable complete periods"
          }
          color={
            trendsData?.period_growth?.status === "GROWING"
              ? "var(--color-success)"
              : trendsData?.period_growth?.status === "STABLE"
              ? "var(--color-primary)"
              : "var(--color-warning)"
          }
        />
        <StatCard
          title="Emerging Topics Detected"
          value={emergingData ? emergingData.total_emerging_found?.toString() : "..."}
          icon={Sparkles}
          subtext="Statistically qualified growth"
          color="#8B5CF6"
        />
        <StatCard
          title="Citation Coverage"
          value={
            trendsData?.citation_metrics?.citation_coverage_pct !== undefined
              ? `${trendsData.citation_metrics.citation_coverage_pct}%`
              : "..."
          }
          icon={Award}
          subtext={
            trendsData?.citation_metrics?.avg_citations_per_paper
              ? `Avg ${trendsData.citation_metrics.avg_citations_per_paper} citations/paper`
              : "Verified citation indices"
          }
          color="#35C98A"
        />
      </div>

      {/* SEARCH AND NAVIGATION BAR */}
      <div style={styles.searchSection}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 360px", minWidth: "280px" }}>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleGlobalSearch}
              placeholder="Filter trend intelligence by topic, keyword, or domain (e.g., 'Artificial Intelligence', 'Cybersecurity')..."
              loading={trendsLoading || emergingLoading}
            />
          </div>

          {/* VIEW SWITCHER TABS */}
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                ...styles.tabBtn,
                ...(activeTab === "overview" ? styles.tabBtnActive : {})
              }}
            >
              <Activity size={14} />
              <span>Trend Intelligence & Hotspots</span>
            </button>
            <button
              onClick={() => setActiveTab("literature")}
              style={{
                ...styles.tabBtn,
                ...(activeTab === "literature" ? styles.tabBtnActive : {})
              }}
            >
              <FileText size={14} />
              <span>Literature Papers ({results.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RESEARCH TREND INTELLIGENCE & EMERGING TOPICS */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* SECTION A: RESEARCH ACTIVITY TIME-SERIES */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={18} color="var(--color-primary)" />
                  <h3 style={styles.cardTitle}>Research Activity Timeline</h3>
                </div>
                <p style={styles.cardSubtitle}>
                  Interactive publication volume and citation impact across verifiable historical publication dates
                </p>
              </div>

              {/* Time Granularity Toggle */}
              <div style={styles.granularityToggle}>
                <button
                  onClick={() => setTimeGranularity("annual")}
                  style={{
                    ...styles.granularityBtn,
                    ...(timeGranularity === "annual" ? styles.granularityBtnActive : {})
                  }}
                >
                  Annual Complete
                </button>
                <button
                  onClick={() => setTimeGranularity("monthly")}
                  style={{
                    ...styles.granularityBtn,
                    ...(timeGranularity === "monthly" ? styles.granularityBtnActive : {})
                  }}
                  title={trendsData?.monthly_status === "UNAVAILABLE" ? "Monthly timestamps unavailable" : "Monthly timeline"}
                >
                  Monthly Timeline
                </button>
              </div>
            </div>

            {/* Incomplete Year Alert / Notification */}
            {trendsData?.period_growth?.recent_period && (
              <div style={styles.noticeBanner}>
                <Info size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--color-text)" }}>
                  <strong>Data Integrity Governance:</strong> Complete annual period comparison evaluated between{" "}
                  <strong>{trendsData.period_growth.prior_period}</strong> ({trendsData.period_growth.prior_volume} papers) and{" "}
                  <strong>{trendsData.period_growth.recent_period}</strong> ({trendsData.period_growth.recent_volume} papers) —{" "}
                  {trendsData.period_growth.explanation} Incomplete current year ({new Date().getFullYear()}) data is isolated to prevent false decline classifications.
                </span>
              </div>
            )}

            {trendsLoading ? (
              <LoadingSkeleton type="card" height={260} />
            ) : trendsError ? (
              <ErrorState message={trendsError} onRetry={() => loadTrends(query)} />
            ) : timeSeriesData.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No Publication Activity Found"
                message="No publication records found for the specified query in the database."
              />
            ) : (
              <div style={{ width: "100%", height: 300, marginTop: "16px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} />
                    <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar
                      dataKey="publications"
                      name="Publications"
                      fill={activeColor}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* TWO-COLUMN GRID: SECTION B (EMERGING TOPICS) & SECTION C (RESEARCH HOTSPOTS) */}
          <div style={styles.twoColGrid}>

            {/* SECTION B: EMERGING TOPICS */}
            <div style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={18} color="#8B5CF6" />
                    <h3 style={styles.cardTitle}>Emerging Topics</h3>
                  </div>
                  <p style={styles.cardSubtitle}>
                    Ranked by period-over-period growth and velocity across verified 12-month complete windows
                  </p>
                </div>
                <span style={styles.pillBadgePurple}>
                  {emergingData ? `${emergingData.total_emerging_found} Found` : "Evaluating"}
                </span>
              </div>

              {emergingLoading ? (
                <LoadingSkeleton type="card" count={4} height={100} />
              ) : emergingError ? (
                <ErrorState message={emergingError} onRetry={() => loadEmerging(query)} />
              ) : !emergingData?.emerging_topics || emergingData.emerging_topics.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Insufficient Growth Data"
                  message="No emerging topics meet the minimum growth and volume thresholds for this query."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  {emergingData.emerging_topics.map((item, idx) => {
                    const isSelected = selectedTopic.toLowerCase() === item.topic.toLowerCase();
                    return (
                      <div
                        key={item.topic || idx}
                        style={{
                          ...styles.emergingItemCard,
                          ...(isSelected ? styles.itemCardSelected : {})
                        }}
                        onClick={() => handleSelectTopic(item.topic)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={styles.rankBadge}>#{idx + 1}</span>
                              <h4 style={styles.itemTitle}>{item.topic}</h4>
                            </div>
                            <p style={styles.itemRationale}>{item.evidence_rationale}</p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span
                              style={{
                                ...styles.growthBadge,
                                ...(item.growth_rate_pct >= 50
                                  ? styles.growthBadgeHigh
                                  : styles.growthBadgeModerate)
                              }}
                            >
                              <TrendingUp size={11} />
                              {item.growth_rate_pct !== null ? `+${item.growth_rate_pct}%` : "New Entrant"}
                            </span>
                          </div>
                        </div>

                        {/* Metrics Bar */}
                        <div style={styles.metricsRow}>
                          <span style={styles.metricItem}>
                            <strong>{item.recent_period_volume}</strong> recent papers
                          </span>
                          <span style={styles.metricDivider}>•</span>
                          <span style={styles.metricItem}>
                            Baseline: <strong>{item.prior_period_volume}</strong> papers
                          </span>
                          <span style={styles.metricDivider}>•</span>
                          <span style={styles.metricItem}>
                            Score: <strong>{item.emerging_score}/100</strong>
                          </span>
                          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                            {item.sources_used.slice(0, 2).map((s) => (
                              <span key={s} style={styles.sourceTag}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION C: RESEARCH HOTSPOTS */}
            <div style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Flame size={18} color="#F59E0B" />
                    <h3 style={styles.cardTitle}>Research Hotspots</h3>
                  </div>
                  <p style={styles.cardSubtitle}>
                    Domains with highest sustained publication volume, citations, and institutional activity
                  </p>
                </div>
                <span style={styles.pillBadgeAmber}>High Activity</span>
              </div>

              {hotspotsLoading ? (
                <LoadingSkeleton type="card" count={4} height={100} />
              ) : hotspotsError ? (
                <ErrorState message={hotspotsError} onRetry={() => loadHotspots(query)} />
              ) : !hotspotsData?.hotspots || hotspotsData.hotspots.length === 0 ? (
                <EmptyState
                  icon={Flame}
                  title="No Hotspots Identified"
                  message="No topics have sufficient volume to be classified as hotspots."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  {hotspotsData.hotspots.map((item, idx) => {
                    const isSelected = selectedTopic.toLowerCase() === item.topic.toLowerCase();
                    return (
                      <div
                        key={item.topic || idx}
                        style={{
                          ...styles.hotspotItemCard,
                          ...(isSelected ? styles.itemCardSelected : {})
                        }}
                        onClick={() => handleSelectTopic(item.topic)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <h4 style={styles.itemTitle}>{item.topic}</h4>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                Period: {item.time_period}
                              </span>
                              {item.total_citations !== null && (
                                <>
                                  <span style={styles.metricDivider}>•</span>
                                  <span style={{ fontSize: "11px", color: "var(--color-success)" }}>
                                    {item.total_citations?.toLocaleString()} citations
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span style={styles.volumeBadge}>
                            {item.publication_volume} publications
                          </span>
                        </div>

                        {/* Leading Organizations & Researchers */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", fontSize: "11px" }}>
                          {item.leading_organizations && item.leading_organizations.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-muted)" }}>
                              <Building size={12} />
                              <span>{item.leading_organizations.map((o) => o.name).slice(0, 2).join(", ")}</span>
                            </div>
                          )}
                          {item.leading_researchers && item.leading_researchers.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-muted)" }}>
                              <Users size={12} />
                              <span>{item.leading_researchers.map((r) => r.name).slice(0, 2).join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION D: TOPIC EXPLORER */}
          <div id="topic-explorer-section" style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Compass size={18} color="var(--color-primary)" />
                  <h3 style={styles.cardTitle}>Topic Explorer: {selectedTopic}</h3>
                </div>
                <p style={styles.cardSubtitle}>
                  Deep-dive analysis into publication velocity, institutions, supporting publications, and cross-module links
                </p>
              </div>

              {/* Quick Topic Search */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Selected:</span>
                <span style={styles.pillBadgePrimary}>{selectedTopic}</span>
              </div>
            </div>

            {topicLoading ? (
              <LoadingSkeleton type="card" height={220} />
            ) : topicError ? (
              <ErrorState message={topicError} onRetry={() => loadTopicDetails(selectedTopic)} />
            ) : !topicDetail || !topicDetail.found ? (
              <EmptyState
                icon={Compass}
                title="Topic Not Found"
                message={`No publications found matching topic "${selectedTopic}".`}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>

                {/* Topic KPI Bar */}
                <div style={styles.topicKpiRow}>
                  <div style={styles.topicKpiCard}>
                    <span style={styles.topicKpiLabel}>Research Volume</span>
                    <span style={styles.topicKpiVal}>{topicDetail.research_volume} papers</span>
                  </div>
                  <div style={styles.topicKpiCard}>
                    <span style={styles.topicKpiLabel}>Total Citations</span>
                    <span style={styles.topicKpiVal}>
                      {topicDetail.citation_metrics?.total_citations?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div style={styles.topicKpiCard}>
                    <span style={styles.topicKpiLabel}>Avg Impact</span>
                    <span style={styles.topicKpiVal}>
                      {topicDetail.citation_metrics?.avg_citations_per_paper || "0"} cit/paper
                    </span>
                  </div>
                  <div style={styles.topicKpiCard}>
                    <span style={styles.topicKpiLabel}>Period Growth</span>
                    <span style={{ ...styles.topicKpiVal, color: (topicDetail.growth_rate_pct || 0) >= 0 ? "var(--color-success)" : "var(--color-warning)" }}>
                      {topicDetail.growth_rate_pct !== null ? `${topicDetail.growth_rate_pct > 0 ? "+" : ""}${topicDetail.growth_rate_pct}%` : "Established"}
                    </span>
                  </div>
                </div>

                {/* Sub-grid: Timeline Chart & Related Topics */}
                <div style={styles.topicSubGrid}>
                  {/* Left: Mini Timeline Chart */}
                  <div style={styles.subCard}>
                    <h5 style={styles.subCardTitle}>Publication Timeline for {topicDetail.topic}</h5>
                    <div style={{ width: "100%", height: 180, marginTop: "8px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={topicDetail.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                          <XAxis dataKey="year" stroke={axisColor} fontSize={11} tickLine={false} />
                          <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="publication_count"
                            name="Publications"
                            stroke={activeColor}
                            strokeWidth={2}
                            dot={{ r: 3, fill: activeColor }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Leading Organizations & Researchers */}
                  <div style={styles.subCard}>
                    <h5 style={styles.subCardTitle}>Key Contributors</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      <div>
                        <span style={styles.metaLabelSmall}>Leading Institutions:</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                          {topicDetail.leading_organizations?.slice(0, 4).map((org) => (
                            <span key={org.name} style={styles.contributorBadge}>
                              <Building size={11} />
                              {org.name} ({org.publications})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span style={styles.metaLabelSmall}>Top Researchers:</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                          {topicDetail.leading_researchers?.slice(0, 4).map((res) => (
                            <span key={res.name} style={styles.contributorBadge}>
                              <Users size={11} />
                              {res.name} ({res.publications})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span style={styles.metaLabelSmall}>Related Concepts:</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                          {topicDetail.related_topics?.slice(0, 5).map((rel) => (
                            <button
                              key={rel.name}
                              onClick={() => handleSelectTopic(rel.name)}
                              style={styles.clickableConceptTag}
                              title={`Inspect ${rel.name}`}
                            >
                              <Tag size={10} />
                              {rel.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CROSS-MODULE CONNECTIONS (Section 9) */}
                <div style={styles.crossModuleSection}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Layers size={16} color="var(--color-primary)" />
                      <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                        Cross-Module Intelligence & Industry Translation
                      </h4>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      Verified relational links
                    </span>
                  </div>

                  <div style={styles.crossModuleGrid}>
                    {/* Related Patents */}
                    <div style={styles.crossModuleCard}>
                      <div style={styles.crossModuleHeader}>
                        <Award size={14} color="#F59E0B" />
                        <span style={styles.crossModuleTitle}>Related Patents ({topicDetail.cross_module_connections?.patents_count || 0})</span>
                      </div>
                      {topicDetail.cross_module_connections?.patents?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {topicDetail.cross_module_connections.patents.slice(0, 2).map((p) => (
                            <div key={p.patent_number} style={styles.crossModuleItem}>
                              <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "12px" }}>
                                {p.title}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                {p.assignee} · Grant {p.grant_year || "Recent"}
                              </span>
                            </div>
                          ))}
                          <Link to="/patents" style={styles.crossModuleLink}>
                            Explore Patents <ArrowRight size={12} />
                          </Link>
                        </div>
                      ) : (
                        <p style={styles.crossModuleEmpty}>
                          No direct USPTO patents tagged to this exact keyword in cache.{" "}
                          <Link to="/patents" style={{ color: "var(--color-primary)" }}>Search Patents</Link>
                        </p>
                      )}
                    </div>

                    {/* Related Funding Opportunities */}
                    <div style={styles.crossModuleCard}>
                      <div style={styles.crossModuleHeader}>
                        <DollarSign size={14} color="var(--color-success)" />
                        <span style={styles.crossModuleTitle}>Federal Grants ({topicDetail.cross_module_connections?.funding_count || 0})</span>
                      </div>
                      {topicDetail.cross_module_connections?.funding?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {topicDetail.cross_module_connections.funding.slice(0, 2).map((f) => (
                            <div key={f.project_number} style={styles.crossModuleItem}>
                              <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "12px" }}>
                                {f.title}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                ${Number(f.award_amount || 0).toLocaleString()} · FY{f.fiscal_year}
                              </span>
                            </div>
                          ))}
                          <Link to="/funding" style={styles.crossModuleLink}>
                            Explore Funding Awards <ArrowRight size={12} />
                          </Link>
                        </div>
                      ) : (
                        <p style={styles.crossModuleEmpty}>
                          No active NIH/NSF grants matched in local cache.{" "}
                          <Link to="/funding" style={{ color: "var(--color-primary)" }}>Explore Funding</Link>
                        </p>
                      )}
                    </div>

                    {/* Platform Integration Links */}
                    <div style={styles.crossModuleCard}>
                      <div style={styles.crossModuleHeader}>
                        <Sparkles size={14} color="#8B5CF6" />
                        <span style={styles.crossModuleTitle}>System Modules</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Link
                          to={`/search?q=${encodeURIComponent(topicDetail.topic)}`}
                          style={styles.moduleActionButton}
                        >
                          <Search size={13} />
                          <span>Global Federated Search</span>
                        </Link>
                        <Link
                          to="/innovation-scoring"
                          style={styles.moduleActionButton}
                        >
                          <TrendingUp size={13} />
                          <span>Innovation Scoring Model</span>
                        </Link>
                        <Link
                          to="/technologies"
                          style={styles.moduleActionButton}
                        >
                          <Compass size={13} />
                          <span>Technology Commercialization</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supporting Publications List */}
                <div>
                  <h5 style={{ ...styles.subCardTitle, marginBottom: "10px" }}>
                    Top Supporting Publications for {topicDetail.topic}
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {topicDetail.supporting_publications?.map((pub, pi) => (
                      <div key={pub.id || pi} style={styles.supportingPubCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <h6 style={styles.pubTitle}>
                              {pub.url ? (
                                <a
                                  href={pub.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  {pub.title}
                                  <ArrowUpRight size={12} />
                                </a>
                              ) : (
                                pub.title
                              )}
                            </h6>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "3px" }}>
                              {pub.authors && pub.authors.length > 0 && pub.authors.slice(0, 3).join(", ")}
                              {pub.year && ` (${pub.year})`}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {pub.citations !== null && (
                              <span style={styles.citationBadge}>
                                <Award size={10} style={{ marginRight: 3 }} />
                                {pub.citations} citations
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION E: DATA COVERAGE & SCIENTIFIC RIGOR */}
          <div style={styles.coverageCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <ShieldCheck size={18} color="var(--color-success)" />
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                Data Quality, Provenance & Scientific Methodology
              </h4>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
              This research analytics engine implements strict deduplication across OpenAlex, Crossref, and Semantic Scholar.
              Growth calculations compare equal 12-month complete annual periods. Incomplete calendar years (e.g. current year to date)
              are isolated to prevent false deceleration signals. Metrics strictly reflect verifiable bibliographic records.
            </p>

            <div style={styles.coverageBadgesRow}>
              <div style={styles.coverageBadge}>
                <span style={styles.coverageBadgeLabel}>Records Analyzed:</span>
                <span style={styles.coverageBadgeVal}>{trendsData?.meta?.records_analyzed || 0} Unified Works</span>
              </div>
              <div style={styles.coverageBadge}>
                <span style={styles.coverageBadgeLabel}>Date Span:</span>
                <span style={styles.coverageBadgeVal}>
                  {trendsData?.meta?.date_range?.min_year || "Historical"} – {trendsData?.meta?.date_range?.max_year || new Date().getFullYear()}
                </span>
              </div>
              <div style={styles.coverageBadge}>
                <span style={styles.coverageBadgeLabel}>Data Providers:</span>
                <span style={styles.coverageBadgeVal}>
                  {trendsData?.meta?.sources_represented?.join(", ") || "OpenAlex, Crossref, Semantic Scholar"}
                </span>
              </div>
              <div style={styles.coverageBadge}>
                <span style={styles.coverageBadgeLabel}>Thresholds:</span>
                <span style={styles.coverageBadgeVal}>Min 3 papers for growth qualification</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED LITERATURE SEARCH & FAISS VECTOR TRAY */}
      {activeTab === "literature" && (
        <div style={styles.layoutGrid}>
          {/* LEFT COLUMN: Publication Search Results */}
          <div style={styles.leftCol}>
            <div style={styles.sectionHeaderRow}>
              <div>
                <h3 style={styles.sectionTitle}>Scientific Publication Records</h3>
                <p style={styles.sectionSub}>Deduplicated literature indexed from OpenAlex, Crossref & Semantic Scholar</p>
              </div>
              <span style={styles.resultBadge}>{results.length} Publications</span>
            </div>

            {/* Provider Health Bar */}
            {meta && meta.source_status && (
              <div style={styles.providerHealthBar}>
                <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                  Sources:
                </span>
                {Object.entries(meta.source_status).map(([srcName, status]) => (
                  <span key={srcName} style={styles.providerHealthTag}>
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

            {searchLoading ? (
              <LoadingSkeleton type="card" count={4} height={140} />
            ) : results.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Research Results Found"
                message={`No publications matched "${query || "current query"}". Try searching another research topic.`}
                actionLabel="Try 'Quantum Computing'"
                onAction={() => {
                  setQuery("quantum computing");
                  performLiteratureSearch("quantum computing");
                }}
              />
            ) : (
              <div style={styles.cardsList}>
                {results.map((r, i) => {
                  const itemKey = r.id || r.doi || i;
                  const isExpanded = !!expandedAbstracts[itemKey];
                  const isRelatedOpen = !!expandedRelated[itemKey];
                  const relatedList = relatedData[itemKey] || [];
                  const isRelatedLoading = !!loadingRelated[itemKey];

                  return (
                    <div key={itemKey} style={styles.paperCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {(r.sources && r.sources.length > 0 ? r.sources : ["OpenAlex"]).map((src) => (
                            <span key={src} style={styles.sourceBadge}>
                              {src}
                            </span>
                          ))}
                          {r.publication_year && (
                            <span style={styles.yearBadge}>
                              <Calendar size={10} style={{ marginRight: 3 }} />
                              {r.publication_year}
                            </span>
                          )}
                        </div>

                        {r.cited_by_count !== undefined && (
                          <span style={styles.citationBadge}>
                            <Award size={11} style={{ marginRight: 4 }} />
                            {r.cited_by_count.toLocaleString()} citations
                          </span>
                        )}
                      </div>

                      <h4 style={styles.paperTitle}>
                        {r.doi || r.openalex_id ? (
                          <a
                            href={r.doi ? (r.doi.startsWith("http") ? r.doi : `https://doi.org/${r.doi}`) : r.openalex_id}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            {r.title}
                            <ArrowUpRight size={14} color="var(--color-primary)" />
                          </a>
                        ) : (
                          r.title
                        )}
                      </h4>

                      {r.authors && r.authors.length > 0 && (
                        <div style={styles.metaRow}>
                          <div style={styles.metaItem}>
                            <Users size={12} style={{ marginRight: 4 }} />
                            <span>{r.authors.slice(0, 3).join(", ")}{r.authors.length > 3 && ` +${r.authors.length - 3}`}</span>
                          </div>
                        </div>
                      )}

                      {r.abstract && (
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.4, marginTop: 4 }}>
                          {isExpanded ? r.abstract : `${r.abstract.substring(0, 160)}...`}
                          <button
                            onClick={() => toggleAbstract(itemKey)}
                            style={styles.expandAbstractBtn}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        </div>
                      )}

                      {/* SEMANTIC SEARCH SIMILARITY BUTTON */}
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                          onClick={() => handleToggleRelated(itemKey, r)}
                          style={styles.relatedToggleBtn}
                        >
                          <Sparkles size={12} />
                          <span>{isRelatedOpen ? "Hide Semantic Match" : "Find Semantically Related"}</span>
                        </button>
                      </div>

                      {/* EXPANDED VECTOR SIMILARITY TRAY */}
                      {isRelatedOpen && (
                        <div style={styles.relatedTray}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Sparkles size={13} color="var(--color-primary)" />
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>
                                Semantically Aligned Publications
                              </span>
                            </div>
                            <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                              FAISS 384-d MiniLM Vector Match
                            </span>
                          </div>

                          {isRelatedLoading && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", color: "var(--color-text-muted)", fontSize: "12px" }}>
                              <Loader2 size={14} className="spin" />
                              <span>Searching high-dimensional vector space...</span>
                            </div>
                          )}

                          {!isRelatedLoading && relatedList.length === 0 && (
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", padding: "6px 0" }}>
                              No semantically related publications found in vector index.
                            </div>
                          )}

                          {!isRelatedLoading && relatedList.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {relatedList.map((rel, ri) => (
                                <div key={rel.id || ri} style={styles.relatedItemCard}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={styles.similarityTag}>
                                      {Math.round((rel.similarity || 0.8) * 100)}% Match
                                    </span>
                                    <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                                      {rel.year || "Recent"} · {rel.citation_count || 0} citations
                                    </span>
                                  </div>
                                  <h6 style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: "4px 0" }}>
                                    {rel.title}
                                  </h6>
                                </div>
                              ))}
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

          {/* RIGHT COLUMN: Trending sidebar */}
          <div style={styles.rightCol}>
            <div style={styles.sidebarCard}>
              <div style={styles.sidebarHeader}>
                <TrendingUp size={16} color="var(--color-success)" />
                <h4 style={styles.sidebarTitle}>Global Trending Publications</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {trending.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "12px", margin: 0 }}>
                    No trending papers currently loaded.
                  </p>
                ) : (
                  trending.slice(0, 6).map((t, ti) => (
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
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px 32px",
    maxWidth: "1480px",
    margin: "0 auto",
    color: "var(--color-text)"
  },
  refreshBtn: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    fontSize: "12px",
    fontWeight: "500",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  },
  searchSection: {
    marginBottom: "20px"
  },
  tabContainer: {
    display: "inline-flex",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "4px",
    gap: "4px"
  },
  tabBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "var(--color-text-muted)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  tabBtnActive: {
    background: "var(--color-primary)",
    color: "#FFFFFF",
    fontWeight: "600"
  },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "20px 22px",
    boxShadow: "var(--shadow-card)"
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0
  },
  cardSubtitle: {
    fontSize: "12px",
    color: "var(--color-text-muted)",
    margin: "3px 0 0 0"
  },
  granularityToggle: {
    display: "inline-flex",
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "3px",
    gap: "3px"
  },
  granularityBtn: {
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "500",
    border: "none",
    background: "transparent",
    color: "var(--color-text-muted)",
    borderRadius: "6px",
    cursor: "pointer"
  },
  granularityBtnActive: {
    background: "var(--color-primary)",
    color: "#FFFFFF",
    fontWeight: "600"
  },
  noticeBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "var(--color-primary-subtle)",
    border: "1px solid rgba(76, 141, 255, 0.2)",
    marginTop: "14px"
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
    gap: "20px"
  },
  pillBadgePurple: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#8B5CF6",
    background: "rgba(139, 92, 246, 0.12)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    padding: "3px 10px",
    borderRadius: "12px"
  },
  pillBadgeAmber: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#F59E0B",
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    padding: "3px 10px",
    borderRadius: "12px"
  },
  pillBadgePrimary: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--color-primary)",
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    padding: "3px 10px",
    borderRadius: "12px"
  },
  emergingItemCard: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "14px 16px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  hotspotItemCard: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "14px 16px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  itemCardSelected: {
    border: "1px solid var(--color-primary)",
    boxShadow: "0 0 0 1px var(--color-primary)"
  },
  rankBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--color-text-muted)"
  },
  itemTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0
  },
  itemRationale: {
    fontSize: "12px",
    color: "var(--color-text-muted)",
    margin: "4px 0 0 0",
    lineHeight: 1.4
  },
  growthBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  growthBadgeHigh: {
    background: "rgba(53, 201, 138, 0.15)",
    color: "var(--color-success)",
    border: "1px solid rgba(53, 201, 138, 0.3)"
  },
  growthBadgeModerate: {
    background: "rgba(76, 141, 255, 0.15)",
    color: "var(--color-primary)",
    border: "1px solid rgba(76, 141, 255, 0.3)"
  },
  volumeBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--color-primary)",
    background: "var(--color-primary-subtle)",
    padding: "3px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap"
  },
  metricsRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "8px",
    fontSize: "11px",
    color: "var(--color-text-muted)"
  },
  metricItem: {
    display: "inline-flex",
    alignItems: "center"
  },
  metricDivider: {
    color: "var(--color-text-dim)"
  },
  sourceTag: {
    fontSize: "9px",
    fontWeight: "600",
    padding: "1px 5px",
    borderRadius: "4px",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-muted)"
  },
  topicKpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px"
  },
  topicKpiCard: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "10px 14px"
  },
  topicKpiLabel: {
    fontSize: "11px",
    color: "var(--color-text-muted)",
    display: "block"
  },
  topicKpiVal: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--color-text)",
    marginTop: "2px",
    display: "block"
  },
  topicSubGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  subCard: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "14px 16px"
  },
  subCardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0
  },
  metaLabelSmall: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--color-text-dim)",
    display: "block"
  },
  contributorBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "6px",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)"
  },
  clickableConceptTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "6px",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-primary)",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  crossModuleSection: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "16px"
  },
  crossModuleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px"
  },
  crossModuleCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  crossModuleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  crossModuleTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--color-text)"
  },
  crossModuleItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "6px 8px",
    borderRadius: "6px",
    background: "var(--color-surface-elevated)"
  },
  crossModuleLink: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--color-primary)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px"
  },
  crossModuleEmpty: {
    fontSize: "11px",
    color: "var(--color-text-muted)",
    margin: 0,
    lineHeight: 1.4
  },
  moduleActionButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--color-text)",
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    padding: "6px 10px",
    borderRadius: "6px",
    textDecoration: "none",
    transition: "all 0.2s"
  },
  supportingPubCard: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "10px 14px"
  },
  pubTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0
  },
  citationBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--color-success)",
    background: "rgba(53, 201, 138, 0.12)",
    border: "1px solid rgba(53, 201, 138, 0.25)",
    padding: "2px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center"
  },
  coverageCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "18px 22px",
    boxShadow: "var(--shadow-card)"
  },
  coverageBadgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px"
  },
  coverageBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "11px"
  },
  coverageBadgeLabel: {
    color: "var(--color-text-muted)"
  },
  coverageBadgeVal: {
    fontWeight: "600",
    color: "var(--color-text)"
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
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  providerHealthBar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "10px 14px",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "12px"
  },
  providerHealthTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    fontSize: "11px",
    color: "var(--color-text)"
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
  paperTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0,
    lineHeight: "1.4"
  },
  sourceBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--color-primary)",
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  yearBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    color: "var(--color-text-muted)",
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    padding: "2px 6px",
    borderRadius: "4px"
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
    alignItems: "center"
  },
  expandAbstractBtn: {
    background: "none",
    border: "none",
    color: "var(--color-primary)",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    marginLeft: 6
  },
  relatedToggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 6,
    background: "var(--color-primary-subtle)",
    border: "1px solid var(--color-border)",
    color: "var(--color-primary)",
    cursor: "pointer"
  },
  relatedTray: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 8,
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)"
  },
  relatedItemCard: {
    padding: "8px 10px",
    borderRadius: 6,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)"
  },
  similarityTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: "10px",
    fontWeight: "600",
    color: "var(--color-primary)",
    background: "rgba(99, 102, 241, 0.12)",
    padding: "1px 5px",
    borderRadius: 4
  },
  sidebarCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "16px 18px",
    boxShadow: "var(--shadow-card)"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px"
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0
  },
  trendingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid var(--color-border-subtle)",
    fontSize: "12px"
  },
  trendingTitle: {
    color: "var(--color-text)",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "200px"
  },
  trendingBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    color: "var(--color-success)",
    fontWeight: "600",
    flexShrink: 0
  }
};

export default ResearchIntelligence;