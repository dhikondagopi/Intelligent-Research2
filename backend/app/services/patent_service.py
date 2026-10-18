import os
import re
import logging
import httpx
from dotenv import load_dotenv
from app.database.connection import db

load_dotenv()

logger = logging.getLogger("patent_service")

# USPTO Open Data Portal – patent application search (requires API key)
PATENT_API_URL = "https://api.uspto.gov/api/v1/patent/applications/search"

# PatentsView Search API – public, no API key required; provides titles & abstracts
PATENTSVIEW_API_URL = "https://search.patentsview.org/api/v1/patent/"

patents_collection = db["patents"]


# ---------------------------------------------------------------------------
# Header helpers
# ---------------------------------------------------------------------------

def get_headers():
    """
    Returns request headers for the USPTO Open Data Portal API.
    Raises RuntimeError if USPTO_API_KEY is not configured.
    """
    api_key = os.getenv("USPTO_API_KEY")
    if not api_key:
        raise RuntimeError(
            "USPTO_API_KEY is missing from environment variables. "
            "Register at https://developer.uspto.gov/ to obtain a key."
        )
    return {
        "accept": "application/json",
        "X-API-KEY": api_key
    }


# ---------------------------------------------------------------------------
# Extraction helpers
# ---------------------------------------------------------------------------

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


def _parse_grant_year(date_str):
    """Extract an integer year from any year-containing string. Returns None on failure."""
    if date_str is None:
        return None
    year_match = re.search(r"\b(19\d\d|20\d\d)\b", str(date_str))
    if year_match:
        try:
            return int(year_match.group(1))
        except ValueError:
            pass
    return None


# ---------------------------------------------------------------------------
# Normalize a raw USPTO / PatentsView record
# ---------------------------------------------------------------------------

def normalize_patent_record(item, source_label="USPTO Live Data"):
    """
    Normalizes a single patent application/patent record into the application's
    MongoDB patent document schema.

    Field resolution order (most-specific → fallback):
      * USPTO ODP response:   item → item.applicationMetaData
      * PatentsView response: item (flat, snake_case keys)
    """
    if not isinstance(item, dict):
        return None

    # ---- Locate the metadata sub-dict (USPTO ODP nesting) -------------------
    metadata = (
        item.get("applicationMetaData")
        or item.get("applicationMetadata")
        or item.get("applicationData")
        or item
    )
    if not isinstance(metadata, dict):
        metadata = item if isinstance(item, dict) else {}

    # ---- Patent number / ID --------------------------------------------------
    patent_number = _first_value(
        metadata,
        ["patentNumber", "publicationNumber", "applicationNumberText", "patent_number", "patent_id"]
    )
    if not patent_number:
        patent_number = _first_value(
            item,
            ["patentNumber", "publicationNumber", "applicationNumberText", "patent_id"]
        )

    if not patent_number:
        return None

    # ---- Title ---------------------------------------------------------------
    # Try nested metadata first, then top-level item fields
    title = (
        _first_value(metadata, ["inventionTitle", "inventionTitleText", "title", "patent_title"])
        or _first_value(item, ["patent_title", "title", "inventionTitle"])
    )
    # Use patent number as display fallback — never fabricate a title
    display_title = title if title else None

    # ---- Dates ---------------------------------------------------------------
    filing_date = _first_value(
        metadata,
        ["filingDate", "filingDateText", "filing_date"]
    ) or _first_value(item, ["filing_date"])

    grant_date = (
        _first_value(metadata, ["grantDate", "grantDateText", "publicationDate", "patent_date", "grant_date"])
        or _first_value(item, ["patent_date", "grant_date"])
    )

    # grant_year — always store as int
    grant_year = (
        _parse_grant_year(grant_date)
        or _parse_grant_year(filing_date)
        or _parse_grant_year(_first_value(metadata, ["grant_year", "application_year"]))
        or _parse_grant_year(_first_value(item, ["grant_year", "application_year"]))
    )

    # ---- Status / type -------------------------------------------------------
    status = _first_value(
        metadata,
        ["applicationStatusDescriptionText", "applicationStatusText", "status", "patent_type"]
    ) or _first_value(item, ["patent_type"]) or "Granted Patent"

    # ---- Abstract ------------------------------------------------------------
    abstract = (
        _first_value(metadata, ["abstractText", "abstract", "patent_abstract"])
        or _first_value(item, ["patent_abstract", "abstract"])
    )

    # ---- Inventors -----------------------------------------------------------
    inventors = _extract_inventors(
        item.get("inventorBag")
        or item.get("inventors")
        or metadata.get("inventors")
        or []
    )

    # ---- Assignees -----------------------------------------------------------
    assignees = _extract_organizations(
        item.get("assignmentBag")
        or item.get("assigneeBag")
        or item.get("assignees")
        or metadata.get("assignees")
        or metadata.get("assignee")
        or []
    )
    top_assignee = assignees[0] if assignees else _first_value(metadata, ["assignee"]) or _first_value(item, ["assignee"])

    # ---- CPC sections --------------------------------------------------------
    cpc_sections = _extract_cpc_sections(
        item.get("cpcClassificationBag")
        or item.get("cpcClassifications")
        or metadata.get("cpc_sections")
        or []
    )

    # ---- WIPO / technology fields --------------------------------------------
    wipo_field = (
        _first_value(metadata, ["first_wipo_field_title", "wipo_field", "technology_field", "fieldTitle"])
        or item.get("technology_field")
    )

    wipo_sector = (
        _first_value(metadata, ["first_wipo_sector_title", "wipo_sector", "technology_sector", "sectorTitle"])
        or item.get("technology_sector")
    )

    # ---- Country -------------------------------------------------------------
    country = (
        _first_value(metadata, ["country", "countryCode", "applicantCountryCode"])
        or _first_value(item, ["country"])
        or "US"
    )

    # ---- Citations -----------------------------------------------------------
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
        "application_number": _first_value(metadata, ["applicationNumberText", "application_number"])
                               or _first_value(item, ["application_number"]),
        "patent_title": display_title,
        "title": display_title,
        "patent_abstract": abstract,
        "abstract": abstract,
        "filing_date": filing_date,
        "grant_date": grant_date,
        "patent_date": grant_date or filing_date or (str(grant_year) if grant_year else None),
        "grant_year": grant_year,          # always int or None
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


