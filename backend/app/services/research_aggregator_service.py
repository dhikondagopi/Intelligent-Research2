import asyncio
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple

from app.database.connection import db
from app.services.openalex_service import (
    search_openalex_normalized,
    normalize_doi
)
from app.services.crossref_service import search_crossref_normalized
from app.services.semantic_scholar_service import search_semantic_scholar_normalized

research_collection = db["research_works"]


def normalize_title_for_matching(title: Optional[str]) -> str:
    """Normalize title by lowercasing, removing punctuation, and stripping extra spaces."""
    if not title:
        return ""
    # Remove non-alphanumeric except spaces
    cleaned = re.sub(r"[^\w\s]", " ", str(title).lower())
    # Collapse multiple spaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def extract_first_author_token(authors: List[str]) -> str:
    """Extract first author's last name or primary token for fallback matching."""
    if not authors:
        return ""
    first = authors[0].strip()
    tokens = first.split()
    return tokens[-1].lower() if tokens else ""


def are_records_duplicates(a: Dict[str, Any], b: Dict[str, Any]) -> bool:
    """Check if two research records represent the exact same publication."""
    # 1. DOI Matching
    doi_a = normalize_doi(a.get("doi"))
    doi_b = normalize_doi(b.get("doi"))
    if doi_a and doi_b:
        return doi_a == doi_b

    # 2. Source ID matching
    ids_a = a.get("source_id", {})
    ids_b = b.get("source_id", {})
    for key in ["openalex", "crossref", "semantic_scholar"]:
        val_a = ids_a.get(key)
        val_b = ids_b.get(key)
        if val_a and val_b and val_a == val_b:
            return True

    # 3. Normalized Title + Author/Year Fallback
    title_a = normalize_title_for_matching(a.get("title"))
    title_b = normalize_title_for_matching(b.get("title"))

    # If title is meaningful and matches exactly
    if title_a and title_b and len(title_a) >= 12 and title_a == title_b:
        year_a = a.get("year")
        year_b = b.get("year")
        author_a = extract_first_author_token(a.get("authors", []))
        author_b = extract_first_author_token(b.get("authors", []))

        # If both have years and match within 1 year
        if year_a and year_b and abs(int(year_a) - int(year_b)) <= 1:
            return True
        # If first author matches
        if author_a and author_b and author_a == author_b:
            return True
        # If long title match
        if len(title_a) >= 28:
            return True

    return False


