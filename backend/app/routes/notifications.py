from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import get_current_user
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.services.notification_service import (
    get_user_notifications,
    get_unread_notifications,
    get_notification_by_id,
    mark_as_read,
    mark_all_as_read,
    generate_user_alerts
)

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notification System"]
)


@router.get("", response_model=NotificationListResponse)
@router.get("/", response_model=NotificationListResponse)
def list_notifications(
    type: Optional[str] = Query(
        None,
        description="Filter by notification type (FUNDING, PATENT, TECHNOLOGY, RESEARCH_TREND, COMMERCIALIZATION, PLATFORM)"
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Get paginated notifications for the authenticated user.
    """
    user_id = current_user["user_id"]
    return get_user_notifications(user_id=user_id, notification_type=type, page=page, limit=limit)


@router.get("/unread")
def get_unread(
    current_user: dict = Depends(get_current_user)
):
    """
    Get unread notification count and unread notifications for authenticated user.
    """
    user_id = current_user["user_id"]
    return get_unread_notifications(user_id)


@router.post("/generate-alerts")
def trigger_alert_generation(
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers automated alert generation based on real platform data and user's research interests.
    """
    user_id = current_user["user_id"]
    alerts = generate_user_alerts(user_id)
    return {
        "message": "Alert generation complete",
        "generated_count": len(alerts),
        "alerts": alerts
    }


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_single_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a single notification by ID. Validates user ownership.
    """
    user_id = current_user["user_id"]
    result = get_notification_by_id(user_id=user_id, notification_id=notification_id)

    if not result or result.get("_error") == "unauthorized":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return result


@router.patch("/read-all")
def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all notifications for the authenticated user as read.
    """
    user_id = current_user["user_id"]
    return mark_all_as_read(user_id)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_single_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a single notification as read. Validates user ownership.
    """
    user_id = current_user["user_id"]
    result = mark_as_read(user_id=user_id, notification_id=notification_id)

    if not result or result.get("_error") == "unauthorized":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return result
