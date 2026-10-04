from fastapi import APIRouter, HTTPException, Query

from app.services.technology_service import (
    get_technology_overview,
    get_emerging_technologies,
    get_technology_details
)


router = APIRouter(
    prefix="/api/technology",
    tags=["Technology Intelligence"]
)


@router.get("/dashboard")
def technology_dashboard():
    return get_technology_overview()


@router.get("/emerging")
def emerging_technologies():
    return {
        "technologies": get_emerging_technologies()
    }


@router.get("/{technology}")
def technology_details(
    technology: str
):
    technology = technology.strip()

    if not technology:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )

    return get_technology_details(
        technology
    )