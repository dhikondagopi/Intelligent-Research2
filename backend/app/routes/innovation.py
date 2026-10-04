from fastapi import APIRouter, HTTPException

from app.services.innovation_service import (
    get_innovation_dashboard,
    get_innovation_score
)


router = APIRouter(
    prefix="/api/innovation",
    tags=["Innovation Scoring"]
)


@router.get("/dashboard")
def innovation_dashboard():

    return get_innovation_dashboard()


@router.get("/{technology}")
def innovation_details(
    technology: str
):

    technology = technology.strip()

    if not technology:

        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )

    return get_innovation_score(
        technology
    )