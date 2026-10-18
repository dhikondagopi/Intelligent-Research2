import time
import threading
from app.database.connection import db
from app.services.technology_service import (
    resolve_canonical_domain,
    get_technology_filter
)


patents_collection = db["patents"]

# In-memory thread-safe cache for innovation dashboard (5 min TTL)
_dashboard_cache = {"data": None, "timestamp": 0}
_cache_lock = threading.Lock()


def get_patent_activity(technology):
    canonical = resolve_canonical_domain(technology)
    tech_filter = get_technology_filter(technology)

    # Single aggregation pass replaces 3 separate full-collection scans
    agg_res = list(patents_collection.aggregate([
        {"$match": tech_filter},
        {
            "$group": {
                "_id": None,
                "patent_count": {"$sum": 1},
                "organizations": {"$addToSet": "$assignee"},
                "inventor_count": {"$sum": "$inventor_count"}
            }
        }
    ]))

    if agg_res:
        raw_orgs = agg_res[0].get("organizations", [])
        organizations = [item for item in raw_orgs if item and str(item).strip()]
        return {
            "canonical_name": canonical,
            "patent_count": agg_res[0].get("patent_count", 0),
            "organization_count": len(organizations),
            "inventor_count": agg_res[0].get("inventor_count", 0)
        }

    return {
        "canonical_name": canonical,
        "patent_count": 0,
        "organization_count": 0,
        "inventor_count": 0
    }


def calculate_research_novelty(
    patent_count,
    organization_count
):
    if patent_count == 0:
        return 0

    activity = min(
        patent_count / 10000 * 100,
        100
    )

    organization_diversity = min(
        organization_count / 100 * 100,
        100
    )

    # This is an activity-derived proxy.
    # It is not a direct measurement of novelty.
    score = (
        activity * 0.70
        + organization_diversity * 0.30
    )

    return round(score, 2)


def calculate_patent_strength(
    patent_count
):
    if patent_count == 0:
        return 0

    return round(
        min(
            patent_count / 5000 * 100,
            100
        ),
        2
    )


def calculate_technology_maturity(
    patent_count,
    organization_count
):
    if patent_count >= 10000:
        stage = "Established"
        score = 100

    elif patent_count >= 3000:
        stage = "Developing"
        score = 75

    elif patent_count >= 1000:
        stage = "Growing"
        score = 50

    elif patent_count > 0:
        stage = "Early"
        score = 25

    else:
        stage = "Unknown"
        score = 0

    return {
        "stage": stage,
        "score": score
    }


def calculate_market_potential(
    patent_count,
    organization_count
):
    if patent_count == 0:
        return 0

    patent_signal = min(
        patent_count / 10000 * 100,
        100
    )

    organization_signal = min(
        organization_count / 100 * 100,
        100
    )

    return round(
        patent_signal * 0.50
        + organization_signal * 0.50,
        2
    )


def calculate_funding_relevance(
    patent_count,
    organization_count
):
    if patent_count == 0:
        return 0

    score = (
        min(
            patent_count / 10000 * 100,
            100
        ) * 0.60
        +
        min(
            organization_count / 100 * 100,
            100
        ) * 0.40
    )

    return round(score, 2)


