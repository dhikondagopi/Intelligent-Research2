from fastapi import APIRouter, HTTPException, Query

from app.database.connection import db

from app.services.openalex_service import (
    search_openalex,
    format_openalex_results
)


router = APIRouter(
    prefix="/api/research",
    tags=["Research Intelligence"]
)


research_collection = db[
    "research_works"
]


@router.get("/search")
async def search_research(
    q: str = Query(
        ...,
        min_length=2,
        description="Research topic"
    ),
    page: int = Query(
        1,
        ge=1
    ),
    per_page: int = Query(
        10,
        ge=1,
        le=50
    )
):

    try:

        data = await search_openalex(
            search=q,
            page=page,
            per_page=per_page
        )

        results = format_openalex_results(
            data
        )


        for result in results:

            research_collection.update_one(
                {
                    "openalex_id":
                        result["id"]
                },
                {
                    "$set": {
                        "openalex_id":
                            result["id"],
                        **result
                    }
                },
                upsert=True
            )


        return {
            "total": data.get(
                "meta",
                {}
            ).get(
                "count",
                0
            ),

            "page": page,

            "per_page": per_page,

            "results": results
        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Research data retrieval "
                f"failed: {str(error)}"
            )
        )


@router.get("/trending")
async def trending_research():

    pipeline = [

        {
            "$sort": {
                "cited_by_count": -1
            }
        },

        {
            "$limit": 10
        }

    ]


    results = list(
        research_collection.aggregate(
            pipeline
        )
    )


    for result in results:

        result["_id"] = str(
            result["_id"]
        )


    return {
        "count": len(results),
        "results": results
    }


@router.get("/{openalex_id:path}")
async def get_research_work(
    openalex_id: str
):

    result = research_collection.find_one({
        "openalex_id":
            openalex_id
    })


    if not result:

        raise HTTPException(
            status_code=404,
            detail="Research work not found"
        )


    result["_id"] = str(
        result["_id"]
    )


    return result