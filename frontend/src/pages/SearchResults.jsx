import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Shield,
  DollarSign,
  Cpu,
  Building2,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowUpRight,
  Loader2
} from "lucide-react";

import { globalSearch } from "../services/searchService";
import { getRelatedResearch } from "../services/researchService";
import SectionHeader from "../components/SectionHeader";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const initialTab = searchParams.get("tab") || "all";
  const searchMode = searchParams.get("mode") || "all";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  // Related Research state
  const [expandedRelated, setExpandedRelated] = useState({});
  const [relatedData, setRelatedData] = useState({});
  const [loadingRelated, setLoadingRelated] = useState({});

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults();
    }
  }, [query, searchMode]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await globalSearch(query, "all", 1, 25, searchMode);
      setData(res);
    } catch (err) {
      console.error("Search error", err);
      setError(
        err.response?.data?.detail || "Failed to complete multi-source research search."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ q: query, tab: tabId, mode: searchMode });
  };

  const handleModeChange = (newMode) => {
    setSearchParams({ q: query, tab: activeTab, mode: newMode });
  };

  const toggleAbstract = (id) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleRelated = async (itemKey, item) => {
    const isCurrentlyOpen = !!expandedRelated[itemKey];
    setExpandedRelated((prev) => ({ ...prev, [itemKey]: !isCurrentlyOpen }));

    if (!isCurrentlyOpen && !relatedData[itemKey]) {
      setLoadingRelated((prev) => ({ ...prev, [itemKey]: true }));
      try {
        const targetId = item.id || item.doi || item.openalex_id;
        const res = await getRelatedResearch(targetId, 5);
        setRelatedData((prev) => ({ ...prev, [itemKey]: res.results || [] }));
      } catch (err) {
        console.error("Failed fetching related research", err);
      } finally {
        setLoadingRelated((prev) => ({ ...prev, [itemKey]: false }));
      }
    }
  };

  const counts = data?.meta?.counts || {
    total: 0,
    research: 0,
    patents: 0,
    funding: 0,
    technologies: 0,
    organizations: 0,
    researchers: 0
  };

  const sourceStatus = data?.meta?.source_status || {};
  const errors = data?.meta?.errors || {};

  const tabs = [
    { id: "all", label: "All Results", count: counts.total || 0, icon: Layers },
    { id: "research", label: "Research", count: counts.research || 0, icon: BookOpen },
    { id: "patents", label: "Patents", count: counts.patents || 0, icon: Shield },
    { id: "funding", label: "Funding", count: counts.funding || 0, icon: DollarSign },
    { id: "technology", label: "Technology", count: counts.technologies || 0, icon: Cpu },
    { id: "organizations", label: "Organizations", count: counts.organizations || 0, icon: Building2 },
    { id: "researchers", label: "Researchers", count: counts.researchers || 0, icon: Users }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "LIVE":
        return (
          <span className="source-health-badge health-live" title="Provider responding live in real-time">
            <span className="health-dot dot-live" /> LIVE
          </span>
        );
      case "CACHED":
        return (
          <span className="source-health-badge health-cached" title="Serving verified cached intelligence">
            <span className="health-dot dot-cached" /> CACHED
          </span>
        );
      default:
        return (
          <span className="source-health-badge health-unavailable" title="Provider temporarily unreachable">
            <span className="health-dot dot-unavailable" /> UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="search-page-container">
      {/* HEADER SECTION */}
      <div className="search-page-header">
        <div className="header-meta-row">
          <SectionHeader
            title={`Multi-Source Results for "${query || "..."}"`}
            subtitle="Aggregated intelligence unified across OpenAlex, Crossref, Semantic Scholar, USPTO, and Vector Index"
          />

          <button
            onClick={fetchSearchResults}
            className="search-refresh-btn"
            disabled={loading}
            title="Refresh Search"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* SEARCH MODE SELECTOR (All | Keyword | Semantic) */}
        <div className="search-mode-row">
          <div className="mode-toggle-cluster">
            <span className="mode-label-prefix">Search Mode:</span>
            <div className="mode-btn-group">
              <button
                type="button"
                className={`mode-btn ${searchMode === "all" ? "active" : ""}`}
                onClick={() => handleModeChange("all")}
                title="Hybrid search combining keyword multi-source matching and vector similarity"
              >
                All (Hybrid)
              </button>
              <button
                type="button"
                className={`mode-btn ${searchMode === "keyword" ? "active" : ""}`}
                onClick={() => handleModeChange("keyword")}
                title="Exact keyword search across external APIs"
              >
                Keyword
              </button>
              <button
                type="button"
                className={`mode-btn ${searchMode === "semantic" ? "active" : ""}`}
                onClick={() => handleModeChange("semantic")}
                title="Semantic search using Sentence Transformers & FAISS cosine similarity"
              >
                <Sparkles size={12} className="sparkle-icon" />
                Semantic
              </button>
            </div>
          </div>

          <div className="mode-info-tag">
            {searchMode === "semantic" && (
              <span className="semantic-pill-notice">
                <Sparkles size={12} /> Neural embeddings match conceptual meaning even when exact words differ
              </span>
            )}
            {searchMode === "all" && (
              <span className="hybrid-pill-notice">
                Unified multi-source literature ranked with semantic vector similarity
              </span>
            )}
          </div>
        </div>

        {/* PROVIDER HEALTH & STATUS PANEL */}
        {data && (
          <div className="provider-status-bar">
            <div className="provider-status-label">
              <Sparkles size={14} className="accent-icon" />
              <span>Research Source Provenance:</span>
            </div>

            <div className="provider-chips">
              <div className="provider-chip">
                <span className="provider-name">OpenAlex</span>
                {getStatusBadge(sourceStatus["OpenAlex"])}
              </div>

              <div className="provider-chip">
                <span className="provider-name">Crossref</span>
                {getStatusBadge(sourceStatus["Crossref"])}
              </div>

              <div className="provider-chip">
                <span className="provider-name">Semantic Scholar</span>
                {getStatusBadge(sourceStatus["Semantic Scholar"])}
              </div>

              <div className="provider-chip">
                <span className="provider-name">Vector Index (FAISS)</span>
                <span className="source-health-badge health-live">
                  <span className="health-dot dot-live" /> ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PARTIAL FAILURE NOTICE (IF ANY PROVIDER FAILED) */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="partial-error-alert" role="alert">
            <AlertTriangle size={16} className="alert-icon" />
            <div className="alert-text">
              <strong>Partial Provider Notice:</strong>{" "}
              {Object.entries(errors)
                .map(([provider, msg]) => `${provider} temporarily unavailable`)
                .join(" · ")}
              . Showing available results without disruption.
            </div>
          </div>
        )}

        {/* TABS BAR */}
        <div className="search-tabs-container">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`search-tab-btn ${isActive ? "active-tab" : ""}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span className={`tab-count ${isActive ? "active-count" : ""}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="search-results-content">
        {loading && (
          <div className="search-loading-state">
            <LoadingSkeleton count={4} />
          </div>
        )}

        {error && !loading && (
          <ErrorState
            title="Search Execution Error"
            message={error}
            onRetry={fetchSearchResults}
          />
        )}

        {!loading && !error && (!data || counts.total === 0) && (
          <EmptyState
            title={`No results found for "${query}"`}
            description="Try searching with conceptual or technical phrases such as 'AI methods for detecting attacks in IoT networks' or 'Quantum error correction'."
          />
        )}

        {!loading && !error && data && counts.total > 0 && (
          <div className="results-list-wrap">
            {/* 1. RESEARCH SECTION */}
            {(activeTab === "all" || activeTab === "research") &&
              data.research &&
              data.research.length > 0 && (
                <div className="category-block">
                  {activeTab === "all" && (
                    <div className="category-block-title">
                      <BookOpen size={18} />
                      <h3>
                        {searchMode === "semantic"
                          ? `Semantically Matched Research (${data.research.length})`
                          : `Unified Research Publications (${data.research.length})`}
                      </h3>
                    </div>
                  )}

                  <div className="results-grid">
                    {data.research.map((item, idx) => {
                      const itemKey = item.id || item.doi || idx;
                      const isExpanded = expandedAbstracts[itemKey];
                      const isRelatedOpen = expandedRelated[itemKey];
                      const relatedList = relatedData[itemKey] || [];
                      const isRelatedLoading = loadingRelated[itemKey];

                      return (
                        <div key={itemKey} className="result-card research-card">
                          <div className="card-top-row">
                            <div className="source-provenance-tags">
                              {/* Semantic Similarity Tag (if computed) */}
                              {item.similarity !== undefined && item.similarity !== null && (
                                <span
                                  className="semantic-similarity-badge"
                                  title="Inner-product cosine similarity from all-MiniLM-L6-v2 vector embeddings"
                                >
                                  <Sparkles size={11} />
                                  Semantic similarity {Math.round(item.similarity * 100)}%
                                </span>
                              )}

                              {item.sources && item.sources.length > 0 ? (
                                item.sources.map((src) => (
                                  <span key={src} className="provenance-badge">
                                    <CheckCircle2 size={11} />
                                    {src}
                                  </span>
                                ))
                              ) : (
                                <span className="provenance-badge">
                                  <CheckCircle2 size={11} /> Unified
                                </span>
                              )}
                            </div>

                            <div className="card-meta-right">
                              {item.year && <span className="year-badge">{item.year}</span>}
                              <span className="citation-badge">
                                {item.citation_count || item.cited_by_count || 0} citations
                              </span>
                            </div>
                          </div>

                          <h4 className="result-title">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="title-link"
                              >
                                {item.title}
                                <ArrowUpRight size={14} className="ext-icon" />
                              </a>
                            ) : (
                              item.title
                            )}
                          </h4>

                          {/* Authors & Institutions */}
                          <div className="result-byline">
                            {item.authors && item.authors.length > 0 && (
                              <span className="authors-text">
                                {item.authors.slice(0, 4).join(", ")}
                                {item.authors.length > 4 ? ` +${item.authors.length - 4} more` : ""}
                              </span>
                            )}
                            {item.venue && (
                              <span className="venue-text">· Published in {item.venue}</span>
                            )}
                            {item.doi && <span className="doi-text">· DOI: {item.doi}</span>}
                          </div>

                          {/* Abstract */}
                          {item.abstract && (
                            <div className="abstract-container">
                              <p className={`abstract-text ${isExpanded ? "expanded" : "clamped"}`}>
                                {item.abstract}
                              </p>
                              <button
                                type="button"
                                className="abstract-toggle-btn"
                                onClick={() => toggleAbstract(itemKey)}
                              >
                                {isExpanded ? (
                                  <>
                                    Show less <ChevronUp size={12} />
                                  </>
                                ) : (
                                  <>
                                    Read abstract <ChevronDown size={12} />
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Topics / Concepts */}
                          {item.topics && item.topics.length > 0 && (
                            <div className="topics-row">
                              {item.topics.slice(0, 5).map((t, ti) => (
                                <span key={ti} className="topic-pill">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Source URLs & Related Research Button */}
                          <div className="card-actions-row">
                            <button
                              type="button"
                              className={`related-action-btn ${isRelatedOpen ? "active" : ""}`}
                              onClick={() => handleToggleRelated(itemKey, item)}
                              title="Discover conceptually similar research publications"
                            >
                              <Sparkles size={13} />
                              <span>{isRelatedOpen ? "Hide Related Research" : "Related Research"}</span>
                            </button>

                            <div className="source-links-group">
                              {item.source_urls &&
                                Object.entries(item.source_urls).map(([provider, link]) => (
                                  <a
                                    key={provider}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="provider-link-btn"
                                  >
                                    View on {provider}
                                    <ExternalLink size={11} />
                                  </a>
                                ))}

                              {!item.source_urls && item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="provider-link-btn"
                                >
                                  View Source
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* EXPANDED RELATED RESEARCH DRAWER */}
                          {isRelatedOpen && (
                            <div className="related-research-tray">
                              <div className="related-tray-header">
                                <div className="tray-title-wrap">
                                  <Sparkles size={14} className="accent-icon" />
                                  <span className="tray-title">
                                    Conceptually Related Research (via Vector Similarity)
                                  </span>
                                </div>
                                <span className="tray-subtitle">
                                  Nearest neighbours in 384-dimensional semantic embedding space
                                </span>
                              </div>

                              {isRelatedLoading && (
                                <div className="related-loading">
                                  <Loader2 size={16} className="spin" />
                                  <span>Searching semantic vector space...</span>
                                </div>
                              )}

                              {!isRelatedLoading && relatedList.length === 0 && (
                                <div className="related-empty">
                                  <span>No related publications discovered for this work yet.</span>
                                </div>
                              )}

                              {!isRelatedLoading && relatedList.length > 0 && (
                                <div className="related-items-list">
                                  {relatedList.map((rel, ri) => (
                                    <div key={rel.id || ri} className="related-item-card">
                                      <div className="related-item-top">
                                        <span className="related-similarity-badge">
                                          {Math.round((rel.similarity || 0.8) * 100)}% match
                                        </span>
                                        <span className="related-year">{rel.year || "Recent"}</span>
                                        <span className="related-cites">
                                          {rel.citation_count || rel.cited_by_count || 0} citations
                                        </span>
                                      </div>

                                      <h5 className="related-title">
                                        {rel.url ? (
                                          <a
                                            href={rel.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="related-link"
                                          >
                                            {rel.title}
                                            <ArrowUpRight size={12} />
                                          </a>
                                        ) : (
                                          rel.title
                                        )}
                                      </h5>

                                      {rel.authors && rel.authors.length > 0 && (
                                        <div className="related-authors">
                                          {rel.authors.slice(0, 3).join(", ")}
                                        </div>
                                      )}

                                      <div className="related-footer-links">
                                        {rel.sources &&
                                          rel.sources.map((src) => (
                                            <span key={src} className="related-src-badge">
                                              {src}
                                            </span>
                                          ))}
                                      </div>
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
                </div>
              )}

            {/* 2. PATENTS SECTION */}
            {(activeTab === "all" || activeTab === "patents") &&
              data.patents &&
              data.patents.length > 0 && (
                <div className="category-block">
                  {activeTab === "all" && (
                    <div className="category-block-title">
                      <Shield size={18} />
                      <h3>Patents ({data.patents.length})</h3>
                    </div>
                  )}

                  <div className="results-grid">
                    {data.patents.map((p, idx) => (
                      <div key={p.patent_number || idx} className="result-card">
                        <div className="card-top-row">
                          <span className="patent-num-badge">{p.patent_number}</span>
                          <div className="card-meta-right">
                            {p.grant_year && <span className="year-badge">{p.grant_year}</span>}
                            <span className="provenance-badge">
                              <CheckCircle2 size={11} /> USPTO
                            </span>
                          </div>
                        </div>

                        <h4 className="result-title">
                          <Link to={`/patents?q=${encodeURIComponent(p.patent_number)}`} className="title-link">
                            {p.title}
                          </Link>
                        </h4>

                        <div className="result-byline">
                          {p.assignee && <span>Assignee: <strong>{p.assignee}</strong></span>}
                          {p.technology_field && <span> · Field: {p.technology_field}</span>}
                        </div>

                        {p.abstract && <p className="abstract-text clamped">{p.abstract}</p>}

                        <div className="card-actions-row">
                          <Link
                            to={`/patents?q=${encodeURIComponent(p.patent_number)}`}
                            className="provider-link-btn"
                          >
                            Analyze Patent
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* 3. FUNDING SECTION */}
            {(activeTab === "all" || activeTab === "funding") &&
              data.funding &&
              data.funding.length > 0 && (
                <div className="category-block">
                  {activeTab === "all" && (
                    <div className="category-block-title">
                      <DollarSign size={18} />
                      <h3>Grants & Funding Projects ({data.funding.length})</h3>
                    </div>
                  )}

                  <div className="results-grid">
                    {data.funding.map((f, idx) => (
                      <div key={f.project_id || idx} className="result-card">
                        <div className="card-top-row">
                          <span className="funding-agency-badge">{f.agency || "Federal Grant"}</span>
                          <div className="card-meta-right">
                            {f.fiscal_year && <span className="year-badge">{f.fiscal_year}</span>}
                            {f.total_cost && (
                              <span className="citation-badge">
                                ${Number(f.total_cost).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="result-title">
                          <Link to={`/funding?q=${encodeURIComponent(f.title)}`} className="title-link">
                            {f.title}
                          </Link>
                        </h4>

                        <div className="result-byline">
                          {f.organization && <span>Recipient: {f.organization}</span>}
                          {f.pi_name && <span> · PI: {f.pi_name}</span>}
                        </div>

                        {f.abstract && <p className="abstract-text clamped">{f.abstract}</p>}

                        <div className="card-actions-row">
                          <Link
                            to={`/funding?q=${encodeURIComponent(f.title)}`}
                            className="provider-link-btn"
                          >
                            View Funding Intelligence
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* 4. TECHNOLOGIES SECTION */}
            {(activeTab === "all" || activeTab === "technology") &&
              data.technologies &&
              data.technologies.length > 0 && (
                <div className="category-block">
                  {activeTab === "all" && (
                    <div className="category-block-title">
                      <Cpu size={18} />
                      <h3>Technology Classification Areas ({data.technologies.length})</h3>
                    </div>
                  )}

                  <div className="results-grid">
                    {data.technologies.map((t, idx) => (
                      <div key={t.name || idx} className="result-card">
                        <div className="card-top-row">
                          <span className="topic-pill">{t.sector || "Emerging"}</span>
                          <span className="citation-badge">{t.patent_count} patents</span>
                        </div>

                        <h4 className="result-title">
                          <Link to={`/technology/${encodeURIComponent(t.name)}`} className="title-link">
                            {t.name}
                          </Link>
                        </h4>

                        {t.samples && t.samples.length > 0 && (
                          <div className="sample-titles">
                            <span className="sample-label">Key inventions:</span>
                            <ul>
                              {t.samples.map((s, si) => (
                                <li key={si}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="card-actions-row">
                          <Link to={`/technology/${encodeURIComponent(t.name)}`} className="provider-link-btn">
                            Explore Technology Domain
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* 5. ORGANIZATIONS SECTION */}
            {(activeTab === "all" || activeTab === "organizations") &&
              data.organizations &&
              data.organizations.length > 0 && (
                <div className="category-block">
                  {activeTab === "all" && (
                    <div className="category-block-title">
                      <Building2 size={18} />
                      <h3>Organizations ({data.organizations.length})</h3>
                    </div>
                  )}

                  <div className="results-grid">
                    {data.organizations.map((org, idx) => (
                      <div key={org.name || idx} className="result-card">
                        <div className="card-top-row">
                          <span className="topic-pill">{org.type || "Institution"}</span>
                          <span className="citation-badge">{org.patent_count} patents indexed</span>
                        </div>

                        <h4 className="result-title">{org.name}</h4>

                        {org.sectors && org.sectors.length > 0 && (
                          <div className="topics-row">
                            {org.sectors.map((sec, si) => (
                              <span key={si} className="topic-pill">
                                {sec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* 6. RESEARCHERS SECTION */}
            {(activeTab === "all" || activeTab === "researchers") &&
              data.researchers &&
              data.researchers.length > 0 && (
                <div className="category-block">
                  {activeTab === "all" && (
                    <div className="category-block-title">
                      <Users size={18} />
                      <h3>Researchers & Inventors ({data.researchers.length})</h3>
                    </div>
                  )}

                  <div className="results-grid">
                    {data.researchers.map((res, idx) => (
                      <div key={res.name || idx} className="result-card">
                        <div className="card-top-row">
                          <span className="provenance-badge">{res.source || "Platform"}</span>
                          {res.patents_count && (
                            <span className="citation-badge">{res.patents_count} patents</span>
                          )}
                        </div>

                        <h4 className="result-title">{res.name}</h4>

                        <div className="result-byline">
                          {res.affiliation && <span>{res.affiliation}</span>}
                          {res.department && <span> · {res.department}</span>}
                        </div>

                        {res.interests && res.interests.length > 0 && (
                          <div className="topics-row">
                            {res.interests.map((it, ii) => (
                              <span key={ii} className="topic-pill">
                                {it}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <style>{`
        .search-page-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          max-width: 1380px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          color: var(--color-text);
        }

        .header-meta-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .search-mode-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 14px;
          padding: 8px 14px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 9px;
        }

        .mode-toggle-cluster {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mode-label-prefix {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .mode-btn-group {
          display: flex;
          align-items: center;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          border-radius: 7px;
          padding: 2px;
        }

        .mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 12px;
          border-radius: 5px;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mode-btn:hover {
          color: var(--color-text);
        }

        .mode-btn.active {
          background-color: var(--color-surface);
          color: var(--color-primary);
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .sparkle-icon {
          color: var(--color-primary);
        }

        .semantic-pill-notice,
        .hybrid-pill-notice {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-primary);
          background-color: rgba(76, 141, 255, 0.08);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(76, 141, 255, 0.2);
        }

        .search-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-text);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.18s ease;
          flex-shrink: 0;
        }

        .search-refresh-btn:hover {
          background-color: var(--color-surface-elevated);
        }

        .search-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .provider-status-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          padding: 12px 16px;
          margin-top: 12px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 10px;
        }

        .provider-status-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-text);
        }

        .accent-icon {
          color: var(--color-primary);
        }

        .provider-chips {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .provider-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          border-radius: 6px;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          font-size: 12px;
        }

        .provider-name {
          font-weight: 500;
          color: var(--color-text);
        }

        .source-health-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .health-live {
          background-color: rgba(16, 185, 129, 0.15);
          color: var(--color-success);
        }

        .health-cached {
          background-color: rgba(245, 158, 11, 0.15);
          color: var(--color-warning);
        }

        .health-unavailable {
          background-color: rgba(239, 68, 68, 0.15);
          color: var(--color-danger);
        }

        .health-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot-live { background-color: var(--color-success); }
        .dot-cached { background-color: var(--color-warning); }
        .dot-unavailable { background-color: var(--color-danger); }

        .partial-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          background-color: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: var(--color-warning);
          font-size: 12.5px;
        }

        .alert-icon { flex-shrink: 0; }

        .search-tabs-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--color-border);
        }

        .search-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px 8px 0 0;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.18s ease, background 0.18s ease;
          border-bottom: 2px solid transparent;
        }

        .search-tab-btn:hover {
          color: var(--color-text);
          background-color: var(--color-surface);
        }

        .active-tab {
          color: var(--color-primary) !important;
          font-weight: 600;
          border-bottom: 2px solid var(--color-primary);
          background-color: var(--color-surface);
        }

        .tab-count {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 12px;
          background-color: var(--color-surface-elevated);
          color: var(--color-text-muted);
        }

        .active-count {
          background-color: rgba(76, 141, 255, 0.15);
          color: var(--color-primary);
        }

        .results-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .category-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .category-block-title {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--color-text);
        }

        .category-block-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .result-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 20px;
          border-radius: 10px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .result-card:hover {
          border-color: rgba(76, 141, 255, 0.4);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }

        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .source-provenance-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .semantic-similarity-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 6px;
          background-color: rgba(16, 185, 129, 0.12);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .provenance-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 5px;
          background-color: rgba(76, 141, 255, 0.12);
          color: var(--color-primary);
        }

        .card-meta-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .year-badge {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-muted);
          background-color: var(--color-surface-elevated);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .citation-badge {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-primary);
          background-color: rgba(76, 141, 255, 0.08);
          border: 1px solid rgba(76, 141, 255, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .patent-num-badge {
          font-size: 12px;
          font-weight: 700;
          font-family: monospace;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          padding: 3px 8px;
          border-radius: 5px;
        }

        .funding-agency-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background-color: rgba(16, 185, 129, 0.12);
          color: var(--color-success);
          padding: 3px 8px;
          border-radius: 5px;
        }

        .result-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.35;
        }

        .title-link {
          color: var(--color-text);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: color 0.18s ease;
        }

        .title-link:hover {
          color: var(--color-primary);
        }

        .ext-icon {
          opacity: 0.6;
        }

        .result-byline {
          font-size: 12.5px;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .authors-text {
          color: var(--color-text);
          font-weight: 500;
        }

        .abstract-container {
          margin-top: 4px;
          background-color: var(--color-surface-elevated);
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        .abstract-text {
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--color-text-muted);
          margin: 0;
        }

        .abstract-text.clamped {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .abstract-toggle-btn {
          margin-top: 6px;
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 0;
        }

        .topics-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 2px;
        }

        .topic-pill {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-text-muted);
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          padding: 2px 7px;
          border-radius: 4px;
        }

        .card-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
          padding-top: 8px;
          border-top: 1px solid var(--color-border);
        }

        .related-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 6px;
          background-color: rgba(76, 141, 255, 0.1);
          border: 1px solid rgba(76, 141, 255, 0.25);
          color: var(--color-primary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .related-action-btn:hover,
        .related-action-btn.active {
          background-color: rgba(76, 141, 255, 0.18);
          border-color: var(--color-primary);
        }

        .source-links-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .provider-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          color: var(--color-primary);
          text-decoration: none;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .provider-link-btn:hover {
          background-color: rgba(47, 111, 237, 0.12);
          border-color: var(--color-primary);
        }

        /* RELATED RESEARCH TRAY */
        .related-research-tray {
          margin-top: 12px;
          padding: 16px;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          border-radius: 9px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeIn 0.25s ease;
        }

        .related-tray-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tray-title-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .tray-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-text);
        }

        .tray-subtitle {
          font-size: 11.5px;
          color: var(--color-text-muted);
        }

        .related-loading,
        .related-empty {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-text-muted);
          padding: 8px 0;
        }

        .related-items-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .related-item-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          transition: border-color 0.15s ease;
        }

        .related-item-card:hover {
          border-color: var(--color-primary);
        }

        .related-item-top {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .related-similarity-badge {
          background-color: rgba(16, 185, 129, 0.15);
          color: var(--color-success);
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .related-year,
        .related-cites {
          color: var(--color-text-muted);
        }

        .related-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.35;
        }

        .related-link {
          color: var(--color-text);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .related-link:hover {
          color: var(--color-primary);
        }

        .related-authors {
          font-size: 11.5px;
          color: var(--color-text-muted);
        }

        .related-footer-links {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .related-src-badge {
          font-size: 9.5px;
          padding: 1px 5px;
          border-radius: 3px;
          background-color: rgba(76, 141, 255, 0.1);
          color: var(--color-primary);
        }

        .sample-titles {
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .sample-titles ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .search-page-container {
            padding: 16px;
          }

          .search-mode-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .provider-status-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .related-items-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
