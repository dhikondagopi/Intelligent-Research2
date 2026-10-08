from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import httpx

OPENALEX_URL = "https://api.openalex.org/works"


def normalize_doi(doi: Optional[str]) -> Optional[str]:
    if not doi:
        return None
    cleaned = str(doi).strip().lower()
    for prefix in ["https://doi.org/", "http://doi.org/", "doi:", "https://dx.doi.org/", "http://dx.doi.org/"]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
    return cleaned.strip("/ ") if cleaned else None


def reconstruct_openalex_abstract(inverted_index: Any) -> Optional[str]:
    if not inverted_index or not isinstance(inverted_index, dict):
        return None
    try:
        word_positions = []
        for word, positions in inverted_index.items():
            if isinstance(positions, list):
                for pos in positions:
                    word_positions.append((pos, str(word)))
        if not word_positions:
            return None
        word_positions.sort(key=lambda x: x[0])
        return " ".join(word for _, word in word_positions)
    except Exception:
        return None


async def search_openalex(
    search: str,
    page: int = 1,
    per_page: int = 10,
    timeout: float = 12.0
) -> Dict[str, Any]:
    """Execute raw search request against OpenAlex API with timeout and retries."""
    params = {
        "search": search,
        "page": page,
        "per-page": per_page
    }
    headers = {
        "User-Agent": "IntelligentResearchPlatform/2.0 (mailto:support@intelligentresearch.ai)"
    }

    last_error = None
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(OPENALEX_URL, params=params, headers=headers)
                response.raise_for_status()
                return response.json()
        except Exception as exc:
            last_error = exc

    raise last_error or RuntimeError("OpenAlex request failed")


def format_openalex_results(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Legacy formatter preserving exact previous API response shape for backwards compatibility."""
    results = []
    for work in data.get("results", []):
        authors = []
        institutions = []
        for authorship in work.get("authorships", []):
            author = authorship.get("author")
            if author and author.get("display_name"):
                authors.append(author["display_name"])
            for institution in authorship.get("institutions", []):
                name = institution.get("display_name")
                if name:
                    institutions.append(name)

        concepts = []
        for concept in work.get("concepts", []):
            name = concept.get("display_name")
            if name:
                concepts.append(name)

        results.append({
            "id": work.get("id", ""),
            "title": work.get("title", "Untitled"),
            "publication_year": work.get("publication_year"),
            "doi": work.get("doi"),
            "cited_by_count": work.get("cited_by_count", 0),
            "authors": list(dict.fromkeys(authors)),
            "institutions": list(dict.fromkeys(institutions)),
            "concepts": list(dict.fromkeys(concepts))
        })
    return results


def normalize_openalex_work(work: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize an individual OpenAlex work item into the unified research record."""
    work_id = str(work.get("id") or "")
    raw_doi = work.get("doi")
    norm_doi = normalize_doi(raw_doi)

    authors: List[str] = []
    orcid_ids: List[str] = []
    institutions: List[str] = []
    ror_ids: List[str] = []

    for authorship in work.get("authorships", []):
        author = authorship.get("author", {})
        if author.get("display_name"):
            authors.append(author["display_name"])
        if author.get("orcid"):
            orcid_ids.append(author["orcid"])

        for inst in authorship.get("institutions", []):
            if inst.get("display_name"):
                institutions.append(inst["display_name"])
            if inst.get("ror"):
                ror_ids.append(inst["ror"])

    concepts: List[str] = []
    for concept in work.get("concepts", []):
        if concept.get("display_name"):
            concepts.append(concept["display_name"])

    topics: List[str] = []
    for topic in work.get("topics", []):
        if topic.get("display_name"):
            topics.append(topic["display_name"])

    keywords: List[str] = []
    for kw in work.get("keywords", []):
        if kw.get("keyword"):
            keywords.append(kw["keyword"])
        elif kw.get("display_name"):
            keywords.append(kw["display_name"])

    # Reconstruct abstract from inverted index
    abstract = reconstruct_openalex_abstract(work.get("abstract_inverted_index"))

    # Venue & Publisher
    primary_location = work.get("primary_location") or {}
    source_obj = primary_location.get("source") or {}
    venue = source_obj.get("display_name")
    publisher = source_obj.get("host_organization_name")

    year = work.get("publication_year")
    pub_date = work.get("publication_date")
    citations = int(work.get("cited_by_count") or 0)
    references = int(work.get("referenced_works_count") or 0)

    # Funders
    funders = []
    for grant in work.get("grants", []):
        if grant.get("funder_display_name"):
            funders.append(grant["funder_display_name"])

    oa_data = work.get("open_access") or {}
    is_oa = oa_data.get("is_oa", False)

    source_url = raw_doi or work_id or f"https://openalex.org/{work_id}"

    return {
        "id": f"openalex:{work_id.split('/')[-1]}" if work_id else f"doi:{norm_doi}" if norm_doi else "",
        "source": "OpenAlex",
        "sources": ["OpenAlex"],
        "source_id": {"openalex": work_id},
        "openalex_id": work_id,
        "doi": norm_doi,
        "title": work.get("title") or "Untitled",
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
        "topics": list(dict.fromkeys(topics or concepts)),
        "concepts": list(dict.fromkeys(concepts)),
        "keywords": list(dict.fromkeys(keywords)),
        "open_access": is_oa,
        "url": source_url,
        "source_urls": {"OpenAlex": work_id or source_url},
        "orcid_ids": list(dict.fromkeys(orcid_ids)),
        "ror_ids": list(dict.fromkeys(ror_ids)),
        "funders": list(dict.fromkeys(funders)),
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }


async def search_openalex_normalized(
    search: str,
    page: int = 1,
    per_page: int = 10
) -> List[Dict[str, Any]]:
    """Search OpenAlex and return list of standardized research records."""
    raw_data = await search_openalex(search=search, page=page, per_page=per_page)
    works = raw_data.get("results", [])
    return [normalize_openalex_work(w) for w in works]