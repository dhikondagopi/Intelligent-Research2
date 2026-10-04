from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: str
    notification_type: str = Field(..., description="FUNDING, PATENT, TECHNOLOGY, RESEARCH_TREND, COMMERCIALIZATION, PLATFORM")
    title: str
    message: str
    related_module: str
    related_record_id: Optional[str] = ""
    priority: Optional[str] = "medium"
    link: Optional[str] = ""
    metadata: Optional[Dict[str, Any]] = None
    deduplication_key: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    notification_type: str
    title: str
    message: str
    related_module: str
    related_record_id: Optional[str] = ""
    created_at: str
    is_read: bool = False
    priority: str = "medium"
    link: Optional[str] = ""
    metadata: Optional[Dict[str, Any]] = {}
    deduplication_key: Optional[str] = ""


class NotificationListResponse(BaseModel):
    total: int
    page: int
    limit: int
    unread_count: int
    notifications: List[NotificationResponse]
