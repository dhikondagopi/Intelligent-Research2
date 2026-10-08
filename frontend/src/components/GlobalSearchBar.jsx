import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, Loader2, BookOpen, Shield, Cpu, Building2, User, ArrowRight } from "lucide-react";
import { globalSearch } from "../services/searchService";

export default function GlobalSearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize input query if user is on /search?q=...
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      const q = params.get("q");
      if (q && q !== query) {
        setQuery(q);
      }
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

  // Fetch quick suggestions with debounce (only using real data)
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
        const data = await globalSearch(val.trim(), "all", 1, 4);
        setSuggestions(data);
      } catch (err) {
        console.error("Suggestion fetch failed", err);
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const executeSearch = (targetQuery) => {
    const q = (targetQuery || query).trim();
    if (!q) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
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
      <div className="global-search-input-wrap">
        <Search size={16} className="search-icon-left" />
        <input
          type="text"
          className="global-search-input"
          placeholder="Search research, patents, technologies, organizations, grants..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2 && suggestions) setIsOpen(true);
          }}
          aria-label="Search research, patents, technologies, organizations, grants"
        />

        {loading && <Loader2 size={15} className="search-spinner" />}

        {query && !loading && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search input"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* SUGGESTIONS DROPDOWN */}
      {isOpen && query.trim().length >= 2 && (
        <div className="search-dropdown-menu" role="listbox">
          {loading && !suggestions && (
            <div className="search-dropdown-loading">
              <Loader2 size={16} className="search-spinner" />
              <span>Searching cross-domain intelligence...</span>
            </div>
          )}

          {!loading && suggestions && !hasSuggestions && (
            <div className="search-dropdown-empty">
              <span>No direct matches found for "{query}". Press Enter for deep multi-source search.</span>
            </div>
          )}

          {hasSuggestions && (
            <div className="search-dropdown-content">
              {/* Research preview */}
              {suggestions.research && suggestions.research.length > 0 && (
                <div className="dropdown-group">
                  <div className="dropdown-group-header">
                    <BookOpen size={13} />
                    <span>Research Publications</span>
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
                    <Shield size={13} />
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
                    <Cpu size={13} />
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
                <span>View all results for "{query}"</span>
                <ArrowRight size={14} />
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .global-search-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          min-width: 220px;
          font-family: inherit;
        }

        .global-search-input-wrap {
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
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
          left: 12px;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .global-search-input {
          width: 100%;
          height: 100%;
          padding: 0 34px 0 38px;
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
          font-size: 12.5px;
        }

        .search-spinner {
          position: absolute;
          right: 12px;
          color: var(--color-primary);
          animation: spin 0.9s linear infinite;
        }

        .search-clear-btn {
          position: absolute;
          right: 10px;
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
          gap: 10px;
          padding: 14px 16px;
          font-size: 12.5px;
          color: var(--color-text-muted);
        }

        .dropdown-group {
          border-bottom: 1px solid var(--color-border);
          padding: 6px 0;
        }

        .dropdown-group-header {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px 4px 14px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }

        .dropdown-item {
          padding: 8px 14px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .dropdown-item:hover {
          background-color: var(--color-surface-elevated);
        }

        .item-title {
          font-size: 13px;
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
          font-size: 11.5px;
          color: var(--color-text-muted);
        }

        .source-mini-badge {
          display: inline-block;
          font-size: 10.5px;
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
          padding: 11px 16px;
          background-color: var(--color-surface-elevated);
          color: var(--color-primary);
          font-size: 12.5px;
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

        @media (max-width: 768px) {
          .global-search-container {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
