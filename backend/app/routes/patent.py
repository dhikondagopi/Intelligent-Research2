from fastapi import APIRouter, HTTPException, Query
from app.database.connection import db
from app.services.patent_service import (
    search_patents_with_fallback,
    normalize_patent_record,
    cache_patents_in_mongo
)

router = APIRouter(
    prefix="/api/patents",
    tags=["Patent Intelligence"]
)

patents_collection = db["patents"]


def serialize_patent(patent):
    if not patent:
        return None
    patent.pop("_id", None)
    return patent


# ---------------------------------------------------------
# Patent Search
# ---------------------------------------------------------

@router.get("/search")
def search_patents(
    q: str = Query(
        "",
        description="Search patent number, title, assignee, technology field, or CPC code"
    ),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    try:
        response_data = search_patents_with_fallback(query=q, page=page, size=size)
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Patent search failed: {str(e)}"
        )


# ---------------------------------------------------------
# Statistics
# ---------------------------------------------------------

@router.get("/statistics")
def patent_statistics():
    total_patents = patents_collection.count_documents({})

    # Top organizations
    organizations_pipeline = [
        {"$match": {"assignee": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$assignee", "patent_count": {"$sum": 1}}},
        {"$sort": {"patent_count": -1}},
        {"$limit": 10}
    ]
    organizations = list(patents_collection.aggregate(organizations_pipeline))
    top_organizations = [
        {"organization": item["_id"], "patent_count": item["patent_count"]}
        for item in organizations
    ]

    # WIPO technology fields
    technology_pipeline = [
        {"$match": {"wipo_field": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$wipo_field", "patent_count": {"$sum": 1}}},
        {"$sort": {"patent_count": -1}},
        {"$limit": 10}
    ]
    technologies = list(patents_collection.aggregate(technology_pipeline))
    top_technologies = [
        {"technology": item["_id"], "patent_count": item["patent_count"]}
        for item in technologies
    ]

    # WIPO sectors
    sector_pipeline = [
        {"$match": {"wipo_sector": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$wipo_sector", "patent_count": {"$sum": 1}}},
        {"$sort": {"patent_count": -1}},
        {"$limit": 10}
    ]
    sectors = list(patents_collection.aggregate(sector_pipeline))
    top_sectors = [
        {"sector": item["_id"], "patent_count": item["patent_count"]}
        for item in sectors
    ]

    # Countries
    country_pipeline = [
        {"$match": {"country": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$country", "patent_count": {"$sum": 1}}},
        {"$sort": {"patent_count": -1}},
        {"$limit": 10}
    ]
    countries = list(patents_collection.aggregate(country_pipeline))
    top_countries = [
        {"country": item["_id"], "patent_count": item["patent_count"]}
        for item in countries
    ]

    # CPC Sections
    cpc_pipeline = [
        {"$match": {"cpc_sections": {"$exists": True, "$nin": [None, [], ""]}}},
        {"$unwind": "$cpc_sections"},
        {"$group": {"_id": "$cpc_sections", "patent_count": {"$sum": 1}}},
        {"$sort": {"patent_count": -1}},
        {"$limit": 10}
    ]
    cpc_items = list(patents_collection.aggregate(cpc_pipeline))
    top_cpc_sections = [
        {"section": item["_id"], "patent_count": item["patent_count"]}
        for item in cpc_items
    ]

    # Grant years
    yearly_pipeline = [
        {"$match": {"grant_year": {"$ne": None}}},
        {"$group": {"_id": "$grant_year", "patent_count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    yearly = list(patents_collection.aggregate(yearly_pipeline))
    yearly_activity = [
        {"year": item["_id"], "patent_count": item["patent_count"]}
        for item in yearly
    ]

    return {
        "total_patents": total_patents,
        "top_organizations": top_organizations,
        "top_technologies": top_technologies,
        "top_sectors": top_sectors,
        "top_countries": top_countries,
        "top_cpc_sections": top_cpc_sections,
        "yearly_activity": yearly_activity
    }


# ---------------------------------------------------------
# Technology Analysis
# ---------------------------------------------------------

@router.get("/technologies")
def patent_technologies(
    limit: int = Query(20, ge=1, le=100)
):
    pipeline = [
        {"$match": {"wipo_field": {"$nin": [None, ""]}}},
        {
            "$group": {
                "_id": "$wipo_field",
                "patent_count": {"$sum": 1},
                "organizations": {"$addToSet": "$assignee"}
            }
        },
        {"$sort": {"patent_count": -1}},
        {"$limit": limit}
    ]

    data = list(patents_collection.aggregate(pipeline))
    results = []
    for item in data:
        organizations = [org for org in item.get("organizations", []) if org]
        results.append({
            "technology": item["_id"],
            "patent_count": item["patent_count"],
            "organization_count": len(organizations)
        })

    return {
        "count": len(results),
        "technologies": results
    }


# ---------------------------------------------------------
# Organizations
# ---------------------------------------------------------

@router.get("/organizations")
def patent_organizations(
    limit: int = Query(20, ge=1, le=100)
):
    pipeline = [
        {"$match": {"assignee": {"$nin": [None, ""]}}},
        {
            "$group": {
                "_id": "$assignee",
                "patent_count": {"$sum": 1},
                "technology_fields": {"$addToSet": "$wipo_field"}
            }
        },
        {"$sort": {"patent_count": -1}},
        {"$limit": limit}
    ]

    data = list(patents_collection.aggregate(pipeline))
    results = []
    for item in data:
        technologies = [tech for tech in item.get("technology_fields", []) if tech]
        results.append({
            "organization": item["_id"],
            "patent_count": item["patent_count"],
            "technology_count": len(technologies),
            "technology_fields": technologies[:10]
        })

    return {
        "count": len(results),
        "organizations": results
    }


# ---------------------------------------------------------
# Geographic Analysis
# ---------------------------------------------------------

@router.get("/geography")
def patent_geography(
    limit: int = Query(20, ge=1, le=100)
):
    pipeline = [
        {"$match": {"country": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$country", "patent_count": {"$sum": 1}}},
        {"$sort": {"patent_count": -1}},
        {"$limit": limit}
    ]

    data = list(patents_collection.aggregate(pipeline))
    results = [
        {"country": item["_id"], "patent_count": item["patent_count"]}
        for item in data
    ]

    return {
        "count": len(results),
        "countries": results
    }


# ---------------------------------------------------------
# Single Patent
# ---------------------------------------------------------

@router.get("/{patent_number}")
def get_patent(patent_number: str):
    patent = patents_collection.find_one({
        "$or": [
            {"patent_number": patent_number},
            {"patent_id": patent_number}
        ]
    })

    if not patent:
        raise HTTPException(
            status_code=404,
            detail="Patent not found"
        )

    return serialize_patent(patent)