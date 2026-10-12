from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.database.connection import db
from app.services.research_aggregator_service import aggregate_research
from app.services.semantic_search_service import get_semantic_service

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


@router.get("/related")
async def get_related_research_by_query(
    work_id: str = Query(..., description="ID or DOI of publication to find semantically related research for"),
    limit: int = Query(6, ge=1, le=20)
):
    """Find semantically similar research records using FAISS vector similarity."""
    clean_id = work_id.strip()
    semantic_svc = get_semantic_service()
    related = semantic_svc.get_related_research(work_id=clean_id, top_k=limit)
    return {
        "work_id": clean_id,
        "count": len(related),
        "results": related
    }


from app.services.research_trend_service import get_research_trend_service


@router.get("/trends")
async def get_publication_trends(
    q: Optional[str] = Query(None, description="Optional search term to filter publications"),
    topic: Optional[str] = Query(None, description="Specific topic/concept filter"),
    start_year: Optional[int] = Query(None, description="Earliest publication year"),
    end_year: Optional[int] = Query(None, description="Latest publication year"),
    granularity: str = Query("annual", pattern="^(annual|monthly)$", description="Timeline granularity"),
    source: Optional[str] = Query(None, description="Filter by data provider (OpenAlex, Crossref, Semantic Scholar)")
):
    """
    Retrieve publication time-series trends, period-over-period growth,
    and citation trends based on deduplicated research records.
    """
    try:
        trend_svc = get_research_trend_service()
        # If query supplied and cache has few results, try to fetch live records first
        if q and q.strip():
            existing_count = research_collection.count_documents({
                "$or": [
                    {"search_queries": q.strip().lower()},
                    {"title": {"$regex": q.strip(), "$options": "i"}},
                    {"topics": {"$regex": q.strip(), "$options": "i"}},
                    {"concepts": {"$regex": q.strip(), "$options": "i"}}
                ]
            })
            if existing_count < 5:
                try:
                    await aggregate_research(query=q.strip(), per_page=15)
                except Exception:
                    pass

        return trend_svc.get_publication_trends(
            query=q,
            topic=topic,
            start_year=start_year,
            end_year=end_year,
            granularity=granularity,
            source=source
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Publication trends calculation failed: {str(error)}"
        )


@router.get("/trends/emerging")
async def get_emerging_topics(
    q: Optional[str] = Query(None, description="Optional search term to scope analysis"),
    min_volume: int = Query(3, ge=1, le=50, description="Minimum publication threshold for trend calculation"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of ranked topics to return")
):
    """
    Detect emerging topics by comparing publication activity across comparable time windows.
    Returns explainable ranking with formula, thresholds, and evidence rationales.
    """
    try:
        trend_svc = get_research_trend_service()
        if q and q.strip():
            existing_count = research_collection.count_documents({
                "$or": [
                    {"search_queries": q.strip().lower()},
                    {"title": {"$regex": q.strip(), "$options": "i"}},
                    {"topics": {"$regex": q.strip(), "$options": "i"}},
                    {"concepts": {"$regex": q.strip(), "$options": "i"}}
                ]
            })
            if existing_count < 5:
                try:
                    await aggregate_research(query=q.strip(), per_page=15)
                except Exception:
                    pass

        return trend_svc.get_emerging_topics(
            query=q,
            min_volume=min_volume,
            limit=limit
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Emerging topic detection failed: {str(error)}"
        )


@router.get("/trends/hotspots")
async def get_research_hotspots(
    q: Optional[str] = Query(None, description="Optional search query filter"),
    limit: int = Query(12, ge=1, le=50, description="Maximum number of hotspots to return")
):
    """
    Identify research hotspots with high publication volume, leading institutions,
    researchers, and source provenance.
    """
    try:
        trend_svc = get_research_trend_service()
        if q and q.strip():
            existing_count = research_collection.count_documents({
                "$or": [
                    {"search_queries": q.strip().lower()},
                    {"title": {"$regex": q.strip(), "$options": "i"}},
                    {"topics": {"$regex": q.strip(), "$options": "i"}},
                    {"concepts": {"$regex": q.strip(), "$options": "i"}}
                ]
            })
            if existing_count < 5:
                try:
                    await aggregate_research(query=q.strip(), per_page=15)
                except Exception:
                    pass

        return trend_svc.get_research_hotspots(
            query=q,
            limit=limit
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Research hotspots retrieval failed: {str(error)}"
        )


@router.get("/trends/topics/{topic:path}")
async def get_topic_analytics(
    topic: str,
    limit: int = Query(10, ge=1, le=50, description="Maximum supporting publications to return")
):
    """
    Detailed analytics for an individual research topic:
    timeline, citation metrics, related topics, leading institutions/authors,
    supporting publications, and cross-module connections (Patents & Funding).
    """
    try:
        trend_svc = get_research_trend_service()
        result = trend_svc.get_topic_analysis(
            topic=topic,
            limit_publications=limit
        )
        if not result.get("found"):
            raise HTTPException(
                status_code=404,
                detail=result.get("message", f"Topic '{topic}' not found in research literature.")
            )
        return result
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Topic analysis failed: {str(error)}"
        )


@router.get("/{work_id:path}")
async def get_research_work(
    work_id: str,
    limit: int = Query(6, ge=1, le=20)
):
    clean_id = work_id.strip()

    # If requested as /{work_id}/related
    if clean_id.endswith("/related"):
        actual_id = clean_id[:-8]
        semantic_svc = get_semantic_service()
        related = semantic_svc.get_related_research(work_id=actual_id, top_k=limit)
        return {
            "work_id": actual_id,
            "count": len(related),
            "results": related
        }

    # Lookup by openalex_id, unified id, or doi
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