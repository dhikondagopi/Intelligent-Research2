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

            },

            "include_active_projects": True

        },

        "include_fields": [

            "ApplId",
            "ProjectNum",
            "ProjectTitle",
            "AbstractText",
            "OrgName",
            "OrgCountry",
            "OrgState",
            "FiscalYear",
            "AwardAmount",
            "FundingMechanism",
            "ActivityCode",
            "PrincipalInvestigators"

        ],

        "offset": offset,

        "limit": limit,

        "sort_field": "project_start_date",

        "sort_order": "desc"

    }


    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.post(
            REPORTER_URL,
            json=payload
        )

        response.raise_for_status()

        return response.json()


def format_funding_results(data):

    results = []


    for project in data.get(
        "results",
        []
    ):

        investigators = []


        for investigator in project.get(
            "principal_investigators",
            []
        ):

            if isinstance(
                investigator,
                dict
            ):

                name = investigator.get(
                    "full_name"
                )

                if name:
                    investigators.append(
                        name
                    )

            elif isinstance(
                investigator,
                str
            ):

                investigators.append(
                    investigator
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

            "organization":
                project.get(
                    "org_name"
                ),

            "country":
                project.get(
                    "org_country"
                ),

            "state":
                project.get(
                    "org_state"
                ),

            "fiscal_year":
                project.get(
                    "fiscal_year"
                ),

            "award_amount":
                project.get(
                    "award_amount"
                ) or 0,

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