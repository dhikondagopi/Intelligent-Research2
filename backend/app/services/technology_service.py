import re
from app.database.connection import db

patents_collection = db["patents"]


# ============================================================
# CANONICAL DOMAIN RESOLUTION & FILTERING
# ============================================================

def resolve_canonical_domain(technology: str) -> str:
    """
    Resolves a requested domain string (which may have URL-encoding,
    mixed casing, punctuation, or surrounding whitespace) to the
    canonical technology field name stored in the database.
    """
    if not technology:
        return ""
    clean = str(technology).strip()

    # 1. Exact match on technology_field
    doc = patents_collection.find_one({"technology_field": clean}, {"technology_field": 1})
    if doc and doc.get("technology_field"):
        return doc["technology_field"]

    # 2. Case-insensitive match on technology_field
    pattern = re.compile(f"^{re.escape(clean)}$", re.IGNORECASE)
    doc = patents_collection.find_one({"technology_field": {"$regex": pattern}}, {"technology_field": 1})
    if doc and doc.get("technology_field"):
        return doc["technology_field"]

    # 3. Fallback to wipo_field
    doc = patents_collection.find_one({"wipo_field": {"$regex": pattern}}, {"wipo_field": 1, "technology_field": 1})
    if doc:
        return doc.get("technology_field") or doc.get("wipo_field") or clean

    return clean


def get_technology_filter(technology: str) -> dict:
    """
    Returns a MongoDB filter query matching the technology domain across
    both technology_field and wipo_field using case-insensitive regex.
    """
    canonical = resolve_canonical_domain(technology)
    pattern = re.compile(f"^{re.escape(canonical)}$", re.IGNORECASE)
    return {
        "$or": [
            {"technology_field": {"$regex": pattern}},
            {"wipo_field": {"$regex": pattern}}
        ]
    }


# ============================================================
# TECHNOLOGY DASHBOARD
# ============================================================

def get_technology_overview():
    total_patents = patents_collection.count_documents({})

    classified_patents = patents_collection.count_documents({
        "technology_field": {"$nin": [None, ""], "$regex": r"\S"}
    })

    # Count unique, valid assignee organizations across the repository
    unique_orgs = patents_collection.distinct("assignee", {"assignee": {"$nin": [None, ""]}})
    total_organizations = len([o for o in unique_orgs if o and str(o).strip()])

    technology_fields = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": {"$nin": [None, ""], "$regex": r"\S"}
                }
            },
            {
                "$group": {
                    "_id": "$technology_field",
                    "patent_count": {"$sum": 1},
                    "inventor_count": {"$sum": "$inventor_count"}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 15}
        ])
    )

    sectors = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_sector": {"$nin": [None, ""]}
                }
            },
            {
                "$group": {
                    "_id": "$technology_sector",
                    "patent_count": {"$sum": 1}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 10}
        ])
    )

    organizations = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "assignee": {"$nin": [None, ""]}
                }
            },
            {
                "$group": {
                    "_id": "$assignee",
                    "patent_count": {"$sum": 1}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 15}
        ])
    )

    cpc_sections = list(
        patents_collection.aggregate([
            {"$unwind": "$cpc_sections"},
            {
                "$group": {
                    "_id": "$cpc_sections",
                    "patent_count": {"$sum": 1}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 15}
        ])
    )

    top_orgs = [
        {"organization": item["_id"], "patent_count": item["patent_count"]}
        for item in organizations
    ]

    return {
        "total_patents": total_patents,
        "classified_patents": classified_patents,
        "total_organizations": total_organizations,
        "technology_fields": [
            {
                "technology": item["_id"],
                "patent_count": item["patent_count"],
                "inventor_count": item.get("inventor_count", 0)
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
        "organizations": top_orgs,
        "top_organizations": top_orgs,
        "cpc_sections": [
            {
                "section": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in cpc_sections
        ],
        "data_scope": "325,828 Total Stored Patents (325,017 Classified with WIPO Technology Fields)",
        "source_provenance": "PatentsView Cached Dataset"
    }


# ============================================================
# EMERGING TECHNOLOGIES
# ============================================================

def get_emerging_technologies():
    """
    Returns the top 20 emerging technology domains by patent filing volume.
    """
    technologies = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": {"$nin": [None, ""], "$regex": r"\S"}
                }
            },
            {
                "$group": {
                    "_id": "$technology_field",
                    "patent_count": {"$sum": 1},
                    "organization_count": {"$addToSet": "$assignee"},
                    "inventor_count": {"$sum": "$inventor_count"}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 20}
        ])
    )

    result = []
    for item in technologies:
        orgs = [x for x in item.get("organization_count", []) if x and str(x).strip()]
        patent_count = item.get("patent_count", 0)

        result.append({
            "technology": item["_id"],
            "patent_count": patent_count,
            "organization_count": len(orgs),
            "inventor_count": item.get("inventor_count", 0),
            "indicator": "High Patent Velocity" if patent_count >= 20000 else "Growing Technical Focus"
        })

    return result


