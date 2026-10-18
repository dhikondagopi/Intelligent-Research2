import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  BookOpen,
  Shield,
  Cpu,
  Building2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { globalSearch } from "../services/searchService";

export default function GlobalSearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all"); // 'all' | 'keyword' | 'semantic'
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize input query & mode from URL if user is on /search
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      const q = params.get("q");
      const m = params.get("mode");
      if (q && q !== query) setQuery(q);
      if (m && ["all", "keyword", "semantic"].includes(m)) setMode(m);
    }
  }, [location.search, location.pathname]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch quick suggestions with debounce using real data
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setSuggestions(null);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await globalSearch(val.trim(), "all", 1, 4, mode);
        setSuggestions(data);
      } catch (err) {
        console.error("Suggestion fetch failed", err);
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 320);
  };

  const executeSearch = (targetQuery) => {
    const q = (targetQuery || query).trim();
    if (!q) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}&mode=${mode}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions(null);
    setIsOpen(false);
  };

  const hasSuggestions =
    suggestions &&
    ((suggestions.research && suggestions.research.length > 0) ||
      (suggestions.patents && suggestions.patents.length > 0) ||
      (suggestions.technologies && suggestions.technologies.length > 0) ||
      (suggestions.organizations && suggestions.organizations.length > 0));

  return (
    <div ref={containerRef} className={`global-search-container ${className}`}>
      <div className="global-search-main-row">
        {/* INPUT BOX */}
        <div className="global-search-input-wrap">
          <Search size={15} className="search-icon-left" />
          <input
            type="text"
            className="global-search-input"
            placeholder={
              mode === "semantic"
                ? "Describe meaning, e.g. AI methods for detecting attacks in IoT..."
                : "Search research, patents, technologies, organizations, grants..."
            }
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim().length >= 2 && suggestions) setIsOpen(true);
            }}
            aria-label="Search research, patents, technologies, organizations, grants"
          />

          {loading && <Loader2 size={14} className="search-spinner" />}

          {query && !loading && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              aria-label="Clear search input"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* COMPACT MODE SELECTOR */}
        <div className="search-mode-segmented-control" role="group" aria-label="Search Mode">
          <button
            type="button"
            className={`mode-pill-btn ${mode === "all" ? "active" : ""}`}
            onClick={() => setMode("all")}
            title="Hybrid search: keywords + semantic similarity"
          >
            All
          </button>
          <button
            type="button"
            className={`mode-pill-btn ${mode === "keyword" ? "active" : ""}`}
            onClick={() => setMode("keyword")}
            title="Keyword search across providers"
          >
            Keyword
          </button>
          <button
            type="button"
            className={`mode-pill-btn ${mode === "semantic" ? "active" : ""}`}
            onClick={() => setMode("semantic")}
            title="Semantic vector similarity using Sentence Transformers"
          >
            <Sparkles size={11} className="mode-icon" />
            Semantic
          </button>
        </div>
      </div>

      {/* SUBTLE SEMANTIC HELPER HINT */}
      {mode === "semantic" && (
        <div className="semantic-helper-hint">
          <Sparkles size={11} className="hint-icon" />
          <span>Search by meaning, not exact words.</span>
        </div>
      )}

      {/* SUGGESTIONS DROPDOWN */}
      {isOpen && query.trim().length >= 2 && (
        <div className="search-dropdown-menu" role="listbox">
          {loading && !suggestions && (
            <div className="search-dropdown-loading">
              <Loader2 size={15} className="search-spinner" />
              <span>
                {mode === "semantic"
                  ? "Computing neural embedding & vector similarity..."
                  : "Searching cross-domain intelligence..."}
              </span>
            </div>
          )}

          {!loading && suggestions && !hasSuggestions && (
            <div className="search-dropdown-empty">
              <span>No direct preview for "{query}". Press Enter for deep search.</span>
            </div>
          )}

          {hasSuggestions && (
            <div className="search-dropdown-content">
              {/* Research preview */}
              {suggestions.research && suggestions.research.length > 0 && (
                <div className="dropdown-group">
                  <div className="dropdown-group-header">
                    <BookOpen size={12} />
                    <span>Research Publications</span>
                    {mode === "semantic" && <span className="mode-tag-mini">Semantic</span>}
                  </div>
                  {suggestions.research.slice(0, 3).map((r, i) => (
                    <div
                      key={r.id || i}
                      className="dropdown-item"
                      onClick={() => executeSearch(r.title)}
                    >
                      <div className="item-title">{r.title}</div>
                      <div className="item-sub">
                        <span>{r.year || "Recent"}</span>
                        {r.similarity !== undefined && (
                          <span className="similarity-mini-badge">
                            {Math.round(r.similarity * 100)}% semantic match
                          </span>
                        )}
                        {r.sources && r.sources.length > 0 && (
                          <span className="source-mini-badge">
                            {r.sources.join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Patents preview */}
              {suggestions.patents && suggestions.patents.length > 0 && (
                <div className="dropdown-group">
                  <div className="dropdown-group-header">
                    <Shield size={12} />
                    <span>Patents</span>
                  </div>
                  {suggestions.patents.slice(0, 2).map((p, i) => (
                    <div
                      key={p.patent_number || i}
                      className="dropdown-item"
                      onClick={() => executeSearch(p.title)}
                    >
                      <div className="item-title">{p.title}</div>
                      <div className="item-sub">
                        <span>{p.patent_number}</span>
                        {p.assignee && <span>· {p.assignee}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Technologies preview */}
              {suggestions.technologies && suggestions.technologies.length > 0 && (
                <div className="dropdown-group">
                  <div className="dropdown-group-header">
                    <Cpu size={12} />
                    <span>Technology Areas</span>
                  </div>
                  {suggestions.technologies.slice(0, 2).map((t, i) => (
                    <div
                      key={t.name || i}
                      className="dropdown-item"
                      onClick={() => executeSearch(t.name)}
                    >
                      <div className="item-title">{t.name}</div>
                      <div className="item-sub">
                        <span>{t.patent_count} patents indexed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View all results button */}
              <div
                className="dropdown-footer"
                onClick={() => executeSearch()}
              >
                <span>View all {mode === "semantic" ? "semantic" : ""} results for "{query}"</span>
                <ArrowRight size={13} />
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .global-search-container {
          position: relative;
          width: 100%;
          max-width: 580px;
          min-width: 220px;
          font-family: inherit;
        }

        .global-search-main-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .global-search-input-wrap {
          display: flex;
          align-items: center;
          position: relative;
          flex: 1;
          height: 38px;
          border-radius: 9px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .global-search-input-wrap:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.15);
        }

        .search-icon-left {
          position: absolute;
          left: 11px;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .global-search-input {
          width: 100%;
          height: 100%;
          padding: 0 32px 0 34px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text);
          font-size: 13px;
          font-family: inherit;
        }

        .global-search-input::placeholder {
          color: var(--color-text-muted);
          opacity: 0.8;
          font-size: 12px;
        }

        .search-spinner {
          position: absolute;
          right: 11px;
          color: var(--color-primary);
          animation: spin 0.9s linear infinite;
        }

        .search-clear-btn {
          position: absolute;
          right: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .search-clear-btn:hover {
          background-color: var(--color-border);
          color: var(--color-text);
        }

        .search-mode-segmented-control {
          display: flex;
          align-items: center;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 2px;
          flex-shrink: 0;
          height: 38px;
          box-sizing: border-box;
        }

        .mode-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 32px;
          padding: 0 9px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }

        .mode-pill-btn:hover {
          color: var(--color-text);
        }

        .mode-pill-btn.active {
          background-color: var(--color-surface-elevated);
          color: var(--color-primary);
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .mode-icon {
          color: var(--color-primary);
        }

        .semantic-helper-hint {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 4px;
          font-size: 11px;
          color: var(--color-text-muted);
          padding-left: 2px;
          animation: fadeIn 0.2s ease;
        }

        .hint-icon {
          color: var(--color-primary);
        }

        .search-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          z-index: 1000;
          max-height: 420px;
          overflow-y: auto;
          backdrop-filter: blur(16px);
        }

        .search-dropdown-loading,
        .search-dropdown-empty {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 14px;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .dropdown-group {
          border-bottom: 1px solid var(--color-border);
          padding: 5px 0;
        }

        .dropdown-group-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px 4px 14px;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }

        .mode-tag-mini {
          font-size: 9.5px;
          margin-left: auto;
          background: rgba(76, 141, 255, 0.15);
          color: var(--color-primary);
          padding: 1px 5px;
          border-radius: 3px;
        }

        .dropdown-item {
          padding: 7px 14px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .dropdown-item:hover {
          background-color: var(--color-surface-elevated);
        }

        .item-title {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-sub {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 3px;
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .similarity-mini-badge {
          display: inline-block;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 4px;
          background-color: rgba(16, 185, 129, 0.12);
          color: var(--color-success);
          font-weight: 600;
        }

        .source-mini-badge {
          display: inline-block;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 4px;
          background-color: rgba(76, 141, 255, 0.12);
          color: var(--color-primary);
          font-weight: 500;
        }

        .dropdown-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background-color: var(--color-surface-elevated);
          color: var(--color-primary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .dropdown-footer:hover {
          background-color: rgba(47, 111, 237, 0.12);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .search-mode-segmented-control {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
