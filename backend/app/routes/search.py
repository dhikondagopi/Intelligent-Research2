import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from fastapi import APIRouter, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.connection import db
from app.services.research_aggregator_service import aggregate_research
from app.services.patent_service import search_patents_with_fallback
from app.services.funding_service import search_funding, format_funding_results
from app.core.security import decode_access_token

router = APIRouter(
    prefix="/api/search",
    tags=["Global Search"]
)

optional_security = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Optional[Dict[str, Any]]:
    """Extract authenticated user if bearer token is provided, without failing if missing."""
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        return payload
    except Exception:
        return None


patents_col = db["patents"]
funding_col = db["funding_projects"]
research_col = db["research_works"]
users_col = db["users"]
profiles_col = db["research_profiles"]


@router.get("")
@router.get("/")
async def global_search(
    q: str = Query(..., min_length=1, description="Global search query across research, patents, grants, etc."),
    type: Optional[str] = Query(None, description="Optional category filter: all, research, patents, funding, technology, organizations, researchers"),
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    query_str = q.strip()
    category = (type or "all").strip().lower()

    # Containers for results
    research_results: List[Dict[str, Any]] = []
    patent_results: List[Dict[str, Any]] = []
    funding_results: List[Dict[str, Any]] = []
    tech_results: List[Dict[str, Any]] = []
    org_results: List[Dict[str, Any]] = []
    researcher_results: List[Dict[str, Any]] = []

    research_meta: Dict[str, Any] = {
        "sources": [],
        "source_status": {},
        "counts": {},
        "errors": {}
    }

    # Helper search functions
    async def fetch_research():
        nonlocal research_results, research_meta
        if category in ("all", "research"):
            try:
                data = await aggregate_research(query=query_str, page=page, per_page=per_page)
                research_results = data.get("results", [])
                research_meta = data.get("meta", {})
            except Exception as e:
                research_meta["errors"] = {"aggregator": str(e)}

    async def fetch_patents():
        nonlocal patent_results
        if category in ("all", "patents"):
            try:
                # search_patents_with_fallback is sync, run in executor
                loop = asyncio.get_event_loop()
                data = await loop.run_in_executor(
                    None,
                    lambda: search_patents_with_fallback(query=query_str, page=page, size=min(per_page, 20))
                )
                patent_results = data.get("patents", [])
            except Exception as e:
                print(f"[Patent Search Error in Global Search] {e}")

    async def fetch_funding():
        nonlocal funding_results
        if category in ("all", "funding"):
            try:
                raw_data = await search_funding(query=query_str, page=page, limit=min(per_page, 20))
                funding_results = format_funding_results(raw_data)
            except Exception as e:
                # Fallback to local MongoDB funding_projects
                try:
                    cursor = funding_col.find({
                        "$or": [
                            {"title": {"$regex": query_str, "$options": "i"}},
                            {"abstract": {"$regex": query_str, "$options": "i"}},
                            {"agency": {"$regex": query_str, "$options": "i"}},
                            {"organization": {"$regex": query_str, "$options": "i"}}
                        ]
                    }).limit(per_page)
                    for item in cursor:
                        item.pop("_id", None)
                        funding_results.append(item)
                except Exception:
                    pass

    async def fetch_technologies():
        nonlocal tech_results
        if category in ("all", "technology", "technologies"):
            try:
                pipeline = [
                    {
                        "$match": {
                            "$or": [
                                {"technology_field": {"$regex": query_str, "$options": "i"}},
                                {"technology_sector": {"$regex": query_str, "$options": "i"}},
                                {"title": {"$regex": query_str, "$options": "i"}}
                            ]
                        }
                    },
                    {
                        "$group": {
                            "_id": "$technology_field",
                            "sector": {"$first": "$technology_sector"},
                            "patent_count": {"$sum": 1},
                            "sample_titles": {"$push": "$title"}
                        }
                    },
                    {"$match": {"_id": {"$nin": [None, ""]}}},
                    {"$sort": {"patent_count": -1}},
                    {"$limit": 10}
                ]
                loop = asyncio.get_event_loop()
                rows = await loop.run_in_executor(None, lambda: list(patents_col.aggregate(pipeline)))
                for row in rows:
                    field_name = row["_id"]
                    tech_results.append({
                        "name": field_name,
                        "field": field_name,
                        "sector": row.get("sector") or "General Technology",
                        "patent_count": row.get("patent_count", 0),
                        "source": "Patent Classification",
                        "samples": (row.get("sample_titles") or [])[:3]
                    })
            except Exception as e:
                print(f"[Tech Search Error] {e}")

    async def fetch_organizations():
        nonlocal org_results
        if category in ("all", "organizations", "organization"):
            try:
                pipeline = [
                    {
                        "$match": {
                            "assignee": {"$regex": query_str, "$options": "i"}
                        }
                    },
                    {
                        "$group": {
                            "_id": "$assignee",
                            "patent_count": {"$sum": 1},
                            "sectors": {"$addToSet": "$technology_sector"}
                        }
                    },
                    {"$match": {"_id": {"$nin": [None, ""]}}},
                    {"$sort": {"patent_count": -1}},
                    {"$limit": 10}
                ]
                loop = asyncio.get_event_loop()
                orgs = await loop.run_in_executor(None, lambda: list(patents_col.aggregate(pipeline)))
                for o in orgs:
                    org_results.append({
                        "name": o["_id"],
                        "type": "Patent Assignee",
                        "patent_count": o.get("patent_count", 0),
                        "sectors": [s for s in (o.get("sectors") or []) if s][:4],
                        "source": "USPTO & Patent Index"
                    })
            except Exception as e:
                print(f"[Org Search Error] {e}")

    async def fetch_researchers():
        nonlocal researcher_results
        if category in ("all", "researchers", "researcher"):
            try:
                # 1. Search existing user research profiles
                profiles = list(profiles_col.find({
                    "$or": [
                        {"affiliation": {"$regex": query_str, "$options": "i"}},
                        {"department": {"$regex": query_str, "$options": "i"}},
                        {"research_interests": {"$regex": query_str, "$options": "i"}},
                        {"skills": {"$regex": query_str, "$options": "i"}}
                    ]
                }).limit(5))

                for prof in profiles:
                    u_id = prof.get("user_id")
                    u_name = "Researcher"
                    if u_id:
                        user_doc = users_col.find_one({"_id": prof["_id"]}) or {}
                        u_name = user_doc.get("name", "Researcher")
                    researcher_results.append({
                        "name": u_name,
                        "affiliation": prof.get("affiliation", ""),
                        "department": prof.get("department", ""),
                        "interests": prof.get("research_interests", []),
                        "orcid": prof.get("orcid", ""),
                        "source": "Platform Profiles"
                    })

                # 2. Extract matching authors from patents
                pipeline = [
                    {
                        "$match": {
                            "inventors": {"$regex": query_str, "$options": "i"}
                        }
                    },
                    {"$unwind": "$inventors"},
                    {
                        "$match": {
                            "inventors": {"$regex": query_str, "$options": "i"}
                        }
                    },
                    {
                        "$group": {
                            "_id": "$inventors",
                            "patents": {"$sum": 1},
                            "last_assignee": {"$last": "$assignee"}
                        }
                    },
                    {"$sort": {"patents": -1}},
                    {"$limit": 8}
                ]
                loop = asyncio.get_event_loop()
                inventors = await loop.run_in_executor(None, lambda: list(patents_col.aggregate(pipeline)))
                for inv in inventors:
                    if inv["_id"]:
                        researcher_results.append({
                            "name": inv["_id"],
                            "affiliation": inv.get("last_assignee") or "Inventor",
                            "patents_count": inv.get("patents", 0),
                            "interests": [],
                            "source": "Patent Inventors"
                        })
            except Exception as e:
                print(f"[Researcher Search Error] {e}")

    # Run tasks concurrently
    await asyncio.gather(
        fetch_research(),
        fetch_patents(),
        fetch_funding(),
        fetch_technologies(),
        fetch_organizations(),
        fetch_researchers()
    )

    # Compile source list and counts
    active_sources = list(research_meta.get("sources") or [])
    if patent_results:
        active_sources.append("USPTO Patents")
    if funding_results:
        active_sources.append("Federal RePORTER")
    if tech_results or org_results or researcher_results:
        active_sources.append("Knowledge Graph")

    total_items = (
        len(research_results) +
        len(patent_results) +
        len(funding_results) +
        len(tech_results) +
        len(org_results) +
        len(researcher_results)
    )

    counts = {
        "total": total_items,
        "research": len(research_results),
        "patents": len(patent_results),
        "funding": len(funding_results),
        "technologies": len(tech_results),
        "organizations": len(org_results),
        "researchers": len(researcher_results),
    }

    return {
        "query": query_str,
        "category": category,
        "research": research_results,
        "patents": patent_results,
        "funding": funding_results,
        "technologies": tech_results,
        "organizations": org_results,
        "researchers": researcher_results,
        "meta": {
            "sources": list(dict.fromkeys(active_sources)),
            "source_status": research_meta.get("source_status") or {
                "OpenAlex": "LIVE",
                "Crossref": "LIVE",
                "Semantic Scholar": "LIVE"
            },
            "counts": counts,
            "errors": research_meta.get("errors") or {},
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    }
