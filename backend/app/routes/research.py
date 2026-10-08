from fastapi import APIRouter, HTTPException, Query
from app.database.connection import db
from app.services.research_aggregator_service import aggregate_research
from app.services.openalex_service import search_openalex, format_openalex_results

router = APIRouter(
    prefix="/api/research",
    tags=["Research Intelligence"]
)

research_collection = db["research_works"]


@router.get("/search")
async def search_research(
    q: str = Query(
        ...,
        min_length=2,
        description="Research topic query across OpenAlex, Crossref, and Semantic Scholar"
    ),
    page: int = Query(
        1,
        ge=1
    ),
    per_page: int = Query(
        15,
        ge=1,
        le=50
    )
):
    try:
        # Multi-source concurrent aggregation with normalization, deduplication and caching
        aggregated = await aggregate_research(
            query=q,
            page=page,
            per_page=per_page
        )

        return {
            "total": aggregated.get("total", 0),
            "page": page,
            "per_page": per_page,
            "results": aggregated.get("results", []),
            "meta": aggregated.get("meta", {})
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Research data retrieval failed: {str(error)}"
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


@router.get("/{work_id:path}")
async def get_research_work(
    work_id: str
):
    # Lookup by openalex_id, unified id, or doi
    clean_id = work_id.strip()
    result = research_collection.find_one({
        "$or": [
            {"openalex_id": clean_id},
            {"id": clean_id},
            {"doi": clean_id}
        ]
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