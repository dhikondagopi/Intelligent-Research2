from typing import List, Optional

from pydantic import BaseModel


class FundingResult(BaseModel):
    application_id: Optional[int] = None
    project_number: Optional[str] = None
    title: Optional[str] = None
    abstract: Optional[str] = None

    organization: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None

    fiscal_year: Optional[int] = None
    award_amount: float = 0

    funding_mechanism: Optional[str] = None
    activity_code: Optional[str] = None

    principal_investigators: List[str] = []


class FundingSearchResponse(BaseModel):
    total: int
    results: List[FundingResult]