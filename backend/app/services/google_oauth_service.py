import base64
import hashlib
import hmac
import json
import os
import secrets
import threading
import time
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.core.security import SECRET_KEY, create_access_token
from app.database.connection import users_collection

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

# Cache for consumed state nonces to prevent replay attacks
_nonce_lock = threading.Lock()
_consumed_nonces: Dict[str, float] = {}


def _cleanup_expired_nonces():
    current_time = time.time()
    with _nonce_lock:
        expired_keys = [k for k, exp in _consumed_nonces.items() if exp < current_time]
        for k in expired_keys:
            del _consumed_nonces[k]


def get_google_client_id() -> str:
    return os.getenv("GOOGLE_CLIENT_ID", "").strip()


def get_google_client_secret() -> str:
    return os.getenv("GOOGLE_CLIENT_SECRET", "").strip()


def get_google_redirect_uri() -> str:
    return os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:8000/auth/google/callback"
    ).strip()


def get_primary_frontend_url() -> str:
    raw_env = os.getenv("FRONTEND_URL", "http://localhost:5173")
    origins = [o.strip().rstrip("/") for o in raw_env.split(",") if o.strip()]
    # Default to localhost:5173 for local vite dev if available in list
    for o in origins:
        if "5173" in o:
            return o
    return origins[0] if origins else "http://localhost:5173"


def create_oauth_state(frontend_url: Optional[str] = None) -> str:
    """
    Creates an HMAC-signed state token containing a random nonce,
    expiration timestamp, and the initiating frontend URL.
    """
    _cleanup_expired_nonces()
    target_frontend = (frontend_url or get_primary_frontend_url()).rstrip("/")
    nonce = secrets.token_urlsafe(24)
    exp = int(time.time()) + 600  # 10 minutes validity

    payload_dict = {
        "nonce": nonce,
        "exp": exp,
        "frontend_url": target_frontend
    }

    payload_json = json.dumps(payload_dict, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8").rstrip("=")

    sig = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode("utf-8").rstrip("=")

    return f"{payload_b64}.{sig_b64}"


def verify_oauth_state(state: str) -> Dict[str, Any]:
    """
    Verifies that the state parameter is valid, untampered, unexpired,
    and has not been consumed yet.
    """
    _cleanup_expired_nonces()

    if not state or "." not in state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing or malformed OAuth state parameter"
        )

    parts = state.split(".", 1)
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state structure"
        )

    payload_b64, sig_b64 = parts

    # Verify HMAC signature
    expected_sig = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("=")

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state signature"
        )

    # Decode payload
    try:
        padded_payload = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload_bytes = base64.urlsafe_b64decode(padded_payload)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not decode OAuth state payload"
        )

    exp = payload.get("exp", 0)
    if time.time() > exp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state parameter has expired"
        )

    nonce = payload.get("nonce")
    if not nonce:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state nonce"
        )

    # Replay protection
    with _nonce_lock:
        if nonce in _consumed_nonces:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth state parameter has already been used"
            )
        _consumed_nonces[nonce] = float(exp)

    return payload


def get_authorization_url(
    frontend_url: Optional[str] = None,
    redirect_uri: Optional[str] = None
) -> Tuple[str, str]:
    """
    Builds the Google OAuth 2.0 authorization URL and generates the state token.
    """
    client_id = get_google_client_id()
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured: GOOGLE_CLIENT_ID missing"
        )

    resolved_redirect_uri = (redirect_uri or get_google_redirect_uri()).strip()
    state = create_oauth_state(frontend_url=frontend_url)

    params = {
        "client_id": client_id,
        "redirect_uri": resolved_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account"
    }

    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return url, state


def exchange_code_for_tokens(
    code: str,
    redirect_uri: Optional[str] = None
) -> Dict[str, Any]:
    """
    Exchanges authorization code for Google tokens.
    """
    client_id = get_google_client_id()
    client_secret = get_google_client_secret()
    resolved_redirect_uri = (redirect_uri or get_google_redirect_uri()).strip()

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth credentials are not properly configured"
        )

    data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": resolved_redirect_uri,
        "grant_type": "authorization_code"
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(GOOGLE_TOKEN_URL, data=data)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Google token exchange failed: {resp.text}"
                )
            token_data = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network error communicating with Google token endpoint: {exc}"
        )

    if "id_token" not in token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google response did not include an ID token"
        )

    return token_data


def verify_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verifies the Google ID token via Google's tokeninfo endpoint,
    validating audience, issuer, email verification, and sub.
    """
    client_id = get_google_client_id()

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(
                GOOGLE_TOKENINFO_URL,
                params={"id_token": id_token}
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google ID token validation failed"
                )
            claims = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network error verifying Google ID token: {exc}"
        )

    # Validate Audience
    aud = claims.get("aud")
    if aud != client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token audience mismatch"
        )

    # Validate Issuer
    iss = claims.get("iss")
    if iss not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google ID token issuer"
        )

    # Validate Email verification
    email_verified = claims.get("email_verified")
    if email_verified not in [True, "true", "True", 1, "1"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google email address is not verified"
        )

    sub = claims.get("sub")
    email = claims.get("email")

    if not sub or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token missing subject or email claim"
        )

    return claims


def find_or_create_google_user(claims: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
    """
    Safely finds or creates a Google user in MongoDB:
    1. Checks by google_id: If found, returns existing user (prevents duplication).
    2. If not found by google_id, checks by email: If email exists with another
       auth provider/password, REJECTS authentication (prevents duplicate users
       and prevents automatic account linking based only on matching email).
    3. If neither exists, creates a new user with role 'researcher'.
    """
    google_id = str(claims["sub"]).strip()
    raw_email = str(claims["email"]).strip()
    email = raw_email.lower()
    name = (claims.get("name") or claims.get("given_name") or email.split("@")[0]).strip()

    # Step 1: Look up by google_id
    existing_by_google_id = users_collection.find_one({"google_id": google_id})
    if existing_by_google_id:
        return existing_by_google_id, False

    # Step 2: Look up by email (prevent duplicate users and prevent insecure auto-linking)
    existing_by_email = users_collection.find_one({
        "email": {"$regex": f"^{email}$", "$options": "i"}
    })
    if existing_by_email:
        # User already exists under email/password or different credential
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An account with this email already exists. "
                "Please log in using your original email and password."
            )
        )

    # Step 3: Create new user document
    new_user = {
        "name": name,
        "email": email,
        "google_id": google_id,
        "auth_provider": "google",
        "role": "researcher",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    result = users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    return new_user, True


def issue_user_session(user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Issues application JWT preserving existing roles.
    """
    user_id = str(user["_id"])
    role = user.get("role", "researcher")

    access_token = create_access_token({
        "user_id": user_id,
        "role": role
    })

    return {
        "message": "Google authentication successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": role
    }
