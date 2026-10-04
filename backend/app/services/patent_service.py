import os
import httpx
from dotenv import load_dotenv

load_dotenv()

PATENT_API_URL = (
    "https://api.uspto.gov/api/v1/patent/applications/search"
)


def get_headers():
    api_key = os.getenv("USPTO_API_KEY")

    if not api_key:
        raise RuntimeError(
            "USPTO_API_KEY is missing from backend/.env"
        )

    return {
        "accept": "application/json",
        "X-API-KEY": api_key
    }


async def search_patents(
    query: str,
    page: int = 1,
    size: int = 20
):
    headers = get_headers()

    offset = (page - 1) * size

    params = {
        "q": query,
        "offset": offset,
        "limit": size
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            PATENT_API_URL,
            params=params,
            headers=headers
        )

        if response.status_code == 401:
            raise RuntimeError(
                "USPTO API authentication failed. "
                "Check USPTO_API_KEY."
            )

        if response.status_code == 403:
            raise RuntimeError(
                "USPTO API access forbidden. "
                "Check your USPTO API key and account access."
            )

        response.raise_for_status()

        return response.json()


def _first_value(data, keys):
    for key in keys:
        value = data.get(key)

        if value is not None and value != "":
            return value

    return None


def _extract_name(item):
    if not isinstance(item, dict):
        return str(item)

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

    if not isinstance(items, list):
        return organizations

    for item in items:
        if not isinstance(item, dict):
            continue

        organization = (
            item.get("organizationName")
            or item.get("organization")
            or item.get("assigneeOrganizationName")
            or item.get("assigneeName")
        )

        if organization:
            organizations.append(str(organization))

    return list(dict.fromkeys(organizations))


def _extract_inventors(items):
    inventors = []

    if not isinstance(items, list):
        return inventors

    for item in items:
        name = _extract_name(item)

        if name:
            inventors.append(name)

    return list(dict.fromkeys(inventors))


def format_patent_results(data):
    """
    Converts USPTO ODP application-search responses
    into the simpler structure used by our frontend.
    """

    raw_results = []

    if isinstance(data, dict):
        for key in [
            "results",
            "patentApplicationData",
            "patentApplicationDataBag",
            "applications",
            "applicationDataBag"
        ]:
            value = data.get(key)

            if isinstance(value, list):
                raw_results = value
                break

    results = []

    for item in raw_results:
        if not isinstance(item, dict):
            continue

        metadata = (
            item.get("applicationMetaData")
            or item.get("applicationMetadata")
            or item.get("applicationData")
            or {}
        )

        if not isinstance(metadata, dict):
            metadata = {}

        patent_id = _first_value(
            metadata,
            [
                "patentNumber",
                "publicationNumber",
                "applicationNumberText"
            ]
        )

        title = _first_value(
            metadata,
            [
                "inventionTitle",
                "inventionTitleText",
                "title"
            ]
        )

        filing_date = _first_value(
            metadata,
            [
                "filingDate",
                "filingDateText"
            ]
        )

        grant_date = _first_value(
            metadata,
            [
                "grantDate",
                "grantDateText"
            ]
        )

        status = _first_value(
            metadata,
            [
                "applicationStatusDescriptionText",
                "applicationStatusText",
                "status"
            ]
        )

        inventors = _extract_inventors(
            item.get("inventorBag")
            or item.get("inventors")
            or []
        )

        assignees = _extract_organizations(
            item.get("assignmentBag")
            or item.get("assigneeBag")
            or item.get("assignees")
            or []
        )

        abstract = _first_value(
            metadata,
            [
                "abstractText",
                "abstract"
            ]
        )

        results.append(
            {
                "patent_id": str(patent_id or ""),
                "patent_title": title,
                "patent_date": grant_date or filing_date,
                "patent_type": status,
                "patent_abstract": abstract,
                "inventors": inventors,
                "assignees": assignees,
                "cpc_sections": []
            }
        )

    return results


def get_total_count(data, result_count):
    if not isinstance(data, dict):
        return result_count

    possible_values = [
        data.get("count"),
        data.get("total"),
        data.get("totalCount"),
        data.get("totalHits")
    ]

    for value in possible_values:
        if isinstance(value, int):
            return value

    return result_count