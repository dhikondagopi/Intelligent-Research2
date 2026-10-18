import httpx


REPORTER_URL = (
    "https://api.reporter.nih.gov/v2/projects/search"
)


async def search_funding(
    query: str,
    page: int = 1,
    limit: int = 10
):

    offset = (page - 1) * limit

    payload = {

        "criteria": {

            "advanced_text_search": {

                "operator": "and",

                "search_field":
                    "projecttitle,terms,abstracttext",

                "search_text": query

            }

        },

        "offset": offset,

        "limit": limit,

        "sort_field": "project_start_date",

        "sort_order": "desc"

    }

    try:
        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.post(
                REPORTER_URL,
                json=payload
            )

            response.raise_for_status()

            data = response.json()

            # Ensure data is a dict and results is a list (never None)
            if not isinstance(data, dict):
                return {"results": [], "meta": {"total": 0}}

            if data.get("results") is None:
                data["results"] = []

            return data

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"NIH RePORTER API returned {exc.response.status_code}: {exc.response.text[:200]}"
        ) from exc
    except httpx.RequestError as exc:
        raise RuntimeError(
            f"NIH RePORTER API request failed: {exc}"
        ) from exc


def format_funding_results(data):

    results = []

    if not data or not isinstance(data, dict):
        return results

    raw_results = data.get("results")

    # Guard: results may be None if API returns null
    if not raw_results:
        return results

    for project in raw_results:

        if not isinstance(project, dict):
            continue

        # Organization data is nested inside an "organization" object
        org = project.get("organization") or {}
        if not isinstance(org, dict):
            org = {}

        investigators = []

        pi_list = project.get("principal_investigators")
        if pi_list and isinstance(pi_list, list):
            for investigator in pi_list:

                if isinstance(
                    investigator,
                    dict
                ):

                    name = investigator.get(
                        "full_name"
                    )

                    if name:
                        investigators.append(
                            name.strip()
                        )

                elif isinstance(
                    investigator,
                    str
                ):

                    investigators.append(
                        investigator.strip()
                    )

        results.append({

            "application_id":
                project.get(
                    "appl_id"
                ),

            "project_number":
                project.get(
                    "project_num"
                ),

            "title":
                project.get(
                    "project_title"
                ),

            "abstract":
                project.get(
                    "abstract_text"
                ),

            # Correct: org data is inside the nested "organization" object
            "organization":
                org.get("org_name"),

            "country":
                org.get("org_country"),

            "state":
                org.get("org_state"),

            "fiscal_year":
                project.get(
                    "fiscal_year"
                ),

            "award_amount": (
                int(float(project["award_amount"]))
                if project.get("award_amount") is not None and str(project.get("award_amount")).strip().replace(".", "", 1).replace("-", "", 1).isdigit()
                else (int(project["award_amount"]) if isinstance(project.get("award_amount"), (int, float)) else 0)
            ),

            "funding_mechanism":
                project.get(
                    "funding_mechanism"
                ),

            "activity_code":
                project.get(
                    "activity_code"
                ),

            "principal_investigators":
                list(
                    dict.fromkeys(
                        investigators
                    )
                )

        })


    return results