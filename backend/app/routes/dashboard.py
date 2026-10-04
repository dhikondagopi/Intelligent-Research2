from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.services.dashboard_service import get_role_dashboard


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Role-Based Dashboard"]
)


@router.get("/me")
def my_dashboard(
    current_user: dict = Depends(get_current_user)
):

    role = current_user["role"]

    dashboard = get_role_dashboard(role)

    dashboard["user"] = {
        "user_id": current_user["user_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

    return dashboard


@router.get("/{role}")
def role_dashboard(
    role: str,
    current_user: dict = Depends(get_current_user)
):

    requested_role = role.strip().lower()
    actual_role = current_user["role"].strip().lower()

    if requested_role != actual_role:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this dashboard"
        )

    return get_role_dashboard(actual_role)