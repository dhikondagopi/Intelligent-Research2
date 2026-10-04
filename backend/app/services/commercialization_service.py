from app.database.connection import db


patents_collection = db["patents"]


def get_technology_data(technology):

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


def analyze_productization(data):

    patent_count = data["patent_count"]
    organization_count = data["organization_count"]

    if patent_count == 0:
        readiness = "Insufficient Evidence"
    elif patent_count >= 5000:
        readiness = "High Activity"
    elif patent_count >= 1000:
        readiness = "Moderate Activity"
    else:
        readiness = "Early Activity"

    return {
        "pathway": "Productization",

        "readiness": readiness,

        "evidence": {
            "patent_count": patent_count,
            "organization_count": organization_count
        },

        "signals": [
            "Patent activity",
            "Technology activity",
            "Organization activity"
        ],

        "recommended_actions": [
            "Validate the technology use case",
            "Identify a target customer problem",
            "Develop a proof of concept",
            "Evaluate product requirements",
            "Assess intellectual property constraints"
        ],

        "note": (
            "Productization suitability is an "
            "evidence-based pathway assessment. "
            "It does not guarantee commercial success."
        )
    }


def analyze_licensing(data):

    patent_count = data["patent_count"]
    organization_count = data["organization_count"]

    if patent_count >= 3000 and organization_count >= 20:
        readiness = "Strong Licensing Signal"

    elif patent_count >= 1000:
        readiness = "Potential Licensing Signal"

    elif patent_count > 0:
        readiness = "Early Licensing Signal"

    else:
        readiness = "Insufficient Evidence"

    return {
        "pathway": "Licensing",

        "readiness": readiness,

        "evidence": {
            "patent_count": patent_count,
            "organization_count": organization_count
        },

        "signals": [
            "Patent portfolio activity",
            "Organization participation",
            "Technology field activity"
        ],

        "recommended_actions": [
            "Review patent ownership",
            "Identify potentially interested organizations",
            "Evaluate licensing scope",
            "Assess freedom-to-operate requirements",
            "Prepare an intellectual property summary"
        ],

        "note": (
            "Licensing analysis identifies signals "
            "that may justify further licensing "
            "investigation. It is not a legal or "
            "commercial licensing recommendation."
        )
    }


def analyze_startup(data):

    patent_count = data["patent_count"]
    organization_count = data["organization_count"]

    if patent_count >= 5000 and organization_count >= 30:
        readiness = "High Technology Activity"

    elif patent_count >= 1000:
        readiness = "Moderate Technology Activity"

    elif patent_count > 0:
        readiness = "Early Technology Activity"

    else:
        readiness = "Insufficient Evidence"

    return {
        "pathway": "Startup Creation",

        "readiness": readiness,

        "evidence": {
            "patent_count": patent_count,
            "organization_count": organization_count
        },

        "signals": [
            "Technology activity",
            "Organization activity",
            "Patent activity"
        ],

        "recommended_actions": [
            "Identify a specific market problem",
            "Define the startup value proposition",
            "Build a minimum viable product",
            "Validate the target customer segment",
            "Assess intellectual property ownership"
        ],

        "note": (
            "Startup pathway analysis identifies "
            "technology signals for further validation. "
            "It does not predict startup success."
        )
    }


def analyze_partnership(data):

    patent_count = data["patent_count"]
    organization_count = data["organization_count"]

    if organization_count >= 30:
        readiness = "High Partnership Activity"

    elif organization_count >= 10:
        readiness = "Moderate Partnership Activity"

    elif organization_count > 0:
        readiness = "Early Partnership Activity"

    else:
        readiness = "Insufficient Evidence"

    return {
        "pathway": "Industry Partnership",

        "readiness": readiness,

        "evidence": {
            "patent_count": patent_count,
            "organization_count": organization_count
        },

        "signals": [
            "Organization activity",
            "Patent activity",
            "Technology participation"
        ],

        "recommended_actions": [
            "Identify organizations active in the technology",
            "Map potential industry use cases",
            "Identify collaboration opportunities",
            "Prepare a technology capability summary",
            "Evaluate partnership requirements"
        ],

        "note": (
            "Partnership analysis identifies organizations "
            "and activity signals for further investigation. "
            "It does not guarantee partnership opportunities."
        )
    }


def get_commercialization_analysis(technology):

    technology = technology.strip()

    data = get_technology_data(
        technology
    )

    productization = analyze_productization(
        data
    )

    licensing = analyze_licensing(
        data
    )

    startup = analyze_startup(
        data
    )

    partnership = analyze_partnership(
        data
    )

    return {
        "technology": technology,

        "evidence": data,

        "pathways": {
            "productization": productization,
            "licensing": licensing,
            "startup": startup,
            "industry_partnership": partnership
        },

        "methodology": (
            "Commercialization pathways are derived "
            "from patent activity and organization "
            "activity available in the dataset. "
            "The analysis is intended for opportunity "
            "screening and further investigation, not "
            "as a guarantee of commercialization success."
        )
    }


def get_productization(technology):

    data = get_technology_data(
        technology
    )

    return analyze_productization(data)


def get_licensing(technology):

    data = get_technology_data(
        technology
    )

    return analyze_licensing(data)


def get_startup(technology):

    data = get_technology_data(
        technology
    )

    return analyze_startup(data)


def get_partnerships(technology):

    data = get_technology_data(
        technology
    )

    return analyze_partnership(data)