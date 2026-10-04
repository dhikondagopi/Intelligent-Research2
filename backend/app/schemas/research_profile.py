from typing import List, Optional

from pydantic import BaseModel


class ResearchProfileCreate(BaseModel):
    affiliation: Optional[str] = ""
    department: Optional[str] = ""
    bio: Optional[str] = ""
    research_interests: List[str] = []
    skills: List[str] = []
    orcid: Optional[str] = ""


class ResearchProfileResponse(BaseModel):
    user_id: str
    affiliation: str
    department: str
    bio: str
    research_interests: List[str]
    skills: List[str]
    orcid: str