# ---------------------------------------------------------------------------
# Live USPTO ODP fetch
# ---------------------------------------------------------------------------

def fetch_live_patents(query: str, page: int = 1, size: int = 20):
    """
    Executes a live request to the USPTO Open Data Portal API.
    Raises RuntimeError if API key is missing.
    Raises httpx.HTTPStatusError for 4xx/5xx responses.
    """
    headers = get_headers()   # raises RuntimeError if key missing
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
                f"USPTO API authentication error ({response.status_code}). "
                "Verify your USPTO_API_KEY at https://developer.uspto.gov/."
            )

        response.raise_for_status()
        return response.json()


# ---------------------------------------------------------------------------
# MongoDB cache helpers
# ---------------------------------------------------------------------------

def cache_patents_in_mongo(records):
    """
    Upserts normalized patent records into the MongoDB patents collection.
    IMPORTANT: Uses $set with only non-None fields to avoid overwriting
    existing good data with null values from incomplete live responses.
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

        # Only set fields that have actual values to avoid overwriting good cache data
        update_fields = {k: v for k, v in record.items() if v is not None and v != "" and v != []}

        try:
            patents_collection.update_one(
                {"patent_number": patent_num},
                {"$set": update_fields},
                upsert=True
            )
            upserted_count += 1
        except Exception as e:
            logger.warning(f"Failed to upsert patent {patent_num} to Mongo: {e}")

    return upserted_count


def search_cached_patents(query: str, page: int = 1, size: int = 20):
    """
    Searches cached patent records in MongoDB matching the query string.
    Sorts by grant_year (integer) descending for consistent ordering.
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


def _determine_data_source_label():
    """
    Returns a concise, honest label describing the active data source.
    Since the USPTO ODP API requires a key that is currently unconfigured,
    this helper checks key presence so callers can report status accurately.
    """
    api_key = os.getenv("USPTO_API_KEY")
    if not api_key:
        return "USPTO API key not configured"
    return "USPTO API key present but request failed"


def _determine_cache_provenance(records):
    """
    Determines source provenance for cached patent records.
    Returns 'PatentsView' for bulk-imported data, or 'USPTO Open Data Portal'
    only if verified by the record source.
    """
    if not records:
        return "PatentsView"
    for r in records:
        src = str(r.get("source") or "")
        if "PatentsView" in src:
            return "PatentsView"
        if "USPTO Live Data" in src:
            return "USPTO Open Data Portal"
    return "PatentsView"


# ---------------------------------------------------------------------------
# Primary search with fallback
# ---------------------------------------------------------------------------

def search_patents_with_fallback(query: str, page: int = 1, size: int = 20):
    """
    Primary service method for patent search:
    1. Attempts live query from USPTO Open Data Portal API.
    2. On success: normalizes, caches, and returns live results with delivery_status='LIVE',
       source_provenance='USPTO Open Data Portal'.
    3. On failure: falls back to MongoDB cached data with delivery_status='CACHED'
       and source_provenance reflecting actual record origin (e.g. 'PatentsView').
    4. If no cached records exist either, raises an informative RuntimeError.
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

        cache_patents_in_mongo(normalized_records)

        return {
            "total": total_hits,
            "page": page,
            "size": size,
            "query": query,
            "delivery_status": "LIVE",
            "source_provenance": "USPTO Open Data Portal",
            "source": "USPTO Live Data",
            "source_detail": "Live data from USPTO Open Data Portal",
            "is_cached": False,
            "results": normalized_records
        }

    except Exception as e:
        live_error = str(e)
        logger.warning(f"Live patent API failed: {live_error}. Falling back to MongoDB cache.")

    # ---- Fallback to local MongoDB cache ------------------------------------
    total, cached_records = search_cached_patents(query, page, size)

    provenance = _determine_cache_provenance(cached_records)
    api_key_present = bool(os.getenv("USPTO_API_KEY"))
    if not api_key_present:
        warning_msg = (
            f"Live USPTO data is unavailable: USPTO_API_KEY is not configured. "
            f"Showing cached patent records from {provenance}."
        )
    else:
        warning_msg = (
            f"Live USPTO data is temporarily unavailable ({live_error}). "
            f"Showing cached patent records from {provenance}."
        )

    if cached_records or query == "":
        return {
            "total": total,
            "page": page,
            "size": size,
            "query": query,
            "delivery_status": "CACHED",
            "source_provenance": provenance,
            "source": f"{provenance} (Cached)",
            "source_detail": warning_msg,
            "is_cached": True,
            "warning": warning_msg,
            "results": cached_records
        }

    raise RuntimeError(
        f"Unable to fetch live USPTO patents and no matching cached records found. {live_error}"
    )