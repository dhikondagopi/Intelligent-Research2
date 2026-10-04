from fastapi import APIRouter, HTTPException

from app.services.commercialization_service import (
    get_commercialization_analysis,
    get_productization,
    get_licensing,
    get_startup,
    get_partnerships
)


router = APIRouter(
    prefix="/api/v1/commercialization",
    tags=["Commercialization"]
)


@router.get("/dashboard/{technology}")
def commercialization_dashboard(
    technology: str
):

    technology = technology.strip()

    if not technology:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )

    return get_commercialization_analysis(
        technology
    )


@router.get("/{technology}")
def commercialization_analysis(
    technology: str
):

    technology = technology.strip()

    if not technology:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )

    return get_commercialization_analysis(
        technology
    )


@router.get("/{technology}/productization")
def productization(
    technology: str
):

    return get_productization(
        technology.strip()
    )


@router.get("/{technology}/licensing")
def licensing(
    technology: str
):

    return get_licensing(
        technology.strip()
    )


@router.get("/{technology}/startup")
def startup(
    technology: str
):

    return get_startup(
        technology.strip()
    )


@router.get("/{technology}/partnerships")
def partnerships(
    technology: str
):

    return get_partnerships(
        technology.strip()
    )