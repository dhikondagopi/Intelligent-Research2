from typing import List, Optional

from pydantic import BaseModel


class PatentResult(BaseModel):
    patent_id: str
    patent_title: Optional[str] = None
    patent_date: Optional[str] = None
    patent_type: Optional[str] = None
    patent_abstract: Optional[str] = None
    inventors: List[str] = []
    assignees: List[str] = []
    cpc_sections: List[str] = []


class PatentSearchResponse(BaseModel):
    total: int
    results: List[PatentResult]