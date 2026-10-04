from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.auth import get_current_user
from app.schemas.report import ReportPreviewResponse, ReportExportRequest
from app.services.report_service import (
    generate_funding_report,
    generate_patent_report,
    generate_research_trend_report,
    generate_innovation_report,
    generate_commercialization_report
)
from app.services.pdf_service import generate_pdf_report
from app.services.excel_service import generate_excel_report


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports & Export System"]
)


@router.get("/funding", response_model=ReportPreviewResponse)
def get_funding_report_preview(
    query: Optional[str] = Query("", description="Search term for project title, abstract, or agency"),
    domain: Optional[str] = Query("", description="Filter by research domain or agency"),
    organization: Optional[str] = Query("", description="Filter by organization"),
    funding_type: Optional[str] = Query("", description="Filter by funding mechanism"),
    start_year: Optional[int] = Query(None, description="Start fiscal year"),
    end_year: Optional[int] = Query(None, description="End fiscal year"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    Get Funding Report data and preview metrics.
    """
    filters = {
        "query": query,
        "domain": domain,
        "organization": organization,
        "funding_type": funding_type,
        "start_year": start_year,
        "end_year": end_year,
        "limit": limit
    }
    user_id = current_user["user_id"]
    return generate_funding_report(user_id, filters)


@router.get("/patents", response_model=ReportPreviewResponse)
def get_patent_report_preview(
    query: Optional[str] = Query("", description="Search patent number, title, or field"),
    domain: Optional[str] = Query("", description="Filter by technology sector or WIPO field"),
    organization: Optional[str] = Query("", description="Filter by assignee or organization"),
    start_year: Optional[int] = Query(None, description="Start filing year"),
    end_year: Optional[int] = Query(None, description="End filing year"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    Get Patent Report data and preview metrics.
    """
    filters = {
        "query": query,
        "domain": domain,
        "organization": organization,
        "start_year": start_year,
        "end_year": end_year,
        "limit": limit
    }
    user_id = current_user["user_id"]
    return generate_patent_report(user_id, filters)


@router.get("/research-trends", response_model=ReportPreviewResponse)
def get_research_trend_report_preview(
    query: Optional[str] = Query("", description="Search research publication title or concept"),
    domain: Optional[str] = Query("", description="Filter by research concept or domain"),
    start_year: Optional[int] = Query(None, description="Start publication year"),
    end_year: Optional[int] = Query(None, description="End publication year"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    Get Research Trend Report data and preview metrics.
    """
    filters = {
        "query": query,
        "domain": domain,
        "start_year": start_year,
        "end_year": end_year,
        "limit": limit
    }
    user_id = current_user["user_id"]
    return generate_research_trend_report(user_id, filters)


@router.get("/innovation", response_model=ReportPreviewResponse)
def get_innovation_report_preview(
    technology: Optional[str] = Query("", description="Target technology field to evaluate"),
    query: Optional[str] = Query("", description="Search term for technology"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    Get Cross-Domain Innovation Report data and sub-score metrics.
    """
    filters = {
        "technology": technology or query,
        "query": query,
        "limit": limit
    }
    user_id = current_user["user_id"]
    return generate_innovation_report(user_id, filters)


@router.get("/commercialization", response_model=ReportPreviewResponse)
def get_commercialization_report_preview(
    technology: Optional[str] = Query("", description="Target technology field for commercial pathways"),
    query: Optional[str] = Query("", description="Search term for technology"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    Get Commercialization Pathways Report data and evidence metrics.
    """
    filters = {
        "technology": technology or query,
        "query": query,
        "limit": limit
    }
    user_id = current_user["user_id"]
    return generate_commercialization_report(user_id, filters)


@router.post("/export/pdf")
def export_pdf_report(
    req: ReportExportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates and returns a downloadable executive PDF report.
    """
    user_id = current_user["user_id"]
    filters = req.model_dump()
    report_type = req.report_type.lower()

    if report_type == "funding":
        report_data = generate_funding_report(user_id, filters)
    elif report_type == "patents":
        report_data = generate_patent_report(user_id, filters)
    elif report_type == "research-trends":
        report_data = generate_research_trend_report(user_id, filters)
    elif report_type == "innovation":
        report_data = generate_innovation_report(user_id, filters)
    elif report_type == "commercialization":
        report_data = generate_commercialization_report(user_id, filters)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported report type '{req.report_type}'"
        )

    try:
        pdf_bytes = generate_pdf_report(report_data)
        filename = f"{report_type}_report.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )


@router.post("/export/excel")
def export_excel_report(
    req: ReportExportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates and returns a downloadable multi-sheet Excel spreadsheet (.xlsx).
    """
    user_id = current_user["user_id"]
    filters = req.model_dump()
    report_type = req.report_type.lower()

    if report_type == "funding":
        report_data = generate_funding_report(user_id, filters)
    elif report_type == "patents":
        report_data = generate_patent_report(user_id, filters)
    elif report_type == "research-trends":
        report_data = generate_research_trend_report(user_id, filters)
    elif report_type == "innovation":
        report_data = generate_innovation_report(user_id, filters)
    elif report_type == "commercialization":
        report_data = generate_commercialization_report(user_id, filters)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported report type '{req.report_type}'"
        )

    try:
        excel_bytes = generate_excel_report(report_data)
        filename = f"{report_type}_report.xlsx"
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Excel report: {str(e)}"
        )
