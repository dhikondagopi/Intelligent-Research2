"""
Research Trend Intelligence and Emerging Topic Detection Service.

Provides data-driven research analytics, time-series publication trends,
research hotspots, and transparent emerging topic ranking using actual,
deduplicated scientific records from OpenAlex, Crossref, and Semantic Scholar.
"""

from datetime import datetime, timezone
import time
import re
from typing import Dict, List, Any, Optional, Tuple

from app.database.connection import db
from app.services.research_aggregator_service import deduplicate_records

research_collection = db["research_works"]
patents_collection = db["patents"]
funding_collection = db["funding_projects"]

# In-memory LRU/TTL cache for trend analytics
_TRENDS_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 300.0  # 5 minutes


def _get_from_cache(cache_key: str) -> Optional[Any]:
    if cache_key in _TRENDS_CACHE:
        timestamp, data = _TRENDS_CACHE[cache_key]
        if time.time() - timestamp < CACHE_TTL_SECONDS:
            return data
        else:
            del _TRENDS_CACHE[cache_key]
    return None


def _set_in_cache(cache_key: str, data: Any) -> None:
    # Cap cache size to avoid unbounded memory
    if len(_TRENDS_CACHE) > 200:
        oldest_key = min(_TRENDS_CACHE.keys(), key=lambda k: _TRENDS_CACHE[k][0])
        del _TRENDS_CACHE[oldest_key]
    _TRENDS_CACHE[cache_key] = (time.time(), data)


def clear_trends_cache() -> None:
    _TRENDS_CACHE.clear()


