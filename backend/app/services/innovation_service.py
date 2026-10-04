from app.database.connection import db


patents_collection = db["patents"]


def get_patent_activity(technology):

    patent_count = patents_collection.count_documents({
        "technology_field": technology
    })

    organizations = patents_collection.distinct(
        "assignee",
        {
            "technology_field": technology,
            "assignee": {
                "$nin": [None, ""]
            }
        }
    )

    organizations = [
        item for item in organizations
        if item
    ]

    inventor_result = list(
        patents_collection.aggregate([
            {
                "$match": {
                    "technology_field": technology
                }
            },
            {
                "$group": {
                    "_id": None,
                    "inventor_count": {
                        "$sum": "$inventor_count"
                    }
                }
            }
        ])
    )

    inventor_count = (
        inventor_result[0]["inventor_count"]
        if inventor_result
        else 0
    )

    return {
        "patent_count": patent_count,
        "organization_count": len(organizations),
        "inventor_count": inventor_count
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


def get_innovation_score(technology):

    technology = technology.strip()

    activity = get_patent_activity(
        technology
    )

    patent_count = activity["patent_count"]
    organization_count = activity[
        "organization_count"
    ]

    research_novelty = (
        calculate_research_novelty(
            patent_count,
            organization_count
        )
    )

    patent_strength = (
        calculate_patent_strength(
            patent_count
        )
    )

    maturity = calculate_technology_maturity(
        patent_count,
        organization_count
    )

    market_potential = (
        calculate_market_potential(
            patent_count,
            organization_count
        )
    )

    funding_relevance = (
        calculate_funding_relevance(
            patent_count,
            organization_count
        )
    )

    innovation_score = (
        research_novelty * 0.30
        + patent_strength * 0.20
        + maturity["score"] * 0.15
        + market_potential * 0.20
        + funding_relevance * 0.15
    )

    return {
        "technology": technology,

        "innovation_score": round(
            innovation_score,
            2
        ),

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
            "inventor_count": activity[
                "inventor_count"
            ]
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


def get_innovation_dashboard():

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

        organizations = [
            x
            for x in item.get(
                "organization_count",
                []
            )
            if x
        ]

        score = get_innovation_score(
            technology
        )

        results.append({
            "technology": technology,
            "innovation_score": score[
                "innovation_score"
            ],
            "patent_count": item[
                "patent_count"
            ],
            "organization_count": len(
                organizations
            ),
            "factors": score["factors"]
        })

    results.sort(
        key=lambda item: item[
            "innovation_score"
        ],
        reverse=True
    )

    return {
        "technologies": results,
        "methodology": (
            "Scores are explainable and calculated "
            "from defined factors and weights. "
            "Activity-based measures are proxies "
            "derived from the available patent data."
        )
    }