def merge_two_records(base: Dict[str, Any], incoming: Dict[str, Any]) -> Dict[str, Any]:
    """Merge incoming duplicate record into base record, combining sources and metadata."""
    merged = dict(base)

    # 1. Merge sources list
    existing_sources = set(merged.get("sources", []))
    for s in incoming.get("sources", []):
        existing_sources.add(s)
    # Ensure source order is consistent
    source_order = ["OpenAlex", "Crossref", "Semantic Scholar"]
    merged["sources"] = [s for s in source_order if s in existing_sources] + [
        s for s in existing_sources if s not in source_order
    ]
    merged["source"] = merged["sources"][0] if merged["sources"] else "Unified"

    # 2. Merge source_id dictionary
    base_ids = dict(merged.get("source_id") or {})
    incoming_ids = dict(incoming.get("source_id") or {})
    base_ids.update({k: v for k, v in incoming_ids.items() if v})
    merged["source_id"] = base_ids

    # 3. Merge source_urls dictionary
    base_urls = dict(merged.get("source_urls") or {})
    incoming_urls = dict(incoming.get("source_urls") or {})
    base_urls.update({k: v for k, v in incoming_urls.items() if v})
    merged["source_urls"] = base_urls

    # 4. DOI
    if not merged.get("doi") and incoming.get("doi"):
        merged["doi"] = normalize_doi(incoming["doi"])

    # 5. OpenAlex ID preservation
    if not merged.get("openalex_id") and incoming.get("openalex_id"):
        merged["openalex_id"] = incoming["openalex_id"]

    # 6. Abstract: keep richest
    abs_base = merged.get("abstract") or ""
    abs_inc = incoming.get("abstract") or ""
    if len(abs_inc) > len(abs_base):
        merged["abstract"] = abs_inc

    # 7. Citations: max count
    c_base = int(merged.get("citation_count") or 0)
    c_inc = int(incoming.get("citation_count") or 0)
    max_citations = max(c_base, c_inc)
    merged["citation_count"] = max_citations
    merged["cited_by_count"] = max_citations

    # 8. References: max count
    r_base = int(merged.get("references_count") or 0)
    r_inc = int(incoming.get("references_count") or 0)
    merged["references_count"] = max(r_base, r_inc)

    # 9. Authors: combine & deduplicate
    authors = merged.get("authors") or []
    for a in (incoming.get("authors") or []):
        if a not in authors:
            authors.append(a)
    merged["authors"] = authors

    # 10. Institutions: combine & deduplicate
    institutions = merged.get("institutions") or []
    for inst in (incoming.get("institutions") or []):
        if inst not in institutions:
            institutions.append(inst)
    merged["institutions"] = institutions

    # 11. Topics & Concepts
    topics = merged.get("topics") or []
    for t in (incoming.get("topics") or []):
        if t not in topics:
            topics.append(t)
    merged["topics"] = topics

    concepts = merged.get("concepts") or []
    for c in (incoming.get("concepts") or []):
        if c not in concepts:
            concepts.append(c)
    merged["concepts"] = concepts

    # 12. Identifiers & Funders
    for key in ["orcid_ids", "ror_ids", "funders"]:
        existing_items = merged.get(key) or []
        for item in (incoming.get(key) or []):
            if item not in existing_items:
                existing_items.append(item)
        merged[key] = existing_items

    # 13. Year & Date fallback
    if not merged.get("year") and incoming.get("year"):
        merged["year"] = incoming["year"]
        merged["publication_year"] = incoming["year"]
    if not merged.get("publication_date") and incoming.get("publication_date"):
        merged["publication_date"] = incoming["publication_date"]

    # 14. Venue & Publisher fallback
    if not merged.get("venue") and incoming.get("venue"):
        merged["venue"] = incoming["venue"]
    if not merged.get("publisher") and incoming.get("publisher"):
        merged["publisher"] = incoming["publisher"]

    # 15. Open Access: True if either true
    merged["open_access"] = bool(merged.get("open_access") or incoming.get("open_access"))

    # 16. URL fallback
    if not merged.get("url") and incoming.get("url"):
        merged["url"] = incoming["url"]

    # 17. Ensure unified ID
    if not merged.get("id"):
        doi = merged.get("doi")
        merged["id"] = f"doi:{doi}" if doi else f"unified:{abs(hash(merged.get('title', '')))}"

    return merged


def deduplicate_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deduplicate a list of records using DOI, source_id, and title+author fallback."""
    merged_list: List[Dict[str, Any]] = []

    for incoming in records:
        matched_index = None
        for idx, existing in enumerate(merged_list):
            if are_records_duplicates(existing, incoming):
                matched_index = idx
                break

        if matched_index is not None:
            merged_list[matched_index] = merge_two_records(
                merged_list[matched_index],
                incoming
            )
        else:
            rec = dict(incoming)
            if not rec.get("sources"):
                rec["sources"] = [rec.get("source") or "Unified"]
            if not rec.get("id"):
                doi = rec.get("doi")
                rec["id"] = f"doi:{doi}" if doi else f"unified:{abs(hash(rec.get('title', '')))}"
            merged_list.append(rec)

    return merged_list


def cache_records_in_mongo(records: List[Dict[str, Any]], query: str = ""):
    """Upsert unified records into MongoDB research_works collection."""
    if not records:
        return

    clean_q = query.strip().lower()
    for rec in records:
        try:
            filter_query = {}
            if rec.get("doi"):
                filter_query = {"doi": rec["doi"]}
            elif rec.get("openalex_id"):
                filter_query = {"openalex_id": rec["openalex_id"]}
            elif rec.get("id"):
                filter_query = {"id": rec["id"]}
            else:
                filter_query = {"title": rec.get("title")}

            update_data = dict(rec)
            update_data.pop("_id", None)

            # Update document and add query tag to search_queries set
            update_doc = {
                "$set": update_data
            }
            if clean_q:
                update_doc["$addToSet"] = {"search_queries": clean_q}

            research_collection.update_one(
                filter_query,
                update_doc,
                upsert=True
            )
        except Exception as exc:
            print(f"[Mongo Cache Error] Failed to cache record: {exc}")


def get_cached_records(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieve cached research records matching query from MongoDB."""
    clean_q = query.strip().lower()
    if not clean_q:
        return []

    try:
        # Match by search_queries tag or regex on title/topics
        cursor = research_collection.find({
            "$or": [
                {"search_queries": clean_q},
                {"title": {"$regex": clean_q, "$options": "i"}},
                {"topics": {"$regex": clean_q, "$options": "i"}},
                {"concepts": {"$regex": clean_q, "$options": "i"}}
            ]
        }).sort("cited_by_count", -1).limit(limit)

        cached_items = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if not doc.get("sources"):
                doc["sources"] = ["Cached"]
            cached_items.append(doc)
        return cached_items
    except Exception as exc:
        print(f"[Mongo Cache Read Error] {exc}")
        return []