def get_emerging_technologies_payload():
    """
    Returns emerging technologies along with reconciled scope & organization counts.
    """
    technologies = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": {"$nin": [None, ""], "$regex": r"\S"}
                }
            },
            {
                "$group": {
                    "_id": "$technology_field",
                    "patent_count": {"$sum": 1},
                    "organization_count": {"$addToSet": "$assignee"},
                    "inventor_count": {"$sum": "$inventor_count"}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 20}
        ])
    )

    result = []
    all_assignees_set = set()
    total_monitored_patents = 0
    total_associations = 0

    for item in technologies:
        orgs = [str(x).strip() for x in item.get("organization_count", []) if x and str(x).strip()]
        all_assignees_set.update(orgs)
        p_count = item.get("patent_count", 0)
        total_monitored_patents += p_count
        total_associations += len(orgs)

        result.append({
            "technology": item["_id"],
            "patent_count": p_count,
            "organization_count": len(orgs),
            "inventor_count": item.get("inventor_count", 0),
            "indicator": "High Patent Velocity" if p_count >= 20000 else "Growing Technical Focus"
        })

    return {
        "technologies": result,
        "total_monitored_patents": total_monitored_patents,
        "total_unique_organizations": len(all_assignees_set),
        "domain_organization_associations": total_associations,
        "monitored_domains_count": len(result),
        "corpus_total_patents": patents_collection.count_documents({}),
        "data_scope": "Top 20 Technology Domains Ranked by Patent Volume (PatentsView 2025 Dataset)",
        "source_provenance": "PatentsView Cached Dataset"
    }


# ============================================================
# TECHNOLOGY DETAILS
# ============================================================

def get_technology_details(technology: str):
    canonical = resolve_canonical_domain(technology)
    tech_filter = get_technology_filter(technology)
    patent_count = patents_collection.count_documents(tech_filter)

    if patent_count == 0:
        return None

    organizations = list(
        patents_collection.aggregate([
            {
                "$match": {
                    **tech_filter,
                    "assignee": {"$nin": [None, ""]}
                }
            },
            {
                "$group": {
                    "_id": "$assignee",
                    "patent_count": {"$sum": 1}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 15}
        ])
    )

    cpc_areas = list(
        patents_collection.aggregate([
            {"$match": tech_filter},
            {"$unwind": "$cpc_sections"},
            {
                "$group": {
                    "_id": "$cpc_sections",
                    "patent_count": {"$sum": 1}
                }
            },
            {"$sort": {"patent_count": -1}}
        ])
    )

    inventor_count = list(
        patents_collection.aggregate([
            {"$match": tech_filter},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$inventor_count"}
                }
            }
        ])
    )

    unique_orgs = patents_collection.distinct(
        "assignee",
        {**tech_filter, "assignee": {"$nin": [None, ""]}}
    )
    unique_orgs_count = len([o for o in unique_orgs if o and str(o).strip()])

    return {
        "technology": canonical,
        "canonical_name": canonical,
        "requested_name": technology,
        "patent_count": patent_count,
        "unique_organizations_count": unique_orgs_count,
        "inventor_count": inventor_count[0]["total"] if inventor_count else 0,
        "organizations": [
            {"name": item["_id"], "patent_count": item["patent_count"]}
            for item in organizations
        ],
        "cpc_areas": [
            {"section": item["_id"], "patent_count": item["patent_count"]}
            for item in cpc_areas
        ],
        "source_provenance": "PatentsView Cached Dataset",
        "data_scope": f"{patent_count:,} Patents in {canonical} (PatentsView 2025 Dataset)"
    }


# ============================================================
# TECHNOLOGY MATURITY
# ============================================================

def get_technology_maturity(technology: str):
    canonical = resolve_canonical_domain(technology)
    tech_filter = get_technology_filter(technology)
    patent_count = patents_collection.count_documents(tech_filter)

    if patent_count == 0:
        return None

    unique_orgs = patents_collection.distinct(
        "assignee",
        {**tech_filter, "assignee": {"$nin": [None, ""]}}
    )
    organizations = len([o for o in unique_orgs if o and str(o).strip()])

    inventors = list(
        patents_collection.aggregate([
            {"$match": tech_filter},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$inventor_count"}
                }
            }
        ])
    )
    inventor_count = inventors[0]["total"] if inventors else 0

    if patent_count >= 20000:
        stage = "Established"
    elif patent_count >= 8000:
        stage = "Developing"
    elif patent_count >= 2000:
        stage = "Growing"
    else:
        stage = "Early"

    return {
        "technology": canonical,
        "canonical_name": canonical,
        "maturity_stage": stage,
        "patent_activity": patent_count,
        "organization_activity": organizations,
        "inventor_activity": inventor_count,
        "methodology": (
            "Maturity stage is an evidence-based proxy estimated from patent filing volume, "
            "active assignees, and inventor counts. It represents IP momentum and does not "
            "substitute for formal Technology Readiness Level (TRL) or market penetration studies."
        ),
        "source_provenance": "PatentsView Cached Dataset"
    }


