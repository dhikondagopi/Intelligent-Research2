from urllib.parse import unquote
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

    clean_tech = unquote(technology).strip()

    if not clean_tech:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )

    return get_commercialization_analysis(
        clean_tech
    )


@router.get("/{technology}")
def commercialization_analysis(
    technology: str
):

    clean_tech = unquote(technology).strip()

    if not clean_tech:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )

    return get_commercialization_analysis(
        clean_tech
    )


@router.get("/{technology}/productization")
def productization(
    technology: str
):

    return get_productization(
        unquote(technology).strip()
    )


@router.get("/{technology}/licensing")
def licensing(
    technology: str
):

    return get_licensing(
        unquote(technology).strip()
    )


@router.get("/{technology}/startup")
def startup(
    technology: str
):

    return get_startup(
        unquote(technology).strip()
    )


@router.get("/{technology}/partnerships")
def partnerships(
    technology: str
):

    return get_partnerships(
        unquote(technology).strip()
    )