async def aggregate_research(
    query: str,
    page: int = 1,
    per_page: int = 15
) -> Dict[str, Any]:
    """
    Query OpenAlex, Crossref, and Semantic Scholar concurrently,
    normalize, deduplicate, cache, and report live/cached/unavailable status.
    """
    clean_q = query.strip()
    source_status: Dict[str, str] = {
        "OpenAlex": "UNAVAILABLE",
        "Crossref": "UNAVAILABLE",
        "Semantic Scholar": "UNAVAILABLE"
    }
    errors: Dict[str, str] = {}
    provider_counts: Dict[str, int] = {
        "OpenAlex": 0,
        "Crossref": 0,
        "Semantic Scholar": 0
    }

    # Execute all 3 providers concurrently with safe exception handling
    tasks = [
        search_openalex_normalized(clean_q, page=page, per_page=per_page),
        search_crossref_normalized(clean_q, page=page, per_page=per_page),
        search_semantic_scholar_normalized(clean_q, page=page, per_page=per_page)
    ]

    results_raw = await asyncio.gather(*tasks, return_exceptions=True)

    openalex_res, crossref_res, s2_res = results_raw
    collected_records: List[Dict[str, Any]] = []

    # 1. Process OpenAlex
    if isinstance(openalex_res, Exception):
        source_status["OpenAlex"] = "UNAVAILABLE"
        errors["OpenAlex"] = f"OpenAlex temporarily unavailable ({str(openalex_res)})"
    else:
        source_status["OpenAlex"] = "LIVE"
        provider_counts["OpenAlex"] = len(openalex_res)
        collected_records.extend(openalex_res)

    # 2. Process Crossref
    if isinstance(crossref_res, Exception):
        source_status["Crossref"] = "UNAVAILABLE"
        errors["Crossref"] = f"Crossref temporarily unavailable ({str(crossref_res)})"
    else:
        source_status["Crossref"] = "LIVE"
        provider_counts["Crossref"] = len(crossref_res)
        collected_records.extend(crossref_res)

    # 3. Process Semantic Scholar
    if isinstance(s2_res, Exception):
        source_status["Semantic Scholar"] = "UNAVAILABLE"
        errors["Semantic Scholar"] = f"Semantic Scholar temporarily unavailable ({str(s2_res)})"
    else:
        source_status["Semantic Scholar"] = "LIVE"
        provider_counts["Semantic Scholar"] = len(s2_res)
        collected_records.extend(s2_res)

    # If any external provider succeeded, deduplicate and cache
    if collected_records:
        deduplicated = deduplicate_records(collected_records)
        cache_records_in_mongo(deduplicated, query=clean_q)
        final_records = deduplicated
    else:
        # All live providers failed or timed out: fallback to MongoDB cache
        cached = get_cached_records(clean_q, limit=per_page)
        if cached:
            for s in source_status:
                source_status[s] = "CACHED"
            final_records = cached
        else:
            final_records = []

    # Sort merged records by citation count descending
    final_records.sort(key=lambda r: int(r.get("citation_count") or r.get("cited_by_count") or 0), reverse=True)

    active_sources = [
        source for source, status in source_status.items()
        if status in ("LIVE", "CACHED")
    ]

    return {
        "query": clean_q,
        "total": len(final_records),
        "page": page,
        "per_page": per_page,
        "results": final_records,
        "meta": {
            "sources": active_sources,
            "source_status": source_status,
            "counts": {
                **provider_counts,
                "total_merged": len(final_records)
            },
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "errors": errors
        }
    }
