import os
import re
import logging
import httpx
from dotenv import load_dotenv
from app.database.connection import db

load_dotenv()

logger = logging.getLogger("patent_service")

PATENT_API_URL = "https://api.uspto.gov/api/v1/patent/applications/search"
patents_collection = db["patents"]


def get_headers():
    """
    Retrieves request headers for the USPTO Open Data Portal API.
    Raises RuntimeError if USPTO_API_KEY is not configured.
    """
    api_key = os.getenv("USPTO_API_KEY")
    if not api_key:
        raise RuntimeError(
            "USPTO_API_KEY is missing from environment variables."
        )
    return {
        "accept": "application/json",
        "X-API-KEY": api_key
    }


def _first_value(data, keys):
    if not isinstance(data, dict):
        return None
    for key in keys:
        value = data.get(key)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return None


def _extract_name(item):
    if not isinstance(item, dict):
        return str(item).strip() if item else ""

    first = (
        item.get("firstName")
        or item.get("first_name")
        or item.get("inventorNameFirst")
        or ""
    )
    last = (
        item.get("lastName")
        or item.get("last_name")
        or item.get("inventorNameLast")
        or ""
    )
    full_name = f"{first} {last}".strip()
    if full_name:
        return full_name

    return (
        item.get("inventorName")
        or item.get("name")
        or item.get("organizationName")
        or ""
    )


def _extract_organizations(items):
    organizations = []
    if isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                org = (
                    item.get("organizationName")
                    or item.get("organization")
                    or item.get("assigneeOrganizationName")
                    or item.get("assigneeName")
                )
                if org:
                    organizations.append(str(org).strip())
            elif isinstance(item, str) and item.strip():
                organizations.append(item.strip())
    elif isinstance(items, str) and items.strip():
        organizations.append(items.strip())

    return list(dict.fromkeys(organizations))


def _extract_inventors(items):
    inventors = []
    if isinstance(items, list):
        for item in items:
            name = _extract_name(item)
            if name:
                inventors.append(name)
    elif isinstance(items, str) and items.strip():
        inventors.append(items.strip())

    return list(dict.fromkeys(inventors))


def _extract_cpc_sections(items):
    sections = []
    if isinstance(items, list):
        for item in items:
            if isinstance(item, str):
                sections.extend(item.split())
            elif isinstance(item, dict):
                code = item.get("cpcClassificationCode") or item.get("code") or item.get("section")
                if code:
                    sections.append(str(code)[0].upper())
    elif isinstance(items, str):
        sections.extend(items.split())

    clean_sections = [s.strip().upper() for s in sections if s and len(s.strip()) <= 4]
    return list(dict.fromkeys(clean_sections))


def normalize_patent_record(item, source_label="USPTO Live Data"):
    """
    Normalizes a single patent application/patent record into the application's
    MongoDB patent document schema.
    """
    if not isinstance(item, dict):
        return None

    metadata = (
        item.get("applicationMetaData")
        or item.get("applicationMetadata")
        or item.get("applicationData")
        or item
    )
    if not isinstance(metadata, dict):
        metadata = item if isinstance(item, dict) else {}

    patent_number = _first_value(
        metadata,
        ["patentNumber", "publicationNumber", "applicationNumberText", "patent_number", "patent_id"]
    )
    if not patent_number:
        patent_number = _first_value(item, ["patentNumber", "publicationNumber", "applicationNumberText", "patent_id"])

    if not patent_number:
        return None

    title = _first_value(
        metadata,
        ["inventionTitle", "inventionTitleText", "title", "patent_title"]
    ) or "Untitled Patent Document"

    filing_date = _first_value(
        metadata,
        ["filingDate", "filingDateText", "filing_date"]
    )

    grant_date = _first_value(
        metadata,
        ["grantDate", "grantDateText", "publicationDate", "patent_date", "grant_date"]
    )

    grant_year = None
    date_str = grant_date or filing_date or _first_value(metadata, ["grant_year", "application_year"])
    if date_str:
        year_match = re.search(r"\b(19\d\d|20\d\d)\b", str(date_str))
        if year_match:
            try:
                grant_year = int(year_match.group(1))
            except ValueError:
                grant_year = None

    status = _first_value(
        metadata,
        ["applicationStatusDescriptionText", "applicationStatusText", "status", "patent_type"]
    ) or "Granted Patent"

    abstract = _first_value(
        metadata,
        ["abstractText", "abstract", "patent_abstract"]
    )

    inventors = _extract_inventors(
        item.get("inventorBag")
        or item.get("inventors")
        or metadata.get("inventors")
        or []
    )

    assignees = _extract_organizations(
        item.get("assignmentBag")
        or item.get("assigneeBag")
        or item.get("assignees")
        or metadata.get("assignees")
        or metadata.get("assignee")
        or []
    )
    top_assignee = assignees[0] if assignees else _first_value(metadata, ["assignee"])

    cpc_sections = _extract_cpc_sections(
        item.get("cpcClassificationBag")
        or item.get("cpcClassifications")
        or metadata.get("cpc_sections")
        or []
    )

    wipo_field = _first_value(
        metadata,
        ["first_wipo_field_title", "wipo_field", "technology_field", "fieldTitle"]
    ) or item.get("technology_field")

    wipo_sector = _first_value(
        metadata,
        ["first_wipo_sector_title", "wipo_sector", "technology_sector", "sectorTitle"]
    ) or item.get("technology_sector")

    country = _first_value(
        metadata,
        ["country", "countryCode", "applicantCountryCode"]
    ) or "US"

    citations_count = 0
    citations = item.get("citations") or metadata.get("citations")
    if isinstance(citations, list):
        citations_count = len(citations)
    elif isinstance(citations, int):
        citations_count = citations

    source_url = f"https://patentcenter.uspto.gov/applications/{patent_number}"

    document = {
        "patent_id": str(patent_number),
        "patent_number": str(patent_number),
        "application_number": _first_value(metadata, ["applicationNumberText", "application_number"]),
        "patent_title": title,
        "title": title,
        "patent_abstract": abstract,
        "abstract": abstract,
        "filing_date": filing_date,
        "grant_date": grant_date,
        "patent_date": grant_date or filing_date or (str(grant_year) if grant_year else None),
        "grant_year": grant_year,
        "patent_type": status,
        "inventors": inventors,
        "inventor_count": len(inventors),
        "assignees": assignees,
        "assignee": top_assignee,
        "country": country,
        "cpc_sections": cpc_sections,
        "cpc_count": len(cpc_sections),
        "technology_field": wipo_field,
        "wipo_field": wipo_field,
        "technology_sector": wipo_sector,
        "wipo_sector": wipo_sector,
        "citations": citations_count,
        "source": source_label,
        "source_url": source_url
    }

    return document


