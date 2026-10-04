from fastapi import APIRouter, HTTPException, Query
from app.database.connection import db


router = APIRouter(
    prefix="/api/patents",
    tags=["Patent Intelligence"]
)

patents_collection = db["patents"]


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

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
        description="Search patent number, assignee, technology field or sector"
    ),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * size

    query = q.strip()

    if query:
        search_filter = {
            "$or": [
                {
                    "patent_number": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "assignee": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "wipo_field": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "wipo_sector": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "country": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "state": {
                        "$regex": query,
                        "$options": "i"
                    }
                }
            ]
        }
    else:
        search_filter = {}

    total = patents_collection.count_documents(
        search_filter
    )

    patents = list(
        patents_collection
        .find(search_filter)
        .sort("grant_year", -1)
        .skip(skip)
        .limit(size)
    )

    results = [
        serialize_patent(patent)
        for patent in patents
    ]

    return {
        "total": total,
        "page": page,
        "size": size,
        "query": query,
        "results": results
    }


# ---------------------------------------------------------
# Statistics
# ---------------------------------------------------------

@router.get("/statistics")
def patent_statistics():

    total_patents = patents_collection.count_documents({})

    # Top organizations
    organizations_pipeline = [
        {
            "$match": {
                "assignee": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$assignee",
                "patent_count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": 10
        }
    ]

    organizations = list(
        patents_collection.aggregate(
            organizations_pipeline
        )
    )

    top_organizations = [
        {
            "organization": item["_id"],
            "patent_count": item["patent_count"]
        }
        for item in organizations
    ]

    # WIPO technology fields
    technology_pipeline = [
        {
            "$match": {
                "wipo_field": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$wipo_field",
                "patent_count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": 10
        }
    ]

    technologies = list(
        patents_collection.aggregate(
            technology_pipeline
        )
    )

    top_technologies = [
        {
            "technology": item["_id"],
            "patent_count": item["patent_count"]
        }
        for item in technologies
    ]

    # WIPO sectors
    sector_pipeline = [
        {
            "$match": {
                "wipo_sector": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$wipo_sector",
                "patent_count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": 10
        }
    ]

    sectors = list(
        patents_collection.aggregate(
            sector_pipeline
        )
    )

    top_sectors = [
        {
            "sector": item["_id"],
            "patent_count": item["patent_count"]
        }
        for item in sectors
    ]

    # Countries
    country_pipeline = [
        {
            "$match": {
                "country": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$country",
                "patent_count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": 10
        }
    ]

    countries = list(
        patents_collection.aggregate(
            country_pipeline
        )
    )

    top_countries = [
        {
            "country": item["_id"],
            "patent_count": item["patent_count"]
        }
        for item in countries
    ]

    # Grant years
    yearly_pipeline = [
        {
            "$match": {
                "grant_year": {
                    "$ne": None
                }
            }
        },
        {
            "$group": {
                "_id": "$grant_year",
                "patent_count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]

    yearly = list(
        patents_collection.aggregate(
            yearly_pipeline
        )
    )

    yearly_activity = [
        {
            "year": item["_id"],
            "patent_count": item["patent_count"]
        }
        for item in yearly
    ]

    return {
        "total_patents": total_patents,
        "top_organizations": top_organizations,
        "top_technologies": top_technologies,
        "top_sectors": top_sectors,
        "top_countries": top_countries,
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
        {
            "$match": {
                "wipo_field": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$wipo_field",
                "patent_count": {
                    "$sum": 1
                },
                "organizations": {
                    "$addToSet": "$assignee"
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": limit
        }
    ]

    data = list(
        patents_collection.aggregate(pipeline)
    )

    results = []

    for item in data:

        organizations = [
            organization
            for organization in item.get(
                "organizations",
                []
            )
            if organization
        ]

        results.append({
            "technology": item["_id"],
            "patent_count": item["patent_count"],
            "organization_count": len(
                organizations
            )
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
        {
            "$match": {
                "assignee": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$assignee",
                "patent_count": {
                    "$sum": 1
                },
                "technology_fields": {
                    "$addToSet": "$wipo_field"
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": limit
        }
    ]

    data = list(
        patents_collection.aggregate(pipeline)
    )

    results = []

    for item in data:

        technologies = [
            technology
            for technology in item.get(
                "technology_fields",
                []
            )
            if technology
        ]

        results.append({
            "organization": item["_id"],
            "patent_count": item["patent_count"],
            "technology_count": len(
                technologies
            ),
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
        {
            "$match": {
                "country": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$country",
                "patent_count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "patent_count": -1
            }
        },
        {
            "$limit": limit
        }
    ]

    data = list(
        patents_collection.aggregate(pipeline)
    )

    results = [
        {
            "country": item["_id"],
            "patent_count": item["patent_count"]
        }
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
        "patent_number": patent_number
    })

    if not patent:
        raise HTTPException(
            status_code=404,
            detail="Patent not found"
        )

    return serialize_patent(patent)