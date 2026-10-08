import html
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import httpx

from app.services.openalex_service import normalize_doi

CROSSREF_URL = "https://api.crossref.org/works"


def clean_crossref_abstract(raw_abstract: Optional[str]) -> Optional[str]:
    """Strip XML/JATS markup and decode HTML entities from Crossref abstract."""
    if not raw_abstract:
        return None
    # Remove XML tags like <jats:p>, <jats:title>, <jats:sec>, etc.
    cleaned = re.sub(r"<[^>]+>", " ", str(raw_abstract))
    # Unescape HTML entities
    cleaned = html.unescape(cleaned)
    # Collapse extra whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned if cleaned else None


def extract_crossref_date(item: Dict[str, Any]) -> tuple[Optional[int], Optional[str]]:
    """Extract (year, formatted_date) from Crossref item date parts."""
    date_candidates = [
        item.get("published-print"),
        item.get("published-online"),
        item.get("published"),
        item.get("created"),
        item.get("issued")
    ]
    for candidate in date_candidates:
        if candidate and isinstance(candidate, dict):
            parts = candidate.get("date-parts")
            if parts and isinstance(parts, list) and len(parts) > 0 and len(parts[0]) > 0:
                p = parts[0]
                year = p[0] if len(p) >= 1 and isinstance(p[0], int) else None
                month = p[1] if len(p) >= 2 and isinstance(p[1], int) else 1
                day = p[2] if len(p) >= 3 and isinstance(p[2], int) else 1
                if year:
                    date_str = f"{year:04d}-{month:02d}-{day:02d}"
                    return year, date_str
    return None, None


def normalize_crossref_work(item: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a Crossref API work item into standard research record."""
    raw_doi = item.get("DOI")
    norm_doi = normalize_doi(raw_doi)

    # Title is usually a list of strings
    raw_title = item.get("title")
    title = "Untitled"
    if isinstance(raw_title, list) and len(raw_title) > 0:
        title = raw_title[0]
    elif isinstance(raw_title, str) and raw_title:
        title = raw_title

    authors: List[str] = []
    orcid_ids: List[str] = []
    institutions: List[str] = []
    ror_ids: List[str] = []

    for author in item.get("author", []):
        if not isinstance(author, dict):
            continue
        given = author.get("given", "").strip()
        family = author.get("family", "").strip()
        full_name = f"{given} {family}".strip() if (given or family) else author.get("name", "").strip()
        if full_name:
            authors.append(full_name)

        orcid = author.get("ORCID")
        if orcid:
            cleaned_orcid = re.sub(r"https?://orcid.org/", "", str(orcid)).strip()
            orcid_ids.append(cleaned_orcid)

        for aff in author.get("affiliation", []):
            if isinstance(aff, dict):
                aff_name = aff.get("name", "").strip()
                if aff_name:
                    institutions.append(aff_name)
                # Check for ROR identifiers in affiliation
                for ror_candidate in aff.get("id", []):
                    if isinstance(ror_candidate, dict) and "ror" in str(ror_candidate.get("id", "")).lower():
                        ror_ids.append(ror_candidate.get("id"))

    # Venue (journal/conference container-title)
    container_titles = item.get("container-title", [])
    venue = container_titles[0] if isinstance(container_titles, list) and container_titles else None
    publisher = item.get("publisher")

    year, pub_date = extract_crossref_date(item)
    citations = int(item.get("is-referenced-by-count") or 0)
    references = int(item.get("references-count") or 0)

    # Funders
    funders: List[str] = []
    for funder in item.get("funder", []):
        if isinstance(funder, dict) and funder.get("name"):
            funders.append(funder["name"])

    # Topics / Subjects
    topics = item.get("subject", [])
    if not isinstance(topics, list):
        topics = []

    abstract = clean_crossref_abstract(item.get("abstract"))
    source_url = item.get("URL") or (f"https://doi.org/{norm_doi}" if norm_doi else "")

    return {
        "id": f"crossref:{norm_doi}" if norm_doi else f"crossref:{abs(hash(title))}",
        "source": "Crossref",
        "sources": ["Crossref"],
        "source_id": {"crossref": norm_doi or ""},
        "openalex_id": None,
        "doi": norm_doi,
        "title": title,
        "abstract": abstract,
        "authors": list(dict.fromkeys(authors)),
        "institutions": list(dict.fromkeys(institutions)),
        "publication_date": pub_date,
        "year": year,
        "publication_year": year,
        "venue": venue,
        "publisher": publisher,
        "citation_count": citations,
        "cited_by_count": citations,
        "references_count": references,
        "topics": list(dict.fromkeys(topics)),
        "concepts": list(dict.fromkeys(topics)),
        "keywords": list(dict.fromkeys(topics)),
        "open_access": bool(item.get("license")),
        "url": source_url,
        "source_urls": {"Crossref": source_url},
        "orcid_ids": list(dict.fromkeys(orcid_ids)),
        "ror_ids": list(dict.fromkeys(ror_ids)),
        "funders": list(dict.fromkeys(funders)),
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }


async def search_crossref(
    query: str,
    page: int = 1,
    per_page: int = 10,
    timeout: float = 12.0
) -> Dict[str, Any]:
    """Execute raw search request against Crossref API with polite headers, timeout, and retry."""
    offset = max(0, (page - 1) * per_page)
    params = {
        "query": query,
        "rows": per_page,
        "offset": offset
    }
    headers = {
        "User-Agent": "IntelligentResearchPlatform/2.0 (https://intelligentresearch.ai; mailto:support@intelligentresearch.ai)"
    }

    last_error = None
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(CROSSREF_URL, params=params, headers=headers)
                response.raise_for_status()
                return response.json()
        except Exception as exc:
            last_error = exc

    raise last_error or RuntimeError("Crossref request failed")


async def search_crossref_normalized(
    query: str,
    page: int = 1,
    per_page: int = 10
) -> List[Dict[str, Any]]:
    """Search Crossref and return list of standardized research records."""
    raw_data = await search_crossref(query=query, page=page, per_page=per_page)
    items = raw_data.get("message", {}).get("items", [])
    return [normalize_crossref_work(item) for item in items]