def _calculate_score_from_counts(
    canonical: str,
    patent_count: int,
    organization_count: int,
    inventor_count: int = 0
) -> dict:
    research_novelty = calculate_research_novelty(
        patent_count,
        organization_count
    )

    patent_strength = calculate_patent_strength(
        patent_count
    )

    maturity = calculate_technology_maturity(
        patent_count,
        organization_count
    )

    market_potential = calculate_market_potential(
        patent_count,
        organization_count
    )

    funding_relevance = calculate_funding_relevance(
        patent_count,
        organization_count
    )

    innovation_score = (
        research_novelty * 0.30
        + patent_strength * 0.20
        + maturity["score"] * 0.15
        + market_potential * 0.20
        + funding_relevance * 0.15
    )

    if patent_count == 0:
        rating = "Insufficient Data"
        has_data = False
        data_status = "No indexed patent activity for this domain"
    elif innovation_score >= 80:
        rating = "High Impact"
        has_data = True
        data_status = "Robust multi-indicator evidence"
    elif innovation_score >= 50:
        rating = "Moderate Traction"
        has_data = True
        data_status = "Established technical momentum"
    else:
        rating = "Early Stage"
        has_data = True
        data_status = "Nascent technical activity"

    return {
        "technology": canonical,
        "canonical_name": canonical,
        "rating": rating,
        "has_data": has_data,
        "data_status": data_status,
        "innovation_score": round(innovation_score, 2),
        "factors": {
            "research_novelty": research_novelty,
            "patent_strength": patent_strength,
            "technology_maturity": maturity["score"],
            "market_potential": market_potential,
            "funding_relevance": funding_relevance
        },
        "technology_maturity": maturity,
        "evidence": {
            "patent_count": patent_count,
            "organization_count": organization_count,
            "inventor_count": inventor_count
        },
        "weights": {
            "research_novelty": 0.30,
            "patent_strength": 0.20,
            "technology_maturity": 0.15,
            "market_potential": 0.20,
            "funding_relevance": 0.15
        },
        "methodology": (
            "Innovation Score is calculated using "
            "Research Novelty (30%), Patent Strength "
            "(20%), Technology Maturity (15%), Market "
            "Potential (20%), and Funding Relevance "
            "(15%). The available patent dataset is "
            "used to derive activity-based proxies. "
            "These proxies should not be interpreted "
            "as direct measurements of commercial "
            "success or research novelty."
        )
    }


def get_innovation_score(technology: str) -> dict:
    technology = technology.strip()
    activity = get_patent_activity(technology)

    return _calculate_score_from_counts(
        canonical=activity.get("canonical_name", technology),
        patent_count=activity.get("patent_count", 0),
        organization_count=activity.get("organization_count", 0),
        inventor_count=activity.get("inventor_count", 0)
    )


def get_innovation_dashboard(force_refresh: bool = False) -> dict:
    now = time.time()
    # Check cache first (5-minute TTL)
    if not force_refresh and _dashboard_cache["data"] and (now - _dashboard_cache["timestamp"] < 300):
        return _dashboard_cache["data"]

    with _cache_lock:
        if not force_refresh and _dashboard_cache["data"] and (now - _dashboard_cache["timestamp"] < 300):
            return _dashboard_cache["data"]

        # High-performance single aggregation replaces 46 separate full-collection scans
        technologies = list(
            patents_collection.aggregate([
                {
                    "$match": {
                        "technology_field": {
                            "$nin": [None, ""],
                            "$regex": r"\S"
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
                    "$limit": 15
                }
            ])
        )

        results = []

        for item in technologies:
            technology = item["_id"]
            raw_orgs = item.get("organization_count", [])
            valid_orgs = [x for x in raw_orgs if x and str(x).strip()]
            p_count = item.get("patent_count", 0)
            org_count = len(valid_orgs)
            inv_count = item.get("inventor_count", 0)

            # In-memory computation: 0 extra database lookups needed
            score = _calculate_score_from_counts(
                canonical=technology,
                patent_count=p_count,
                organization_count=org_count,
                inventor_count=inv_count
            )

            results.append({
                "technology": technology,
                "innovation_score": score["innovation_score"],
                "patent_count": p_count,
                "organization_count": org_count,
                "factors": score["factors"]
            })

        results.sort(
            key=lambda x: x["innovation_score"],
            reverse=True
        )

        payload = {
            "technologies": results,
            "methodology": (
                "Scores are explainable and calculated "
                "from defined factors and weights. "
                "Activity-based measures are proxies "
                "derived from the available patent data."
            )
        }

        _dashboard_cache["data"] = payload
        _dashboard_cache["timestamp"] = time.time()
        return payload