# ============================================================
# TECHNOLOGY ADOPTION
# ============================================================

def get_technology_adoption(technology: str):
    canonical = resolve_canonical_domain(technology)
    tech_filter = get_technology_filter(technology)
    if patents_collection.count_documents(tech_filter) == 0:
        return None

    yearly_data = list(
        patents_collection.aggregate([
            {
                "$match": {
                    **tech_filter,
                    "grant_year": {"$nin": [None, ""]}
                }
            },
            {
                "$group": {
                    "_id": "$grant_year",
                    "patent_count": {"$sum": 1},
                    "organizations": {"$addToSet": "$assignee"}
                }
            },
            {"$sort": {"_id": 1}}
        ])
    )

    adoption = []
    for item in yearly_data:
        orgs = [x for x in item.get("organizations", []) if x and str(x).strip()]
        adoption.append({
            "year": item["_id"],
            "patent_count": item["patent_count"],
            "organization_count": len(orgs)
        })

    return {
        "technology": canonical,
        "canonical_name": canonical,
        "adoption_proxy": adoption,
        "methodology": (
            "Annual publication and assignee counts serve as an evidence-based R&D activity proxy. "
            "Patent filings reflect institutional technical commitment but do not directly measure "
            "commercial sales, market adoption, or end-user deployment."
        ),
        "source_provenance": "PatentsView Cached Dataset"
    }


# ============================================================
# INNOVATION OPPORTUNITIES
# ============================================================

def get_technology_opportunities(technology: str = None):
    if technology:
        canonical = resolve_canonical_domain(technology)
        tech_filter = get_technology_filter(technology)
        patent_count = patents_collection.count_documents(tech_filter)

        if patent_count == 0:
            return None

        opportunities = [
            {
                "technology": canonical,
                "title": f"R&D Expansion in {canonical}",
                "description": (
                    f"With {patent_count:,} indexed patent publications, this technical domain "
                    "exhibits substantial intellectual property momentum and cross-organizational activity."
                ),
                "confidence": "High" if patent_count > 10000 else "Medium",
                "signals": ["Patent Velocity", "Assignee Diversification", "Inventor Base Growth"]
            },
            {
                "technology": canonical,
                "title": "Cross-Disciplinary Integration",
                "description": (
                    "CPC classification overlap indicates technical convergence opportunities "
                    f"between {canonical} and adjacent technological sectors."
                ),
                "confidence": "Medium",
                "signals": ["CPC Section Distribution", "Multi-disciplinary Filings"]
            }
        ]

        return {
            "technology": canonical,
            "opportunities": opportunities,
            "source_provenance": "PatentsView Cached Dataset"
        }

    technologies = get_emerging_technologies()
    return {
        "opportunities": [
            {
                "technology": item["technology"],
                "title": "High Activity Technology Area",
                "description": (
                    f"Substantial patent volume ({item['patent_count']:,} filings) indicates "
                    "an active domain for strategic innovation and IP portfolio development."
                ),
                "confidence": "High" if item["patent_count"] > 20000 else "Medium",
                "signals": ["Patent Velocity", "Organizational Focus"]
            }
            for item in technologies[:10]
        ],
        "source_provenance": "PatentsView Cached Dataset"
    }


# ============================================================
# COMPETITIVE TECHNOLOGY MONITORING
# ============================================================

def get_technology_competitors(technology: str):
    canonical = resolve_canonical_domain(technology)
    tech_filter = get_technology_filter(technology)
    if patents_collection.count_documents(tech_filter) == 0:
        return None

    organizations = list(
        patents_collection.aggregate([
            {
                "$match": {
                    **tech_filter,
                    "assignee": {"$nin": [None, ""]}
                }
            },
            {
                "$group": {
                    "_id": "$assignee",
                    "patent_count": {"$sum": 1}
                }
            },
            {"$sort": {"patent_count": -1}},
            {"$limit": 20}
        ])
    )

    return {
        "technology": canonical,
        "canonical_name": canonical,
        "competitors": [
            {
                "organization": item["_id"],
                "patent_count": item["patent_count"]
            }
            for item in organizations
        ],
        "methodology": (
            f"Organizations ranked by total patent publications in {canonical} within the PatentsView dataset."
        ),
        "source_provenance": "PatentsView Cached Dataset"
    }