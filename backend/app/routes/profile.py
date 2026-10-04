from fastapi import APIRouter

from app.database.connection import (
    research_profiles_collection
)

from app.schemas.research_profile import (
    ResearchProfileCreate
)


router = APIRouter(
    prefix="/api/profile",
    tags=["Research Profile"]
)


@router.get("/{user_id}")
def get_profile(user_id: str):

    profile = research_profiles_collection.find_one({
        "user_id": user_id
    })

    if not profile:

        return {
            "user_id": user_id,
            "affiliation": "",
            "department": "",
            "bio": "",
            "research_interests": [],
            "skills": [],
            "orcid": ""
        }

    return {
        "user_id": profile["user_id"],
        "affiliation": profile.get(
            "affiliation",
            ""
        ),
        "department": profile.get(
            "department",
            ""
        ),
        "bio": profile.get(
            "bio",
            ""
        ),
        "research_interests": profile.get(
            "research_interests",
            []
        ),
        "skills": profile.get(
            "skills",
            []
        ),
        "orcid": profile.get(
            "orcid",
            ""
        )
    }


@router.put("/{user_id}")
def update_profile(
    user_id: str,
    profile: ResearchProfileCreate
):

    profile_data = {
        "user_id": user_id,
        "affiliation": profile.affiliation,
        "department": profile.department,
        "bio": profile.bio,
        "research_interests":
            profile.research_interests,
        "skills": profile.skills,
        "orcid": profile.orcid
    }

    existing_profile = (
        research_profiles_collection.find_one({
            "user_id": user_id
        })
    )

    if existing_profile:

        research_profiles_collection.update_one(
            {"user_id": user_id},
            {"$set": profile_data}
        )

        return {
            "message": "Research profile updated",
            "profile": profile_data
        }

    research_profiles_collection.insert_one(
        profile_data
    )

    profile_data.pop("_id", None)

    return {
        "message": "Research profile created",
        "profile": profile_data
    }