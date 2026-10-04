from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ReportFilterParams(BaseModel):
    query: Optional[str] = ""
    domain: Optional[str] = ""
    technology: Optional[str] = ""
    organization: Optional[str] = ""
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    funding_type: Optional[str] = ""
    limit: Optional[int] = 50


class ReportExportRequest(BaseModel):
    report_type: str = Field(..., description="funding, patents, research-trends, innovation, commercialization")
    query: Optional[str] = ""
    domain: Optional[str] = ""
    technology: Optional[str] = ""
    organization: Optional[str] = ""
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    funding_type: Optional[str] = ""
    limit: Optional[int] = 50


class MetricCard(BaseModel):
    label: str
    value: str
    subtext: Optional[str] = ""


class ReportPreviewResponse(BaseModel):
    report_type: str
    title: str
    generated_at: str
    user_name: str
    filters_applied: Dict[str, Any]
    summary: str
    metrics: List[MetricCard]
    records: List[Dict[str, Any]]
    chart_data: Optional[Dict[str, Any]] = {}
    methodology: Optional[str] = ""
