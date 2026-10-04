from fastapi import APIRouter, HTTPException, Query

from app.database.connection import db

from app.services.funding_service import (
    search_funding,
    format_funding_results
)


router = APIRouter(
    prefix="/api/funding",
    tags=["Funding Intelligence"]
)


funding_collection = db[
    "funding_projects"
]


@router.get("/search")
async def funding_search(

    q: str = Query(
        ...,
        min_length=2,
        description="Funding research topic"
    ),

    page: int = Query(
        1,
        ge=1
    ),

    limit: int = Query(
        10,
        ge=1,
        le=50
    )

):

    try:

        data = await search_funding(
            query=q,
            page=page,
            limit=limit
        )


        results = format_funding_results(
            data
        )


        # Save results to MongoDB

        for result in results:

            if not result["application_id"]:
                continue


            funding_collection.update_one(

                {
                    "application_id":
                        result[
                            "application_id"
                        ]
                },

                {
                    "$set": result
                },

                upsert=True

            )


        return {

            "total":
                data.get(
                    "meta",
                    {}
                ).get(
                    "total",
                    data.get(
                        "total",
                        0
                    )
                ),

            "page": page,

            "limit": limit,

            "results": results

        }


    except Exception as error:

        raise HTTPException(

            status_code=500,

            detail=(
                "Funding data retrieval "
                f"failed: {str(error)}"
            )

        )


@router.get("/statistics")
def funding_statistics():

    pipeline = [

        {
            "$group": {

                "_id": None,

                "total_funding": {
                    "$sum": "$award_amount"
                },

                "project_count": {
                    "$sum": 1
                },

                "average_funding": {
                    "$avg": "$award_amount"
                }

            }
        }

    ]


    result = list(
        funding_collection.aggregate(
            pipeline
        )
    )


    if not result:

        return {

            "project_count": 0,

            "total_funding": 0,

            "average_funding": 0

        }


    statistics = result[0]

    statistics.pop(
        "_id",
        None
    )


    return statistics


@router.get("/top-organizations")
def top_organizations():

    pipeline = [

        {
            "$group": {

                "_id": "$organization",

                "total_funding": {
                    "$sum":
                        "$award_amount"
                },

                "project_count": {
                    "$sum": 1
                }

            }
        },

        {
            "$sort": {

                "total_funding": -1

            }

        },

        {
            "$limit": 10
        }

    ]


    results = list(
        funding_collection.aggregate(
            pipeline
        )
    )


    for result in results:

        result["organization"] = (
            result.pop("_id")
        )


    return {

        "results": results

    }


@router.get("/{application_id}")
def get_funding_project(
    application_id: int
):

    result = funding_collection.find_one({

        "application_id":
            application_id

    })


    if not result:

        raise HTTPException(

            status_code=404,

            detail="Funding project not found"

        )


    result["_id"] = str(
        result["_id"]
    )


    return result