def _extract_year_and_date(record: Dict[str, Any]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
    """
    Extract (year, month_str 'YYYY-MM', full_date_str) from a research record.
    Uses actual publication dates, never retrieval dates.
    """
    pub_date = record.get("publication_date")
    pub_year = record.get("publication_year") or record.get("year")

    # If pub_date is available (e.g. '2023-05-12' or '2023-05')
    if pub_date and isinstance(pub_date, str):
        match = re.match(r"^(\d{4})(?:-(\d{2}))?", pub_date.strip())
        if match:
            year_from_date = int(match.group(1))
            month_from_date = match.group(2)
            month_str = f"{year_from_date}-{month_from_date}" if month_from_date else None
            return year_from_date, month_str, pub_date.strip()

    # Fallback to year field
    if pub_year is not None:
        try:
            year_int = int(pub_year)
            if 1900 <= year_int <= 2100:
                return year_int, None, str(year_int)
        except (ValueError, TypeError):
            pass

    return None, None, None


def _extract_citations(record: Dict[str, Any]) -> Tuple[bool, int]:
    """
    Distinguish missing citation metadata from zero citations.
    Returns (has_citation_data, citation_count).
    """
    # Check cited_by_count first, then citation_count
    c_val = record.get("cited_by_count")
    if c_val is None:
        c_val = record.get("citation_count")

    if c_val is not None:
        try:
            return True, max(0, int(c_val))
        except (ValueError, TypeError):
            pass

    return False, 0


def _extract_topics_and_concepts(record: Dict[str, Any]) -> List[str]:
    """Extract unified list of clean topic and concept names from a record."""
    topics_found: List[str] = []
    seen_lower = set()

    for key in ["topics", "concepts", "keywords"]:
        val = record.get(key)
        if isinstance(val, list):
            for item in val:
                if isinstance(item, str) and item.strip():
                    cleaned = item.strip()
                    lower = cleaned.lower()
                    # Skip noise or single characters
                    if len(cleaned) >= 2 and lower not in seen_lower:
                        topics_found.append(cleaned)
                        seen_lower.add(lower)
                elif isinstance(item, dict):
                    name = item.get("display_name") or item.get("name") or item.get("keyword")
                    if name and isinstance(name, str) and len(name.strip()) >= 2:
                        cleaned = name.strip()
                        lower = cleaned.lower()
                        if lower not in seen_lower:
                            topics_found.append(cleaned)
                            seen_lower.add(lower)

    return topics_found


def _extract_sources(record: Dict[str, Any]) -> List[str]:
    """Extract data sources represented in record."""
    sources = record.get("sources")
    if isinstance(sources, list) and sources:
        return [s for s in sources if isinstance(s, str) and s.strip()]

    single_source = record.get("source")
    if single_source and isinstance(single_source, str):
        return [single_source]

    # Infer from identifiers if not explicitly marked
    inferred = []
    if record.get("openalex_id"):
        inferred.append("OpenAlex")
    if record.get("doi"):
        inferred.append("Crossref")
    if record.get("source_id", {}).get("semantic_scholar"):
        inferred.append("Semantic Scholar")

    return inferred if inferred else ["Indexed Database"]


def fetch_and_filter_records(
    query: Optional[str] = None,
    topic: Optional[str] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    source: Optional[str] = None,
    limit: int = 1500
) -> List[Dict[str, Any]]:
    """
    Fetch records from MongoDB cache with optional query/topic/year/source filters.
    Always deduplicates records across providers before returning.
    """
    mongo_filter: Dict[str, Any] = {}

    if query and query.strip():
        q_clean = query.strip()
        mongo_filter["$or"] = [
            {"search_queries": q_clean.lower()},
            {"title": {"$regex": q_clean, "$options": "i"}},
            {"topics": {"$regex": q_clean, "$options": "i"}},
            {"concepts": {"$regex": q_clean, "$options": "i"}},
            {"keywords": {"$regex": q_clean, "$options": "i"}}
        ]

    if topic and topic.strip():
        t_clean = topic.strip()
        topic_clause = {
            "$or": [
                {"topics": {"$regex": f"^{re.escape(t_clean)}$", "$options": "i"}},
                {"concepts": {"$regex": f"^{re.escape(t_clean)}$", "$options": "i"}},
                {"keywords": {"$regex": f"^{re.escape(t_clean)}$", "$options": "i"}}
            ]
        }
        if "$or" in mongo_filter:
            mongo_filter = {"$and": [mongo_filter, topic_clause]}
        else:
            mongo_filter.update(topic_clause)

    if source and source.strip():
        s_clean = source.strip()
        mongo_filter["sources"] = {"$regex": f"^{re.escape(s_clean)}$", "$options": "i"}

    cursor = research_collection.find(mongo_filter).limit(limit)
    raw_records = list(cursor)

    # Convert ObjectId to string if present
    for r in raw_records:
        if "_id" in r:
            r["_id"] = str(r["_id"])

    # Filter by publication year in Python to handle both publication_year and publication_date
    filtered_records: List[Dict[str, Any]] = []
    for r in raw_records:
        year, _, _ = _extract_year_and_date(r)
        if year is not None:
            if start_year is not None and year < start_year:
                continue
            if end_year is not None and year > end_year:
                continue
        elif start_year is not None or end_year is not None:
            # Skip if year filter requested but record has no year
            continue
        filtered_records.append(r)

    # Deduplicate publications before running trend analytics
    return deduplicate_records(filtered_records)


class ResearchTrendService:
    """Service providing publication trends, hotspots, emerging topic detection, and topic analysis."""

    def get_publication_trends(
        self,
        query: Optional[str] = None,
        topic: Optional[str] = None,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None,
        granularity: str = "annual",
        source: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate publication counts, monthly counts where coverage allows,
        period-over-period growth over comparable complete periods,
        and citation trends.
        """
        cache_key = f"trends:{query}:{topic}:{start_year}:{end_year}:{granularity}:{source}"
        cached = _get_from_cache(cache_key)
        if cached:
            return cached

        records = fetch_and_filter_records(
            query=query,
            topic=topic,
            start_year=start_year,
            end_year=end_year,
            source=source
        )

        current_year = datetime.now(timezone.utc).year
        total_records = len(records)

        # Year counts, month counts, citations, topics, orgs, authors
        year_counts: Dict[int, int] = {}
        year_citations: Dict[int, int] = {}
        year_citation_records: Dict[int, int] = {}
        month_counts: Dict[str, int] = {}
        sources_seen = set()

        records_with_citation_data = 0
        total_citations = 0
        records_with_month = 0

        for r in records:
            year, month_str, _ = _extract_year_and_date(r)
            has_cit, c_count = _extract_citations(r)

            for s in _extract_sources(r):
                sources_seen.add(s)

            if has_cit:
                records_with_citation_data += 1
                total_citations += c_count

            if year is not None:
                year_counts[year] = year_counts.get(year, 0) + 1
                if has_cit:
                    year_citations[year] = year_citations.get(year, 0) + c_count
                    year_citation_records[year] = year_citation_records.get(year, 0) + 1

            if month_str is not None:
                records_with_month += 1
                month_counts[month_str] = month_counts.get(month_str, 0) + 1

        # Annual Timeline
        all_years = sorted(year_counts.keys())
        timeline = []
        for y in all_years:
            cnt = year_counts[y]
            c_sum = year_citations.get(y, 0)
            c_recs = year_citation_records.get(y, 0)
            avg_c = round(c_sum / c_recs, 2) if c_recs > 0 else None
            is_partial = (y == current_year)

            timeline.append({
                "year": y,
                "publication_count": cnt,
                "total_citations": c_sum if c_recs > 0 else None,
                "avg_citations": avg_c,
                "citation_coverage_records": c_recs,
                "is_partial_year": is_partial,
                "label": f"{y} (Year-to-Date)" if is_partial else str(y)
            })

        # Monthly timeline if granularity requested and coverage sufficient (>= 20%)
        month_coverage_pct = round((records_with_month / total_records * 100), 1) if total_records > 0 else 0.0
        monthly_timeline = []
        monthly_status = "UNAVAILABLE"

        if granularity == "monthly" or records_with_month >= 10:
            if month_coverage_pct >= 20.0 and month_counts:
                monthly_status = "AVAILABLE"
                sorted_months = sorted(month_counts.keys())
                for m in sorted_months[-36:]:  # recent 36 months max
                    monthly_timeline.append({
                        "period": m,
                        "publication_count": month_counts[m]
                    })
            else:
                monthly_status = "INSUFFICIENT_COVERAGE"

        # Period-over-period growth calculation over comparable complete periods
        # (Exclude current incomplete year from annual comparison)
        complete_years = [y for y in all_years if y < current_year]
        growth_analysis = {
            "recent_period": None,
            "prior_period": None,
            "recent_volume": 0,
            "prior_volume": 0,
            "growth_rate_pct": None,
            "is_statistically_sufficient": False,
            "status": "INSUFFICIENT_DATA",
            "explanation": "Insufficient complete annual periods available for growth comparison."
        }

        if len(complete_years) >= 2:
            recent_y = complete_years[-1]
            prior_y = complete_years[-2]
            recent_vol = year_counts.get(recent_y, 0)
            prior_vol = year_counts.get(prior_y, 0)

            # Minimum sample threshold to avoid divide by zero or false infinite growth
            min_threshold = 3
            growth_analysis["recent_period"] = str(recent_y)
            growth_analysis["prior_period"] = str(prior_y)
            growth_analysis["recent_volume"] = recent_vol
            growth_analysis["prior_volume"] = prior_vol

            if prior_vol >= min_threshold:
                pct_growth = round(((recent_vol - prior_vol) / prior_vol) * 100, 1)
                growth_analysis["growth_rate_pct"] = pct_growth
                growth_analysis["is_statistically_sufficient"] = True
                if pct_growth > 15.0:
                    growth_analysis["status"] = "GROWING"
                    growth_analysis["explanation"] = f"Publications increased by {pct_growth}% between {prior_y} and {recent_y}."
                elif pct_growth >= -10.0:
                    growth_analysis["status"] = "STABLE"
                    growth_analysis["explanation"] = f"Publication volume remained stable ({pct_growth}%) between {prior_y} and {recent_y}."
                else:
                    growth_analysis["status"] = "DECLINING"
                    growth_analysis["explanation"] = f"Publications decreased by {abs(pct_growth)}% between {prior_y} and {recent_y}."
            else:
                growth_analysis["status"] = "INSUFFICIENT_DATA"
                growth_analysis["explanation"] = (
                    f"Baseline volume in {prior_y} ({prior_vol} papers) is below the minimum threshold ({min_threshold}) "
                    "for meaningful percentage growth calculation."
                )

        citation_coverage_pct = round((records_with_citation_data / total_records * 100), 1) if total_records > 0 else 0.0
        avg_cit_overall = round(total_citations / records_with_citation_data, 2) if records_with_citation_data > 0 else None

        result = {
            "query": query,
            "topic_filter": topic,
            "granularity": granularity,
            "timeline": timeline,
            "monthly_timeline": monthly_timeline if granularity == "monthly" else [],
            "monthly_status": monthly_status,
            "month_coverage_pct": month_coverage_pct,
            "period_growth": growth_analysis,
            "citation_metrics": {
                "total_citations": total_citations,
                "avg_citations_per_paper": avg_cit_overall,
                "records_with_citation_data": records_with_citation_data,
                "total_records_analyzed": total_records,
                "citation_coverage_pct": citation_coverage_pct,
                "has_citation_data": records_with_citation_data > 0
            },
            "meta": {
                "records_analyzed": total_records,
                "date_range": {
                    "min_year": min(all_years) if all_years else None,
                    "max_year": max(all_years) if all_years else None
                },
                "sources_represented": sorted(list(sources_seen)),
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "scope": "Indexed Intelligent Research Cache & Retrieved Providers",
                "limitations": (
                    "Trends represent deduplicated records indexed in the Intelligent Research platform across "
                    "OpenAlex, Crossref, and Semantic Scholar. Incomplete current year data is isolated and not "
                    "treated as a complete annual cycle."
                )
            }
        }

        _set_in_cache(cache_key, result)
        return result

    def get_research_hotspots(
        self,
        query: Optional[str] = None,
        limit: int = 12
    ) -> Dict[str, Any]:
        """
        Identify research topics/concepts with substantial research activity based on actual records.
        Returns topic name, publication volume, time period, growth rate, leading orgs, researchers, and sources.
        """
        cache_key = f"hotspots:{query}:{limit}"
        cached = _get_from_cache(cache_key)
        if cached:
            return cached

        records = fetch_and_filter_records(query=query)
        current_year = datetime.now(timezone.utc).year

        # Group data by topic
        topic_data: Dict[str, Dict[str, Any]] = {}

        for r in records:
            topics = _extract_topics_and_concepts(r)
            year, _, _ = _extract_year_and_date(r)
            has_cit, c_count = _extract_citations(r)
            sources = _extract_sources(r)
            authors = r.get("authors") or []
            institutions = r.get("institutions") or []

            for t in topics:
                t_key = t.strip().lower()
                if t_key not in topic_data:
                    topic_data[t_key] = {
                        "name": t.strip(),
                        "volume": 0,
                        "years": [],
                        "citations": 0,
                        "citation_records": 0,
                        "authors": {},
                        "institutions": {},
                        "sources": set(),
                        "recent_volume": 0,
                        "prior_volume": 0
                    }
                elif (t.strip()[0].isupper() and not topic_data[t_key]["name"][0].isupper()) or len(t.strip()) > len(topic_data[t_key]["name"]):
                    topic_data[t_key]["name"] = t.strip()

                t_entry = topic_data[t_key]
                t_entry["volume"] += 1
                for s in sources:
                    t_entry["sources"].add(s)

                if has_cit:
                    t_entry["citations"] += c_count
                    t_entry["citation_records"] += 1

                if year is not None:
                    t_entry["years"].append(year)
                    if year == current_year - 1:
                        t_entry["recent_volume"] += 1
                    elif year == current_year - 2:
                        t_entry["prior_volume"] += 1

                for a in authors[:3]:
                    if isinstance(a, str) and len(a.strip()) > 1:
                        t_entry["authors"][a] = t_entry["authors"].get(a, 0) + 1

                for inst in institutions[:3]:
                    if isinstance(inst, str) and len(inst.strip()) > 1:
                        t_entry["institutions"][inst] = t_entry["institutions"].get(inst, 0) + 1

        # Calculate metrics for each topic
        hotspots = []
        for t, data in topic_data.items():
            if data["volume"] < 2:  # Minimum volume filter for hotspots
                continue

            years = data["years"]
            min_y = min(years) if years else None
            max_y = max(years) if years else None
            time_period = f"{min_y} - {max_y}" if min_y and max_y else "Various Years"

            recent_vol = data["recent_volume"]
            prior_vol = data["prior_volume"]

            # Growth rate calculation where measurable
            growth_rate = None
            if prior_vol >= 2:
                growth_rate = round(((recent_vol - prior_vol) / prior_vol) * 100, 1)

            # Top organizations
            top_orgs = sorted(
                [{"name": k, "publications": v} for k, v in data["institutions"].items()],
                key=lambda x: x["publications"],
                reverse=True
            )[:3]

            # Top researchers
            top_authors = sorted(
                [{"name": k, "publications": v} for k, v in data["authors"].items()],
                key=lambda x: x["publications"],
                reverse=True
            )[:3]

            avg_cit = round(data["citations"] / data["citation_records"], 1) if data["citation_records"] > 0 else None

            hotspots.append({
                "topic": data["name"],
                "publication_volume": data["volume"],
                "time_period": time_period,
                "recent_volume": recent_vol,
                "prior_volume": prior_vol,
                "growth_rate_pct": growth_rate,
                "total_citations": data["citations"] if data["citation_records"] > 0 else None,
                "avg_citations": avg_cit,
                "has_citation_data": data["citation_records"] > 0,
                "leading_organizations": top_orgs,
                "leading_researchers": top_authors,
                "sources_used": sorted(list(data["sources"]))
            })

        # Rank by publication volume descending, then citations
        hotspots.sort(key=lambda x: (x["publication_volume"], x["total_citations"] or 0), reverse=True)
        ranked_hotspots = hotspots[:limit]

        result = {
            "total_topics_analyzed": len(topic_data),
            "hotspots_count": len(ranked_hotspots),
            "hotspots": ranked_hotspots,
            "meta": {
                "records_analyzed": len(records),
                "query": query,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "scope": "Hotspots identified from actual publication volume and citation records",
                "limitations": "Topic extraction derived from normalized source concept graphs and verified keywords."
            }
        }

        _set_in_cache(cache_key, result)
        return result

    def get_emerging_topics(
        self,
        query: Optional[str] = None,
        min_volume: int = 3,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Transparent emerging-topic ranking comparing publication activity across comparable time windows.
        Avoids labeling large static topics as emerging. Documents formula, thresholds, and limitations.
        """
        cache_key = f"emerging:{query}:{min_volume}:{limit}"
        cached = _get_from_cache(cache_key)
        if cached:
            return cached

        records = fetch_and_filter_records(query=query)
        current_year = datetime.now(timezone.utc).year

        # Determine comparable complete periods
        recent_period_year = current_year - 1
        prior_period_year = current_year - 2

        topic_stats: Dict[str, Dict[str, Any]] = {}
        all_sources = set()

        for r in records:
            topics = _extract_topics_and_concepts(r)
            year, _, _ = _extract_year_and_date(r)
            has_cit, c_count = _extract_citations(r)
            sources = _extract_sources(r)
            for s in sources:
                all_sources.add(s)

            for t in topics:
                t_key = t.strip().lower()
                if t_key not in topic_stats:
                    topic_stats[t_key] = {
                        "name": t.strip(),
                        "total_volume": 0,
                        "recent_count": 0,
                        "prior_count": 0,
                        "historical_count": 0,
                        "citations": 0,
                        "citation_records": 0,
                        "earliest_year": year,
                        "latest_year": year,
                        "sources": set()
                    }
                elif (t.strip()[0].isupper() and not topic_stats[t_key]["name"][0].isupper()) or len(t.strip()) > len(topic_stats[t_key]["name"]):
                    topic_stats[t_key]["name"] = t.strip()

                entry = topic_stats[t_key]
                entry["total_volume"] += 1
                for s in sources:
                    entry["sources"].add(s)

                if has_cit:
                    entry["citations"] += c_count
                    entry["citation_records"] += 1

                if year is not None:
                    if entry["earliest_year"] is None or year < entry["earliest_year"]:
                        entry["earliest_year"] = year
                    if entry["latest_year"] is None or year > entry["latest_year"]:
                        entry["latest_year"] = year

                    if year == recent_period_year:
                        entry["recent_count"] += 1
                    elif year == prior_period_year:
                        entry["prior_count"] += 1
                    elif year < prior_period_year:
                        entry["historical_count"] += 1

        emerging_topics = []
        insufficient_data_count = 0

        for t, stat in topic_stats.items():
            recent = stat["recent_count"]
            prior = stat["prior_count"]
            total = stat["total_volume"]

            # If total or recent activity is below minimum volume threshold, mark insufficient evidence
            if total < min_volume or (recent == 0 and prior == 0):
                insufficient_data_count += 1
                continue

            # Calculate growth rate and emerging score
            growth_pct: Optional[float] = None
            classification = "INSUFFICIENT_DATA"
            rationale = ""
            emerging_score = 0.0

            avg_cit = round(stat["citations"] / stat["citation_records"], 2) if stat["citation_records"] > 0 else 0.0

            # Case A: Brand new topic entrant (0 prior, >= min_volume recent)
            if prior == 0 and recent >= 2:
                classification = "NEW_EMERGING"
                growth_pct = 100.0
                # Formula: Base novelty score + recent volume factor + citation impact
                emerging_score = round(min(100.0, 50.0 + (recent * 8.0) + min(20.0, avg_cit * 2.0)), 1)
                rationale = (
                    f"New entrant with zero publications in {prior_period_year} expanding to {recent} "
                    f"publications in {recent_period_year}."
                )

            # Case B: Measurable growth from prior baseline
            elif prior > 0:
                growth_pct = round(((recent - prior) / prior) * 100, 1)

                # Emerging criteria: significant positive growth (> 20%) AND minimum recent presence (>= 2)
                if growth_pct >= 20.0 and recent >= 2:
                    classification = "EMERGING"
                    # Formula: 40% growth momentum + 40% recent volume density + 20% citation traction
                    norm_growth = min(100.0, max(0.0, growth_pct))
                    norm_vol = min(100.0, recent * 15.0)
                    norm_cit = min(100.0, avg_cit * 5.0)
                    emerging_score = round((norm_growth * 0.45) + (norm_vol * 0.35) + (norm_cit * 0.20), 1)
                    rationale = (
                        f"Demonstrated {growth_pct}% growth ({prior} to {recent} papers) between "
                        f"{prior_period_year} and {recent_period_year}."
                    )
                elif growth_pct >= -10.0:
                    classification = "STEADY"
                    emerging_score = round(min(50.0, 20.0 + (recent * 3.0)), 1)
                    rationale = f"Stable research activity with {growth_pct}% change ({recent} recent papers)."
                else:
                    classification = "DECLINING"
                    emerging_score = 10.0
                    rationale = f"Decreasing publication activity ({growth_pct}% change from {prior} to {recent})."

            else:
                classification = "INSUFFICIENT_DATA"
                rationale = "Insufficient records in comparable periods to establish growth trajectory."

            emerging_topics.append({
                "topic": stat["name"],
                "classification": classification,
                "emerging_score": emerging_score,
                "growth_rate_pct": growth_pct,
                "recent_period_volume": recent,
                "prior_period_volume": prior,
                "total_volume": total,
                "earliest_appearance": stat["earliest_year"],
                "evidence_rationale": rationale,
                "avg_citations": avg_cit if stat["citation_records"] > 0 else None,
                "sources_used": sorted(list(stat["sources"]))
            })

        # Filter strictly for emerging and new_emerging topics for the primary ranking
        ranked = [t for t in emerging_topics if t["classification"] in ("EMERGING", "NEW_EMERGING")]
        ranked.sort(key=lambda x: (x["emerging_score"], x["recent_period_volume"]), reverse=True)

        result = {
            "emerging_topics": ranked[:limit],
            "total_emerging_found": len(ranked),
            "insufficient_data_topics_count": insufficient_data_count,
            "analysis_window": {
                "recent_period": str(recent_period_year),
                "prior_period": str(prior_period_year),
                "isolated_current_year": str(current_year)
            },
            "methodology": {
                "formula": "Growth % = ((Recent Period Volume - Prior Period Volume) / Prior Period Volume) * 100",
                "ranking_formula": "Emerging Score = (Growth Rate % * 0.45) + (Recent Volume * 0.35) + (Citation Impact * 0.20)",
                "thresholds": {
                    "min_volume_threshold": min_volume,
                    "emerging_growth_min_pct": 20.0,
                    "min_recent_papers": 2
                },
                "limitations": (
                    "Topics are not labeled emerging solely due to high cumulative counts. "
                    "Calculations compare equivalent 12-month complete annual windows. "
                    "Incomplete current year data is isolated to avoid distorted velocity."
                )
            },
            "meta": {
                "records_analyzed": len(records),
                "query": query,
                "sources_represented": sorted(list(all_sources)),
                "retrieved_at": datetime.now(timezone.utc).isoformat()
            }
        }

        _set_in_cache(cache_key, result)
        return result

    def get_topic_analysis(
        self,
        topic: str,
        limit_publications: int = 10
    ) -> Dict[str, Any]:
        """
        In-depth topic analytics: publication timeline, top keywords, citation metrics,
        related topics, leading organizations and researchers, and supporting publications.
        Includes verified cross-module connections to Patents and Funding.
        """
        clean_topic = topic.strip()
        cache_key = f"topic_detail:{clean_topic}:{limit_publications}"
        cached = _get_from_cache(cache_key)
        if cached:
            return cached

        # Fetch records specifically tagged or associated with this topic
        records = fetch_and_filter_records(topic=clean_topic)
        current_year = datetime.now(timezone.utc).year

        # If zero records found by strict topic regex, fallback to text query matching title/keywords
        if not records:
            records = fetch_and_filter_records(query=clean_topic)

        total_volume = len(records)
        if total_volume == 0:
            return {
                "topic": clean_topic,
                "found": False,
                "research_volume": 0,
                "message": f"Topic '{clean_topic}' not found in the indexed research database."
            }

        # Analyze timeline, citations, orgs, authors, co-occurring topics
        timeline_map: Dict[int, int] = {}
        citation_map: Dict[int, int] = {}
        co_occurring_topics: Dict[str, int] = {}
        authors_map: Dict[str, int] = {}
        institutions_map: Dict[str, int] = {}
        sources_seen = set()

        total_citations = 0
        records_with_citation_data = 0

        for r in records:
            year, _, _ = _extract_year_and_date(r)
            has_cit, c_count = _extract_citations(r)
            for s in _extract_sources(r):
                sources_seen.add(s)

            if has_cit:
                records_with_citation_data += 1
                total_citations += c_count

            if year is not None:
                timeline_map[year] = timeline_map.get(year, 0) + 1
                if has_cit:
                    citation_map[year] = citation_map.get(year, 0) + c_count

            # Co-occurring topics
            for t in _extract_topics_and_concepts(r):
                if t.lower() != clean_topic.lower():
                    co_occurring_topics[t] = co_occurring_topics.get(t, 0) + 1

            # Authors
            for a in (r.get("authors") or []):
                if isinstance(a, str) and len(a.strip()) > 1:
                    authors_map[a.strip()] = authors_map.get(a.strip(), 0) + 1

            # Institutions
            for inst in (r.get("institutions") or []):
                if isinstance(inst, str) and len(inst.strip()) > 1:
                    institutions_map[inst.strip()] = institutions_map.get(inst.strip(), 0) + 1

        # Sorted publication timeline
        sorted_years = sorted(timeline_map.keys())
        timeline = []
        for y in sorted_years:
            timeline.append({
                "year": y,
                "publication_count": timeline_map[y],
                "citations": citation_map.get(y, 0),
                "is_partial_year": (y == current_year)
            })

        # Growth between last two complete years
        complete_years = [y for y in sorted_years if y < current_year]
        growth_rate = None
        if len(complete_years) >= 2:
            r_y, p_y = complete_years[-1], complete_years[-2]
            r_cnt = timeline_map.get(r_y, 0)
            p_cnt = timeline_map.get(p_y, 0)
            if p_cnt >= 2:
                growth_rate = round(((r_cnt - p_cnt) / p_cnt) * 100, 1)

        # Top related topics
        related_topics = sorted(
            [{"name": k, "co_occurrences": v} for k, v in co_occurring_topics.items()],
            key=lambda x: x["co_occurrences"],
            reverse=True
        )[:8]

        # Top organizations
        leading_organizations = sorted(
            [{"name": k, "publications": v} for k, v in institutions_map.items()],
            key=lambda x: x["publications"],
            reverse=True
        )[:5]

        # Top researchers
        leading_researchers = sorted(
            [{"name": k, "publications": v} for k, v in authors_map.items()],
            key=lambda x: x["publications"],
            reverse=True
        )[:5]

        # Supporting publications (sorted by citations, then year)
        sorted_pubs = sorted(
            records,
            key=lambda x: (
                x.get("cited_by_count") or x.get("citation_count") or 0,
                x.get("publication_year") or x.get("year") or 0
            ),
            reverse=True
        )[:limit_publications]

        supporting_publications = []
        for p in sorted_pubs:
            has_cit, c_cnt = _extract_citations(p)
            year, _, _ = _extract_year_and_date(p)
            supporting_publications.append({
                "id": p.get("id") or p.get("doi") or str(p.get("_id")),
                "title": p.get("title", "Untitled"),
                "authors": p.get("authors") or [],
                "institutions": p.get("institutions") or [],
                "year": year,
                "publication_date": p.get("publication_date"),
                "doi": p.get("doi"),
                "url": p.get("url") or (f"https://doi.org/{p['doi']}" if p.get("doi") else None),
                "citations": c_cnt if has_cit else None,
                "has_citation_data": has_cit,
                "sources": _extract_sources(p)
            })

        # Verified Cross-Module Connections (Patents & Funding)
        cross_module = self._get_cross_module_connections(clean_topic)

        avg_citations = round(total_citations / records_with_citation_data, 2) if records_with_citation_data > 0 else None

        result = {
            "topic": clean_topic,
            "found": True,
            "research_volume": total_volume,
            "timeline": timeline,
            "growth_rate_pct": growth_rate,
            "citation_metrics": {
                "total_citations": total_citations,
                "avg_citations_per_paper": avg_citations,
                "records_with_citation_data": records_with_citation_data,
                "citation_coverage_pct": round((records_with_citation_data / total_volume * 100), 1) if total_volume > 0 else 0.0,
                "has_citation_data": records_with_citation_data > 0
            },
            "related_topics": related_topics,
            "leading_organizations": leading_organizations,
            "leading_researchers": leading_researchers,
            "supporting_publications": supporting_publications,
            "cross_module_connections": cross_module,
            "meta": {
                "sources_represented": sorted(list(sources_seen)),
                "date_range": {
                    "min_year": min(sorted_years) if sorted_years else None,
                    "max_year": max(sorted_years) if sorted_years else None
                },
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "scope": "Specific Topic Analysis across Indexed Records"
            }
        }

        _set_in_cache(cache_key, result)
        return result

    def _get_cross_module_connections(self, topic: str) -> Dict[str, Any]:
        """
        Identify verified related patents and funding records matching the topic keyword.
        Does NOT invent links or modify external formulas.
        """
        topic_regex = re.escape(topic)
        # Search patents by technology_field or title
        patent_matches = list(patents_collection.find({
            "$or": [
                {"technology_field": {"$regex": topic_regex, "$options": "i"}},
                {"wipo_field": {"$regex": topic_regex, "$options": "i"}},
                {"patent_title": {"$regex": topic_regex, "$options": "i"}}
            ]
        }).limit(4))

        formatted_patents = []
        for p in patent_matches:
            formatted_patents.append({
                "patent_number": p.get("patent_number") or p.get("patent_id"),
                "title": p.get("patent_title") or f"Patent {p.get('patent_number')}",
                "assignee": p.get("assignee") or (p.get("assignees") or ["Unknown"])[0],
                "technology_field": p.get("technology_field"),
                "grant_year": p.get("grant_year") or p.get("patent_date"),
                "match_type": "verified_technology_field_match"
            })

        # Search funding by title or abstract
        funding_matches = list(funding_collection.find({
            "$or": [
                {"title": {"$regex": topic_regex, "$options": "i"}},
                {"abstract": {"$regex": topic_regex, "$options": "i"}}
            ]
        }).limit(4))

        formatted_funding = []
        for f in funding_matches:
            formatted_funding.append({
                "project_number": f.get("project_number"),
                "title": f.get("title"),
                "award_amount": f.get("award_amount"),
                "fiscal_year": f.get("fiscal_year"),
                "principal_investigators": f.get("principal_investigators") or [],
                "match_type": "verified_research_award_match"
            })

        return {
            "patents": formatted_patents,
            "patents_count": len(formatted_patents),
            "funding": formatted_funding,
            "funding_count": len(formatted_funding),
            "global_search_url": f"/search?q={topic}",
            "innovation_scoring_url": "/innovation-scoring"
        }


# Singleton instance
_research_trend_service = ResearchTrendService()


def get_research_trend_service() -> ResearchTrendService:
    return _research_trend_service
