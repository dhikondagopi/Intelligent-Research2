from typing import List, Optional

from pydantic import BaseModel


class ResearchSearchResult(BaseModel):
    id: str
    title: str
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    cited_by_count: int = 0
    authors: List[str] = []
    institutions: List[str] = []
    concepts: List[str] = []


class ResearchSearchResponse(BaseModel):
    total: int
    results: List[ResearchSearchResult]