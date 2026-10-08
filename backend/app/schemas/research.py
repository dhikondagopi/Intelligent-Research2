from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class ResearchRecord(BaseModel):
    id: str
    source: str = "Unified"
    sources: List[str] = Field(default_factory=list)
    source_id: Dict[str, str] = Field(default_factory=dict)
    doi: Optional[str] = None
    title: str = "Untitled"
    abstract: Optional[str] = None
    authors: List[str] = Field(default_factory=list)
    institutions: List[str] = Field(default_factory=list)
    publication_date: Optional[str] = None
    year: Optional[int] = None
    publication_year: Optional[int] = None  # alias for backward compatibility
    venue: Optional[str] = None
    publisher: Optional[str] = None
    citation_count: int = 0
    cited_by_count: int = 0  # alias for backward compatibility
    references_count: int = 0
    topics: List[str] = Field(default_factory=list)
    concepts: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    open_access: Union[bool, Dict[str, Any], None] = None
    url: Optional[str] = None
    source_urls: Dict[str, str] = Field(default_factory=dict)
    orcid_ids: List[str] = Field(default_factory=list)
    ror_ids: List[str] = Field(default_factory=list)
    funders: List[Union[str, Dict[str, Any]]] = Field(default_factory=list)
    retrieved_at: Optional[str] = None
    openalex_id: Optional[str] = None  # for backward compatibility


class SourceStatusMeta(BaseModel):
    OpenAlex: str = "UNAVAILABLE"
    Crossref: str = "UNAVAILABLE"
    Semantic_Scholar: str = Field(default="UNAVAILABLE", alias="Semantic Scholar")


class MultiSourceMeta(BaseModel):
    sources: List[str] = Field(default_factory=list)
    source_status: Dict[str, str] = Field(default_factory=dict)
    counts: Dict[str, int] = Field(default_factory=dict)
    retrieved_at: str = ""
    errors: Dict[str, str] = Field(default_factory=dict)


class UnifiedResearchResponse(BaseModel):
    query: str
    total: int
    page: int = 1
    per_page: int = 20
    results: List[ResearchRecord] = Field(default_factory=list)
    meta: MultiSourceMeta


# Backwards compatibility models
class ResearchSearchResult(BaseModel):
    id: str
    title: str
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    cited_by_count: int = 0
    authors: List[str] = []
    institutions: List[str] = []
    concepts: List[str] = []
    sources: Optional[List[str]] = None
    source_urls: Optional[Dict[str, str]] = None


class ResearchSearchResponse(BaseModel):
    total: int
    results: List[ResearchSearchResult]