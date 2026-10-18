import os
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import RedirectResponse

from app.database.connection import users_collection
from app.schemas.user import UserRegister, UserLogin
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.services.google_oauth_service import (
    get_authorization_url,
    verify_oauth_state,
    exchange_code_for_tokens,
    verify_id_token,
    find_or_create_google_user,
    issue_user_session,
    get_primary_frontend_url
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# Auxiliary router to guarantee exact callback route matches http://localhost:8000/auth/google/callback
google_oauth_router = APIRouter(
    prefix="/auth/google",
    tags=["Google OAuth"]
)


@router.post("/register")
def register(user: UserRegister):

    if users_collection.find_one({
        "email": user.email
    }):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Disallow self-assignment of administrator role via public registration
    requested_role = (user.role or "researcher").strip().lower()
    if requested_role in ["admin", "administrator", "system_admin"]:
        assigned_role = "researcher"
    else:
        assigned_role = requested_role

    result = users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": assigned_role
    })

    return {
        "message": "Registration successful",
        "user_id": str(result.inserted_id)
    }


@router.post("/login")
def login(user: UserLogin):

    db_user = users_collection.find_one({
        "email": user.email
    })

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "user_id": str(db_user["_id"]),
        "role": db_user["role"]
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(db_user["_id"]),
        "name": db_user["name"],
        "email": db_user["email"],
        "role": db_user["role"]
    }


# ----------------------------------------------------
# Google OAuth 2.0 / OpenID Connect Endpoints
# ----------------------------------------------------

@router.get("/google/url")
def get_google_auth_url(
    frontend_url: Optional[str] = Query(None)
):
    """
    Returns the Google authorization URL and state for frontend clients.
    """
    auth_url, state = get_authorization_url(frontend_url=frontend_url)
    return {
        "authorization_url": auth_url,
        "state": state
    }


def _handle_google_login(frontend_url: Optional[str] = None):
    auth_url, _ = get_authorization_url(frontend_url=frontend_url)
    return RedirectResponse(url=auth_url, status_code=303)


@router.get("/google/login")
def google_login_api(frontend_url: Optional[str] = Query(None)):
    """
    Initiates Google OAuth 2.0 flow with redirect to Google consent screen.
    """
    return _handle_google_login(frontend_url)


@google_oauth_router.get("/login")
def google_login_direct(frontend_url: Optional[str] = Query(None)):
    """
    Direct endpoint /auth/google/login for initiating OAuth flow.
    """
    return _handle_google_login(frontend_url)


def _process_google_callback(
    request: Request,
    code: Optional[str],
    state: Optional[str],
    error: Optional[str],
    error_description: Optional[str],
    redirect: Optional[bool]
):
    accept_header = request.headers.get("accept", "")
    wants_json = (redirect is False) or ("application/json" in accept_header and not redirect)
    fallback_frontend = get_primary_frontend_url()

    def make_error_response(status_code: int, err_code: str, detail_msg: str):
        if wants_json:
            raise HTTPException(status_code=status_code, detail=detail_msg)
        params = urlencode({
            "error": err_code,
            "error_description": detail_msg
        })
        return RedirectResponse(
            url=f"{fallback_frontend}/login?{params}",
            status_code=303
        )

    # 1. Handle error response from Google (e.g. user cancelled)
    if error:
        err_msg = error_description or "Google authorization was cancelled or denied"
        return make_error_response(400, error, err_msg)

    # 2. Validate presence of code and state
    if not code:
        return make_error_response(400, "missing_code", "Authorization code missing from Google callback")
    if not state:
        return make_error_response(400, "missing_state", "State parameter missing from Google callback")

    # 3. Validate state parameter (CSRF & Replay protection)
    try:
        state_payload = verify_oauth_state(state)
        target_frontend = state_payload.get("frontend_url") or fallback_frontend
    except HTTPException as exc:
        return make_error_response(exc.status_code, "invalid_state", exc.detail)
    except Exception as exc:
        return make_error_response(400, "invalid_state", str(exc))

    # 4. Exchange authorization code for tokens
    try:
        tokens = exchange_code_for_tokens(code)
    except HTTPException as exc:
        return make_error_response(exc.status_code, "token_exchange_failed", exc.detail)
    except Exception as exc:
        return make_error_response(500, "token_exchange_failed", str(exc))

    # 5. Verify ID token authenticity and claims
    id_token = tokens.get("id_token")
    if not id_token:
        return make_error_response(400, "missing_id_token", "Google response did not include ID token")

    try:
        claims = verify_id_token(id_token)
    except HTTPException as exc:
        return make_error_response(exc.status_code, "invalid_token", exc.detail)
    except Exception as exc:
        return make_error_response(500, "invalid_token", str(exc))

    # 6. Find or create user safely in MongoDB
    try:
        user, _ = find_or_create_google_user(claims)
    except HTTPException as exc:
        # e.g. 409 Conflict if email already exists with password auth
        return make_error_response(exc.status_code, "account_exists_password", exc.detail)
    except Exception as exc:
        return make_error_response(500, "auth_failed", str(exc))

    # 7. Issue application JWT token
    session_data = issue_user_session(user)

    if wants_json:
        return session_data

    # 8. Redirect browser to frontend with credentials
    redirect_params = urlencode({
        "token": session_data["access_token"],
        "user_id": session_data["user_id"],
        "name": session_data["name"],
        "email": session_data["email"],
        "role": session_data["role"]
    })

    return RedirectResponse(
        url=f"{target_frontend}/login?{redirect_params}",
        status_code=303
    )


@router.get("/google/callback")
def google_callback_api(
    request: Request,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    redirect: Optional[bool] = Query(None)
):
    """
    Google OAuth callback endpoint mounted at /api/auth/google/callback.
    """
    return _process_google_callback(
        request=request,
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        redirect=redirect
    )


@google_oauth_router.get("/callback")
def google_callback_direct(
    request: Request,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    redirect: Optional[bool] = Query(None)
):
    """
    Exact Google OAuth callback endpoint matching http://localhost:8000/auth/google/callback.
    """
    return _process_google_callback(
        request=request,
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        redirect=redirect
    )