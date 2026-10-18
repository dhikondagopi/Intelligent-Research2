from urllib.parse import unquote
from fastapi import APIRouter, HTTPException

from app.services.technology_service import (
    get_technology_overview,
    get_emerging_technologies_payload,
    get_technology_details,
    get_technology_maturity,
    get_technology_adoption,
    get_technology_opportunities,
    get_technology_competitors
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
    return get_emerging_technologies_payload()


@router.get("/opportunities")
def generic_opportunities():
    return get_technology_opportunities()


@router.get("/{technology}/maturity")
def technology_maturity_endpoint(technology: str):
    technology_name = unquote(technology).strip()
    if not technology_name:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )
    result = get_technology_maturity(technology_name)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Technology domain '{technology_name}' not found"
        )
    return result


@router.get("/{technology}/adoption")
def technology_adoption_endpoint(technology: str):
    technology_name = unquote(technology).strip()
    if not technology_name:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )
    result = get_technology_adoption(technology_name)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Technology domain '{technology_name}' not found"
        )
    return result


@router.get("/{technology}/opportunities")
def technology_opportunities_endpoint(technology: str):
    technology_name = unquote(technology).strip()
    if not technology_name:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )
    result = get_technology_opportunities(technology_name)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Technology domain '{technology_name}' not found"
        )
    return result


@router.get("/{technology}/competitors")
def technology_competitors_endpoint(technology: str):
    technology_name = unquote(technology).strip()
    if not technology_name:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )
    result = get_technology_competitors(technology_name)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Technology domain '{technology_name}' not found"
        )
    return result


@router.get("/{technology}")
def technology_details_endpoint(technology: str):
    technology_name = unquote(technology).strip()
    if not technology_name:
        raise HTTPException(
            status_code=400,
            detail="Technology name is required"
        )
    result = get_technology_details(technology_name)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Technology domain '{technology_name}' not found"
        )
    return result