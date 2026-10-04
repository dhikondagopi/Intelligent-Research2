from bson import ObjectId
from bson.errors import InvalidId

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import decode_access_token
from app.database.connection import users_collection


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # -----------------------------------------
    # Get JWT token
    # -----------------------------------------

    token = credentials.credentials


    # -----------------------------------------
    # Decode JWT
    # -----------------------------------------

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


    # -----------------------------------------
    # Get user ID from token
    # -----------------------------------------

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


    # -----------------------------------------
    # Validate MongoDB ObjectId
    # -----------------------------------------

    try:
        object_id = ObjectId(user_id)

    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in authentication token"
        )


    # -----------------------------------------
    # Find user
    # -----------------------------------------

    user = users_collection.find_one({
        "_id": object_id
    })


    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )


    # -----------------------------------------
    # Return authenticated user
    # -----------------------------------------

    return {
        "user_id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "researcher")
    }