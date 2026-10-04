from app.database.connection import db


patents_collection = db["patents"]


# ============================================================
# TECHNOLOGY DASHBOARD
# ============================================================

def get_technology_overview():

    total_patents = patents_collection.count_documents({})

    technology_fields = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$technology_field",
                    "patent_count": {
                        "$sum": 1
                    },
                    "inventor_count": {
                        "$sum": "$inventor_count"
                    }
                }
            },
            {
                "$sort": {
                    "patent_count": -1
                }
            },
            {
                "$limit": 15
            }
        ])
    )

    sectors = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_sector": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$technology_sector",
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
        ])
    )

    organizations = list(
        patents_collection.aggregate([
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
        ])
    )

    cpc_sections = list(
        patents_collection.aggregate([
            {
                "$unwind": "$cpc_sections"
            },
            {
                "$group": {
                    "_id": "$cpc_sections",
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
                "$limit": 15
            }
        ])
    )

    return {
        "total_patents": total_patents,

        "technology_fields": [
            {
                "technology": item["_id"],
                "patent_count": item["patent_count"],
                "inventor_count": item.get(
                    "inventor_count",
                    0
                )
            }
            for item in technology_fields
        ],

        "technology_sectors": [
            {
                "sector": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in sectors
        ],

        "organizations": [
            {
                "organization": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in organizations
        ],

        "cpc_sections": [
            {
                "section": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in cpc_sections
        ]
    }


# ============================================================
# EMERGING TECHNOLOGIES
# ============================================================

def get_emerging_technologies():

    technologies = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$technology_field",

                    "patent_count": {
                        "$sum": 1
                    },

                    "organization_count": {
                        "$addToSet": "$assignee"
                    },

                    "inventor_count": {
                        "$sum": "$inventor_count"
                    }
                }
            },
            {
                "$sort": {
                    "patent_count": -1
                }
            },
            {
                "$limit": 20
            }
        ])
    )

    result = []

    for item in technologies:

        organizations = [
            x
            for x in item.get(
                "organization_count",
                []
            )
            if x
        ]

        result.append({
            "technology": item["_id"],

            "patent_count": item.get(
                "patent_count",
                0
            ),

            "organization_count": len(
                organizations
            ),

            "inventor_count": item.get(
                "inventor_count",
                0
            ),

            "indicator": "High patent activity"
        })

    return result


# ============================================================
# TECHNOLOGY DETAILS
# ============================================================

def get_technology_details(
    technology
):

    patent_count = patents_collection.count_documents({
        "technology_field": technology
    })

    organizations = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology,
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
                "$limit": 15
            }
        ])
    )

    cpc_areas = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology
                }
            },
            {
                "$unwind": "$cpc_sections"
            },
            {
                "$group": {
                    "_id": "$cpc_sections",
                    "patent_count": {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    "patent_count": -1
                }
            }
        ])
    )

    inventor_count = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {
                        "$sum": "$inventor_count"
                    }
                }
            }
        ])
    )

    return {
        "technology": technology,

        "patent_count": patent_count,

        "inventor_count": (
            inventor_count[0]["total"]
            if inventor_count
            else 0
        ),

        "organizations": [
            {
                "name": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in organizations
        ],

        "cpc_areas": [
            {
                "section": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in cpc_areas
        ]
    }


# ============================================================
# TECHNOLOGY MATURITY
# ============================================================

def get_technology_maturity(
    technology
):

    patent_count = patents_collection.count_documents({
        "technology_field": technology
    })

    organizations = patents_collection.count_documents({
        "technology_field": technology,
        "assignee": {
            "$nin": [None, ""]
        }
    })

    inventors = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {
                        "$sum": "$inventor_count"
                    }
                }
            }
        ])
    )

    inventor_count = (
        inventors[0]["total"]
        if inventors
        else 0
    )

    # Transparent activity-based maturity proxy
    if patent_count >= 10000:
        stage = "Established"
    elif patent_count >= 3000:
        stage = "Developing"
    elif patent_count >= 1000:
        stage = "Growing"
    else:
        stage = "Early"

    return {
        "technology": technology,
        "maturity_stage": stage,
        "patent_activity": patent_count,
        "organization_activity": organizations,
        "inventor_activity": inventor_count,
        "methodology": (
            "Maturity is estimated using patent activity, "
            "organization activity, and inventor activity. "
            "It is a data-derived proxy, not a formal TRL assessment."
        )
    }


# ============================================================
# TECHNOLOGY ADOPTION
# ============================================================

def get_technology_adoption(
    technology
):

    yearly_data = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology,
                    "grant_year": {
                        "$nin": [None, ""]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$grant_year",
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
                    "_id": 1
                }
            }
        ])
    )

    adoption = []

    for item in yearly_data:

        organizations = [
            x
            for x in item.get(
                "organizations",
                []
            )
            if x
        ]

        adoption.append({
            "year": item["_id"],
            "patent_count": item["patent_count"],
            "organization_count": len(
                organizations
            )
        })

    return {
        "technology": technology,
        "adoption_proxy": adoption,
        "methodology": (
            "Adoption is represented as a proxy using "
            "patent and organization activity. Patent activity "
            "does not directly establish commercial market adoption."
        )
    }


# ============================================================
# INNOVATION OPPORTUNITIES
# ============================================================

def get_technology_opportunities(
    technology=None
):

    if technology:

        data = get_technology_details(
            technology
        )

        opportunities = []

        if data["patent_count"] > 0:

            opportunities.append({
                "technology": technology,
                "title": "Research-to-innovation opportunity",
                "description": (
                    "Significant patent activity indicates "
                    "an active technology area that may "
                    "warrant further research and innovation analysis."
                ),
                "confidence": "Medium",
                "signals": [
                    "Patent activity",
                    "Organization activity",
                    "Inventor activity"
                ]
            })

        return opportunities

    technologies = get_emerging_technologies()

    return [
        {
            "technology": item["technology"],
            "title": "High activity technology area",
            "description": (
                "High patent activity makes this technology "
                "an area for further innovation investigation."
            ),
            "confidence": "Medium",
            "signals": [
                "Patent activity"
            ]
        }
        for item in technologies[:10]
    ]


# ============================================================
# COMPETITIVE TECHNOLOGY MONITORING
# ============================================================

def get_technology_competitors(
    technology
):

    organizations = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology,
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
                "$limit": 20
            }
        ])
    )

    return {
        "technology": technology,
        "competitors": [
            {
                "organization": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in organizations
        ],
        "methodology": (
            "Organizations are ranked by patent activity "
            "within the selected technology field."
        )
    }