def fetch_live_patents(query: str, page: int = 1, size: int = 20):
    """
    Executes a live request to the USPTO Open Data Portal API.
    Raises Exception if API key is missing or request fails.
    """
    headers = get_headers()
    offset = (page - 1) * size

    params = {
        "q": query if query else "*:*",
        "offset": offset,
        "limit": size
    }

    with httpx.Client(timeout=15.0) as client:
        response = client.get(PATENT_API_URL, params=params, headers=headers)

        if response.status_code in (401, 403):
            raise RuntimeError(
                f"USPTO API Authentication/Authorization error ({response.status_code}). Check USPTO_API_KEY."
            )

        response.raise_for_status()
        return response.json()


def cache_patents_in_mongo(records):
    """
    Upserts normalized patent records into the MongoDB patents collection.
    """
    if not records or not isinstance(records, list):
        return 0

    upserted_count = 0
    for record in records:
        if not isinstance(record, dict):
            continue
        patent_num = record.get("patent_number") or record.get("patent_id")
        if not patent_num:
            continue

        try:
            patents_collection.update_one(
                {"patent_number": patent_num},
                {"$set": record},
                upsert=True
            )
            upserted_count += 1
        except Exception as e:
            logger.warning(f"Failed to upsert patent {patent_num} to Mongo: {e}")

    return upserted_count


def search_cached_patents(query: str, page: int = 1, size: int = 20):
    """
    Searches cached patent records in MongoDB matching the query string.
    """
    skip = (page - 1) * size
    query_str = query.strip() if query else ""

    if query_str:
        search_filter = {
            "$or": [
                {"patent_number": {"$regex": query_str, "$options": "i"}},
                {"patent_title": {"$regex": query_str, "$options": "i"}},
                {"title": {"$regex": query_str, "$options": "i"}},
                {"assignee": {"$regex": query_str, "$options": "i"}},
                {"assignees": {"$regex": query_str, "$options": "i"}},
                {"wipo_field": {"$regex": query_str, "$options": "i"}},
                {"technology_field": {"$regex": query_str, "$options": "i"}},
                {"country": {"$regex": query_str, "$options": "i"}}
            ]
        }
    else:
        search_filter = {}

    total = patents_collection.count_documents(search_filter)
    cursor = (
        patents_collection
        .find(search_filter)
        .sort("grant_year", -1)
        .skip(skip)
        .limit(size)
    )

    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)

    return total, results


def search_patents_with_fallback(query: str, page: int = 1, size: int = 20):
    """
    Primary service method for patent search:
    1. Attempts live query from USPTO Open Data Portal API.
    2. Normalizes & caches results in MongoDB.
    3. If API succeeds, returns live results.
    4. If API fails (e.g. key missing/invalid/network down), attempts fallback
       to MongoDB cached data and clearly flags response as cached.
    """
    live_error = None
    try:
        raw_data = fetch_live_patents(query, page, size)
        
        raw_items = []
        if isinstance(raw_data, dict):
            for key in ["results", "patentApplicationData", "patentApplicationDataBag", "applications", "applicationDataBag"]:
                val = raw_data.get(key)
                if isinstance(val, list):
                    raw_items = val
                    break

        total_hits = 0
        if isinstance(raw_data, dict):
            for k in ["count", "total", "totalCount", "totalHits"]:
                if isinstance(raw_data.get(k), int):
                    total_hits = raw_data[k]
                    break
        if not total_hits:
            total_hits = len(raw_items)

        normalized_records = []
        for item in raw_items:
            norm = normalize_patent_record(item, source_label="USPTO Live Data")
            if norm:
                normalized_records.append(norm)

        # Upsert records into local cache
        cache_patents_in_mongo(normalized_records)

        return {
            "total": total_hits,
            "page": page,
            "size": size,
            "query": query,
            "source": "USPTO Live Data",
            "is_cached": False,
            "results": normalized_records
        }

    except Exception as e:
        live_error = str(e)
        logger.warning(f"Live patent API failed: {live_error}. Falling back to MongoDB cache.")

    # Fallback to local MongoDB cache
    total, cached_records = search_cached_patents(query, page, size)

    if cached_records or query == "":
        return {
            "total": total,
            "page": page,
            "size": size,
            "query": query,
            "source": "MongoDB Cache (Fallback)",
            "is_cached": True,
            "warning": f"Live USPTO API unavailable: {live_error}",
            "results": cached_records
        }

    # If no cached records exist and API failed, raise informative exception
    raise RuntimeError(
        f"Unable to fetch live USPTO patents ({live_error}) and no matching cached records were found in MongoDB."
    )