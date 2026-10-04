from app.database.connection import db


patents_collection = db["patents"]
users_collection = db["users"]


def get_common_statistics():
    """
    Generate common dashboard statistics from the patent database.

    The statistics are calculated dynamically from MongoDB.
    """

    # -----------------------------------------
    # Total patents
    # -----------------------------------------

    total_patents = patents_collection.count_documents({})


    # -----------------------------------------
    # Organizations + Technologies
    # -----------------------------------------

    organization_result = patents_collection.aggregate([
        {
            "$match": {
                "assignee": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$assignee"
            }
        },
        {
            "$count": "total"
        }
    ])

    organization_result = list(organization_result)

    total_organizations = (
        organization_result[0]["total"]
        if organization_result
        else 0
    )


    technology_result = patents_collection.aggregate([
        {
            "$match": {
                "technology_field": {
                    "$nin": [None, ""]
                }
            }
        },
        {
            "$group": {
                "_id": "$technology_field"
            }
        },
        {
            "$count": "total"
        }
    ])

    technology_result = list(technology_result)

    total_technologies = (
        technology_result[0]["total"]
        if technology_result
        else 0
    )


    # -----------------------------------------
    # Total inventors
    # -----------------------------------------

    inventor_result = patents_collection.aggregate([
        {
            "$group": {
                "_id": None,
                "total": {
                    "$sum": {
                        "$convert": {
                            "input": "$inventor_count",
                            "to": "int",
                            "onError": 0,
                            "onNull": 0
                        }
                    }
                }
            }
        }
    ])

    inventor_result = list(inventor_result)

    total_inventors = (
        inventor_result[0]["total"]
        if inventor_result
        else 0
    )


    return {
        "total_patents": total_patents,
        "total_organizations": total_organizations,
        "total_technologies": total_technologies,
        "total_inventors": total_inventors
    }


# =========================================================
# Researcher Dashboard
# =========================================================

def get_researcher_dashboard():

    return {
        "role": "researcher",

        "title": "Researcher Dashboard",

        "statistics": get_common_statistics(),

        "focus": [
            "Research Intelligence",
            "Emerging Technologies",
            "Patent Intelligence",
            "Innovation Opportunities"
        ],

        "quick_actions": [
            {
                "title": "Research Intelligence",
                "route": "/research"
            },
            {
                "title": "Technology Intelligence",
                "route": "/technology"
            },
            {
                "title": "Patent Intelligence",
                "route": "/patents"
            },
            {
                "title": "Innovation Scoring",
                "route": "/innovation"
            }
        ]
    }


# =========================================================
# Startup Founder Dashboard
# =========================================================

def get_startup_dashboard():

    return {
        "role": "startup_founder",

        "title": "Startup Founder Dashboard",

        "statistics": get_common_statistics(),

        "focus": [
            "Emerging Technologies",
            "Innovation Opportunities",
            "Commercialization",
            "Competitive Technology Monitoring"
        ],

        "quick_actions": [
            {
                "title": "Emerging Technologies",
                "route": "/technology/emerging"
            },
            {
                "title": "Innovation Scoring",
                "route": "/innovation"
            },
            {
                "title": "Technology Intelligence",
                "route": "/technology"
            }
        ]
    }


# =========================================================
# Innovation Manager Dashboard
# =========================================================

def get_innovation_manager_dashboard():

    return {
        "role": "innovation_manager",

        "title": "Innovation Manager Dashboard",

        "statistics": get_common_statistics(),

        "focus": [
            "Technology Maturity",
            "Technology Adoption",
            "Competitive Monitoring",
            "Commercialization"
        ],

        "quick_actions": [
            {
                "title": "Technology Intelligence",
                "route": "/technology"
            },
            {
                "title": "Innovation Scoring",
                "route": "/innovation"
            },
            {
                "title": "Commercialization",
                "route": "/commercialization"
            }
        ]
    }


# =========================================================
# Admin Dashboard
# =========================================================

def get_admin_dashboard():

    statistics = get_common_statistics()


    # -----------------------------------------
    # Total users
    # -----------------------------------------

    total_users = users_collection.count_documents({})


    # -----------------------------------------
    # Users by role
    # -----------------------------------------

    roles = list(
        users_collection.aggregate([
            {
                "$group": {
                    "_id": "$role",
                    "count": {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    "count": -1
                }
            }
        ])
    )


    return {
        "role": "admin",

        "title": "Admin Dashboard",

        "statistics": {
            **statistics,
            "total_users": total_users
        },

        "user_roles": [
            {
                "role": item["_id"],
                "count": item["count"]
            }
            for item in roles
        ],

        "focus": [
            "Platform Overview",
            "User Management",
            "Research Data",
            "Technology Data"
        ]
    }


# =========================================================
# Role Dashboard Router
# =========================================================

def get_role_dashboard(role):

    role = role.lower().strip()


    if role == "researcher":

        return get_researcher_dashboard()


    if role in [
        "startup",
        "startup_founder"
    ]:

        return get_startup_dashboard()


    if role in [
        "innovation_manager",
        "innovation manager"
    ]:

        return get_innovation_manager_dashboard()


    if role == "admin":

        return get_admin_dashboard()


    return {
        "role": role,

        "title": "Dashboard",

        "statistics": get_common_statistics(),

        "focus": [],

        "quick_actions": []
    }