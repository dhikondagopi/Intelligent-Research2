import httpx


OPENALEX_URL = "https://api.openalex.org/works"


async def search_openalex(
    search: str,
    page: int = 1,
    per_page: int = 10
):

    params = {
        "search": search,
        "page": page,
        "per-page": per_page
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            OPENALEX_URL,
            params=params
        )

        response.raise_for_status()

        return response.json()


def format_openalex_results(data):

    results = []

    for work in data.get("results", []):

        authors = []

        for authorship in work.get(
            "authorships",
            []
        ):

            author = authorship.get(
                "author"
            )

            if author and author.get("display_name"):
                authors.append(
                    author["display_name"]
                )


        institutions = []

        for authorship in work.get(
            "authorships",
            []
        ):

            for institution in authorship.get(
                "institutions",
                []
            ):

                name = institution.get(
                    "display_name"
                )

                if name:
                    institutions.append(name)


        concepts = []

        for concept in work.get(
            "concepts",
            []
        ):

            name = concept.get(
                "display_name"
            )

            if name:
                concepts.append(name)


        results.append({

            "id": work.get(
                "id",
                ""
            ),

            "title": work.get(
                "title",
                "Untitled"
            ),

            "publication_year":
                work.get(
                    "publication_year"
                ),

            "doi": work.get(
                "doi"
            ),

            "cited_by_count":
                work.get(
                    "cited_by_count",
                    0
                ),

            "authors": list(
                dict.fromkeys(authors)
            ),

            "institutions": list(
                dict.fromkeys(institutions)
            ),

            "concepts": list(
                dict.fromkeys(concepts)
            )
        })

    return results