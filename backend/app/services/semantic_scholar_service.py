import os
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import httpx

from app.services.openalex_service import normalize_doi

SEMANTIC_SCHOLAR_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
FIELDS = (
    "paperId,title,abstract,authors,year,publicationDate,venue,"
    "citationCount,referenceCount,influentialCitationCount,"
    "isOpenAccess,fieldsOfStudy,s2FieldsOfStudy,externalIds,url"
)


def normalize_semantic_scholar_work(item: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a Semantic Scholar paper item into standard research record."""
    paper_id = item.get("paperId") or ""
    external_ids = item.get("externalIds") or {}
    raw_doi = external_ids.get("DOI")
    norm_doi = normalize_doi(raw_doi)

    title = item.get("title") or "Untitled"
    abstract = item.get("abstract")

    authors: List[str] = []
    for author in item.get("authors", []):
        if isinstance(author, dict) and author.get("name"):
            authors.append(author["name"].strip())

    year = item.get("year")
    pub_date = item.get("publicationDate") or (f"{year}-01-01" if year else None)
    venue = item.get("venue")

    citations = int(item.get("citationCount") or 0)
    references = int(item.get("referenceCount") or 0)
    is_oa = bool(item.get("isOpenAccess"))

    # Topics / Fields of study
    topics: List[str] = []
    for f in item.get("fieldsOfStudy", []) or []:
        if isinstance(f, str) and f.strip():
            topics.append(f.strip())

    for f_obj in item.get("s2FieldsOfStudy", []) or []:
        if isinstance(f_obj, dict) and f_obj.get("category"):
            topics.append(f_obj["category"].strip())

    paper_url = item.get("url") or (f"https://www.semanticscholar.org/paper/{paper_id}" if paper_id else "")

    return {
        "id": f"s2:{paper_id}" if paper_id else f"doi:{norm_doi}" if norm_doi else "",
        "source": "Semantic Scholar",
        "sources": ["Semantic Scholar"],
        "source_id": {"semantic_scholar": paper_id},
        "openalex_id": None,
        "doi": norm_doi,
        "title": title,
        "abstract": abstract,
        "authors": list(dict.fromkeys(authors)),
        "institutions": [],
        "publication_date": pub_date,
        "year": year,
        "publication_year": year,
        "venue": venue,
        "publisher": None,
        "citation_count": citations,
        "cited_by_count": citations,
        "references_count": references,
        "topics": list(dict.fromkeys(topics)),
        "concepts": list(dict.fromkeys(topics)),
        "keywords": list(dict.fromkeys(topics)),
        "open_access": is_oa,
        "url": paper_url,
        "source_urls": {"Semantic Scholar": paper_url},
        "orcid_ids": [],
        "ror_ids": [],
        "funders": [],
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }


async def search_semantic_scholar(
    query: str,
    page: int = 1,
    per_page: int = 10,
    timeout: float = 12.0
) -> Dict[str, Any]:
    """Execute search request against Semantic Scholar Graph API with optional API key."""
    offset = max(0, (page - 1) * per_page)
    params = {
        "query": query,
        "offset": offset,
        "limit": per_page,
        "fields": FIELDS
    }

    headers: Dict[str, str] = {
        "User-Agent": "IntelligentResearchPlatform/2.0 (mailto:support@intelligentresearch.ai)"
    }
    api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
    if api_key and api_key.strip():
        headers["x-api-key"] = api_key.strip()

    last_error = None
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(
                    SEMANTIC_SCHOLAR_URL,
                    params=params,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
        except Exception as exc:
            last_error = exc

    raise last_error or RuntimeError("Semantic Scholar request failed")


async def search_semantic_scholar_normalized(
    query: str,
    page: int = 1,
    per_page: int = 10
) -> List[Dict[str, Any]]:
    """Search Semantic Scholar and return standardized research records."""
    raw_data = await search_semantic_scholar(query=query, page=page, per_page=per_page)
    data = raw_data.get("data", [])
    return [normalize_semantic_scholar_work(item) for item in data]
